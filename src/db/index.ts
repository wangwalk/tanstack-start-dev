import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema.ts'

// In Cloudflare Workers, use Hyperdrive for connection pooling.
// In local dev, fall back to DATABASE_URL directly.
const hyperdrive = (env as Record<string, unknown>).HYPERDRIVE as
  | { connectionString: string }
  | undefined

const client = postgres(hyperdrive?.connectionString ?? process.env.DATABASE_URL!, {
  max: 1, // Cloudflare Workers limit concurrent external connections per invocation
})

export const db = drizzle(client, { schema })
