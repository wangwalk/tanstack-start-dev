// Application-specific tables go here.
// Auth tables (user, session, account, verification, apiKey) live in auth.schema.ts.

import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { user } from './auth.schema'

export const creditBalance = sqliteTable('credit_balance', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),
  balance: integer('balance').notNull().default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const creditTransaction = sqliteTable('credit_transaction', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // positive = credit, negative = debit
  type: text('type').notNull(), // 'purchase' | 'consume' | 'refund' | 'bonus'
  description: text('description'),
  source: text('source'), // 'purchase' | 'subscription_monthly' | 'lifetime_monthly' | 'register_gift' | null for consume
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }), // null = never expires; copied from allocation for display
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export const creditAllocation = sqliteTable(
  'credit_allocation',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(), // original amount (immutable)
    remaining: integer('remaining').notNull(), // decremented on consume
    source: text('source').notNull(), // 'purchase' | 'subscription_monthly' | 'lifetime_monthly' | 'register_gift'
    periodKey: text('period_key'), // 'YYYY-MM' for monthly; null for purchase/register_gift
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }), // null = never expires
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => [
    index('credit_allocation_user_expires_idx').on(t.userId, t.expiresAt),
    index('credit_allocation_user_period_idx').on(
      t.userId,
      t.source,
      t.periodKey,
    ),
    // Partial unique index: enforces one allocation per (user, source, period)
    // for monthly sources. NULL period_key rows (purchase, register_gift) are excluded.
    uniqueIndex('credit_allocation_period_unique_idx')
      .on(t.userId, t.source, t.periodKey)
      .where(sql`${t.periodKey} IS NOT NULL`),
  ],
)
