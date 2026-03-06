import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/d1'

import * as schema from './schema.ts'

// D1 is accessed via a binding on the Cloudflare Workers env object.
// In local dev, @cloudflare/vite-plugin provides a local D1 simulator.
const cfEnv = env as Record<string, unknown>
const d1 = cfEnv.DB as D1Database

if (!d1) {
  throw new Error(
    'D1 binding "DB" is not available — check the d1_databases configuration in wrangler.jsonc.',
  )
}

export const db = drizzle(d1, { schema })
