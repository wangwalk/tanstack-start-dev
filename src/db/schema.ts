import * as authSchema from './auth.schema'
import * as appSchema from './app.schema'

/**
 * Re-export all tables so Drizzle Kit can discover them.
 * - auth.schema.ts  — Better Auth tables (user, session, account, verification, apiKey)
 * - app.schema.ts   — Application-specific tables (add your own here)
 */
export * from './auth.schema'
export * from './app.schema'

export const schema = {
  ...authSchema,
  ...appSchema,
} as const
