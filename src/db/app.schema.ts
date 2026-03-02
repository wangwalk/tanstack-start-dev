// Application-specific tables go here.
// Auth tables (user, session, account, verification, apiKey) live in auth.schema.ts.

import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth.schema'

export const creditBalance = pgTable('credit_balance', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),
  balance: integer('balance').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull(),
})

export const creditTransaction = pgTable('credit_transaction', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // positive = credit, negative = debit
  type: text('type').notNull(), // 'purchase' | 'consume' | 'refund' | 'bonus'
  description: text('description'),
  source: text('source'), // 'purchase' | 'subscription_monthly' | 'lifetime_monthly' | 'register_gift' | null for consume
  expiresAt: timestamp('expires_at'), // null = never expires; copied from allocation for display
  createdAt: timestamp('created_at').notNull(),
})

export const creditAllocation = pgTable(
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
    expiresAt: timestamp('expires_at'), // null = never expires
    createdAt: timestamp('created_at').notNull(),
  },
  (t) => [
    index('credit_allocation_user_expires_idx').on(t.userId, t.expiresAt),
    index('credit_allocation_user_period_idx').on(
      t.userId,
      t.source,
      t.periodKey,
    ),
  ],
)
