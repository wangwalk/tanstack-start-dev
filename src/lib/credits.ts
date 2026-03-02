import { eq, desc, lt, and } from 'drizzle-orm'
import type { ExtractTablesWithRelations } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'
import { db } from '#/db/index'
import { creditBalance, creditTransaction } from '#/db/schema'
import { userFn } from '#/lib/server-fn'
import type * as schema from '#/db/schema'

function generateId() {
  return crypto.randomUUID()
}

type Tx = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>

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
      const [row] = await tx
        .select()
        .from(creditBalance)
        .where(eq(creditBalance.userId, userId))
        .limit(1)

      const currentBalance = row?.balance ?? 0

      if (currentBalance < amount) {
        throw new Error('Insufficient credits')
      }

      const newBalance = currentBalance - amount
      const now = new Date()

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
        amount: -amount,
        type: 'consume',
        description,
        createdAt: now,
      })

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

// Internal helper — called by Stripe webhook, not exposed as a server function
export async function addCredits(
  userId: string,
  amount: number,
  description: string,
) {
  const now = new Date()

  await db.transaction(async (tx: Tx) => {
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
      type: 'purchase',
      description,
      createdAt: now,
    })
  })
}
