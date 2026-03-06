import * as authSchema from './auth.schema'
import * as appSchema from './app.schema'
import * as toolSchema from './tool.schema'

/**
 * Re-export all tables so Drizzle Kit can discover them.
 * - auth.schema.ts  — Better Auth tables (user, session, account, verification, apiKey)
 * - app.schema.ts   — Application-specific tables
 * - tool.schema.ts  — Tool directory tables (tool, category, tag, tool_category, tool_tag)
 */
export * from './auth.schema'
export * from './app.schema'
export * from './tool.schema'

export const schema = {
  ...authSchema,
  ...appSchema,
  ...toolSchema,
} as const
