import { eq, desc, lt, and, isNull, or, gt, lte } from 'drizzle-orm'
import type { ExtractTablesWithRelations } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'
import { db } from '#/db/index'
import {
  creditBalance,
  creditTransaction,
  creditAllocation,
} from '#/db/schema'
import { userFn } from '#/lib/server-fn'
import { REGISTER_GIFT_CREDITS } from '#/config/billing'
import type * as schema from '#/db/schema'

function generateId() {
  return crypto.randomUUID()
}

type Tx = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>

type CreditSource =
  | 'purchase'
  | 'subscription_monthly'
  | 'lifetime_monthly'
  | 'register_gift'

function formatPeriodKey(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function getMonthEndExpiry(from?: Date): Date {
  const d = from ?? new Date()
  // Last moment of the current UTC month
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
  end.setUTCMilliseconds(end.getUTCMilliseconds() - 1)
  return end
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

    const result = await db.transaction(async (tx: Tx) => {
      // 1. Lock the balance row
      const [row] = await tx
        .select()
        .from(creditBalance)
        .where(eq(creditBalance.userId, userId))
        .limit(1)
        .for('update')

      const now = new Date()

      // 2. Expire any allocations past their expiry
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
          type: 'consume',
          description: 'Credits expired',
          source: null,
          expiresAt: null,
          createdAt: now,
        })
      }

      // 3. Re-read balance after expiry
      const currentBalance = (row?.balance ?? 0) - expiredSum
      if (expiredSum > 0) {
        if (row) {
          await tx
            .update(creditBalance)
            .set({ balance: currentBalance, updatedAt: now })
            .where(eq(creditBalance.userId, userId))
        }
      }

      if (currentBalance < amount) {
        throw new Error('Insufficient credits')
      }

      // 4. FIFO: consume from allocations ordered by soonest-expiring first
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
        .orderBy(creditAllocation.expiresAt, creditAllocation.createdAt)
        .for('update')

      // 5. Deduct from allocations
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

      // 6. Insert consume transaction
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

      // 7. Update balance
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

    const conditions = data.cursor
      ? and(
          eq(creditTransaction.userId, userId),
          lt(creditTransaction.createdAt, new Date(data.cursor)),
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

// Internal helper — called by Stripe webhook, auth hook, and cron
export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  source: CreditSource,
  expiresAt?: Date,
): Promise<void> {
  const now = new Date()

  await db.transaction(async (tx: Tx) => {
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

    // Insert transaction record
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

  const result = await db.transaction(async (tx: Tx) => {
    // Idempotency check: has this period already been distributed?
    const [existing] = await tx
      .select()
      .from(creditAllocation)
      .where(
        and(
          eq(creditAllocation.userId, userId),
          eq(creditAllocation.source, source),
          eq(creditAllocation.periodKey, periodKey),
        ),
      )
      .limit(1)

    if (existing) {
      return { distributed: false }
    }

    const createdAt = now

    // Insert allocation with periodKey for idempotency
    await tx.insert(creditAllocation).values({
      id: generateId(),
      userId,
      amount,
      remaining: amount,
      source,
      periodKey,
      expiresAt,
      createdAt,
    })

    // Update balance
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
        .set({ balance: newBalance, updatedAt: createdAt })
        .where(eq(creditBalance.userId, userId))
    } else {
      await tx.insert(creditBalance).values({
        id: generateId(),
        userId,
        balance: newBalance,
        updatedAt: createdAt,
      })
    }

    // Insert transaction record
    await tx.insert(creditTransaction).values({
      id: generateId(),
      userId,
      amount,
      type: 'bonus',
      description: '月度配额',
      source,
      expiresAt,
      createdAt,
    })

    return { distributed: true }
  })

  return result
}
