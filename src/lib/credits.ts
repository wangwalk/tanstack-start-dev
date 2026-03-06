import { eq, desc, lt, and, isNull, or, gt, lte, asc, sql } from 'drizzle-orm'
import { db } from '#/db/index'
import {
  creditBalance,
  creditTransaction,
  creditAllocation,
} from '#/db/schema'
import { userFn } from '#/lib/server-fn'
import { REGISTER_GIFT_CREDITS } from '#/config/billing'

function generateId() {
  return crypto.randomUUID()
}

// D1 transactions use a batch-style API. The `tx` object has the same
// query-builder interface as `db`, so all existing queries work as-is.
// SQLite/D1 is single-writer, so FOR UPDATE locks are unnecessary.

// Only purchase/register_gift go through addCredits.
// Monthly distribution has its own idempotent path via distributeMonthlyCredits.
type AddCreditSource = 'purchase' | 'register_gift'

function formatPeriodKey(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function getMonthEndExpiry(from?: Date): Date {
  const d = from ?? new Date()
  // Last millisecond of the current UTC month
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1) - 1)
}

export const getCreditBalance = userFn().handler(async ({ context }) => {
  const userId = context.user.id
  const [row] = await db
    .select()
    .from(creditBalance)
    .where(eq(creditBalance.userId, userId))
    .limit(1)

  if (row) return row

  // Upsert: create balance row for new user
  const now = new Date()
  const [inserted] = await db
    .insert(creditBalance)
    .values({ id: generateId(), userId, balance: 0, updatedAt: now })
    .onConflictDoNothing()
    .returning()

  // If concurrent insert won the race, fetch the existing row
  if (!inserted) {
    const [existing] = await db
      .select()
      .from(creditBalance)
      .where(eq(creditBalance.userId, userId))
      .limit(1)
    return existing!
  }

  return inserted
})

export const consumeCredits = userFn({ method: 'POST' })
  .inputValidator((input: { amount: number; description: string }) => input)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const { amount, description } = data

    if (amount <= 0) throw new Error('Amount must be positive')

    const result = await db.transaction(async (tx) => {
      // 1. Read the balance row
      const [row] = await tx
        .select()
        .from(creditBalance)
        .where(eq(creditBalance.userId, userId))
        .limit(1)

      const now = new Date()

      // 2. Expire allocations past their expiry
      const expired = await tx
        .select()
        .from(creditAllocation)
        .where(
          and(
            eq(creditAllocation.userId, userId),
            gt(creditAllocation.remaining, 0),
            lte(creditAllocation.expiresAt, now),
          ),
        )

      let expiredSum = 0
      for (const alloc of expired) {
        expiredSum += alloc.remaining
        await tx
          .update(creditAllocation)
          .set({ remaining: 0 })
          .where(eq(creditAllocation.id, alloc.id))
        await tx.insert(creditTransaction).values({
          id: generateId(),
          userId,
          amount: -alloc.remaining,
          type: 'expire',
          description: 'Credits expired',
          source: null,
          expiresAt: null,
          createdAt: now,
        })
      }

      // 3. Compute effective balance after expiry, update if needed
      const currentBalance = (row?.balance ?? 0) - expiredSum
      if (expiredSum > 0 && row) {
        await tx
          .update(creditBalance)
          .set({ balance: currentBalance, updatedAt: now })
          .where(eq(creditBalance.userId, userId))
      }

      if (currentBalance < amount) {
        throw new Error('Insufficient credits')
      }

      // 4. FIFO: soonest-expiring first; NULL (never-expiring) last
      // SQLite has no NULLS LAST — use CASE expression instead
      const allocations = await tx
        .select()
        .from(creditAllocation)
        .where(
          and(
            eq(creditAllocation.userId, userId),
            gt(creditAllocation.remaining, 0),
            or(
              isNull(creditAllocation.expiresAt),
              gt(creditAllocation.expiresAt, now),
            ),
          ),
        )
        .orderBy(
          asc(sql`CASE WHEN ${creditAllocation.expiresAt} IS NULL THEN 1 ELSE 0 END`),
          asc(creditAllocation.expiresAt),
          asc(creditAllocation.createdAt),
        )

      // 5. Deduct from allocations in order
      let remaining = amount
      for (const alloc of allocations) {
        if (remaining <= 0) break
        const deduct = Math.min(alloc.remaining, remaining)
        remaining -= deduct
        await tx
          .update(creditAllocation)
          .set({ remaining: alloc.remaining - deduct })
          .where(eq(creditAllocation.id, alloc.id))
      }

      const newBalance = currentBalance - amount

      // 6. Record the consumption
      await tx.insert(creditTransaction).values({
        id: generateId(),
        userId,
        amount: -amount,
        type: 'consume',
        description,
        source: null,
        expiresAt: null,
        createdAt: now,
      })

      // 7. Update balance — row must exist at this point
      if (!row) {
        throw new Error('Balance row missing — cannot write after consume')
      }
      await tx
        .update(creditBalance)
        .set({ balance: newBalance, updatedAt: now })
        .where(eq(creditBalance.userId, userId))

      return { balance: newBalance }
    })

    return result
  })

