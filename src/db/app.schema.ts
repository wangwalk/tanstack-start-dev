// Application-specific tables go here.
// Auth tables (user, session, account, verification, apiKey) live in auth.schema.ts.

import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
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
  createdAt: timestamp('created_at').notNull(),
})