export const getCreditTransactions = userFn()
  .inputValidator(
    (input: { limit?: number; cursor?: string }) => input,
  )
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const limit = data.limit ?? 20

    // Validate cursor before passing to DB
    const cursorDate = data.cursor ? new Date(data.cursor) : undefined
    if (cursorDate && isNaN(cursorDate.getTime())) {
      throw new Error('Invalid cursor')
    }

    const conditions = cursorDate
      ? and(
          eq(creditTransaction.userId, userId),
          lt(creditTransaction.createdAt, cursorDate),
        )
      : eq(creditTransaction.userId, userId)

    const rows = await db
      .select()
      .from(creditTransaction)
      .where(conditions)
      .orderBy(desc(creditTransaction.createdAt))
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const items = hasMore ? rows.slice(0, limit) : rows
    const nextCursor =
      hasMore ? items[items.length - 1]!.createdAt.toISOString() : undefined

    return { items, nextCursor }
  })

// Internal helper — called by Stripe webhook and auth hook only.
// For monthly quota distribution use distributeMonthlyCredits instead.
export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  source: AddCreditSource,
  expiresAt?: Date,
): Promise<void> {
  const now = new Date()

  await db.transaction(async (tx) => {
    // Read balance row
    const [row] = await tx
      .select()
      .from(creditBalance)
      .where(eq(creditBalance.userId, userId))
      .limit(1)

    const currentBalance = row?.balance ?? 0
    const newBalance = currentBalance + amount

    // Insert allocation
    await tx.insert(creditAllocation).values({
      id: generateId(),
      userId,
      amount,
      remaining: amount,
      source,
      periodKey: null,
      expiresAt: expiresAt ?? null,
      createdAt: now,
    })

    // Update balance
    if (row) {
      await tx
        .update(creditBalance)
        .set({ balance: newBalance, updatedAt: now })
        .where(eq(creditBalance.userId, userId))
    } else {
      await tx.insert(creditBalance).values({
        id: generateId(),
        userId,
        balance: newBalance,
        updatedAt: now,
      })
    }

    // Record transaction
    await tx.insert(creditTransaction).values({
      id: generateId(),
      userId,
      amount,
      type: source === 'purchase' ? 'purchase' : 'bonus',
      description,
      source,
      expiresAt: expiresAt ?? null,
      createdAt: now,
    })
  })
}

export async function addRegisterGiftCredits(userId: string): Promise<void> {
  await addCredits(
    userId,
    REGISTER_GIFT_CREDITS,
    '注册赠送',
    'register_gift',
    // no expiresAt → never expires
  )
}

export async function distributeMonthlyCredits(
  userId: string,
  source: 'subscription_monthly' | 'lifetime_monthly',
  amount: number,
): Promise<{ distributed: boolean }> {
  const now = new Date()
  const periodKey = formatPeriodKey(now)
  const expiresAt = getMonthEndExpiry(now)

  const result = await db.transaction(async (tx) => {
    // Atomic idempotency: insert and let the partial unique index reject duplicates.
    // ON CONFLICT DO NOTHING means concurrent retries are safe with no TOCTOU gap.
    const [inserted] = await tx
      .insert(creditAllocation)
      .values({
        id: generateId(),
        userId,
        amount,
        remaining: amount,
        source,
        periodKey,
        expiresAt,
        createdAt: now,
      })
      .onConflictDoNothing()
      .returning({ id: creditAllocation.id })

    if (!inserted) {
      return { distributed: false }
    }

    // Read balance row
    const [row] = await tx
      .select()
      .from(creditBalance)
      .where(eq(creditBalance.userId, userId))
      .limit(1)

    const currentBalance = row?.balance ?? 0
    const newBalance = currentBalance + amount

    if (row) {
      await tx
        .update(creditBalance)
        .set({ balance: newBalance, updatedAt: now })
        .where(eq(creditBalance.userId, userId))
    } else {
      await tx.insert(creditBalance).values({
        id: generateId(),
        userId,
        balance: newBalance,
        updatedAt: now,
      })
    }

    await tx.insert(creditTransaction).values({
      id: generateId(),
      userId,
      amount,
      type: 'bonus',
      description: '月度配额',
      source,
      expiresAt,
      createdAt: now,
    })

    return { distributed: true }
  })

  return result
}
