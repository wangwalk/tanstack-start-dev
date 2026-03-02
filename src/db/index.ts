import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema.ts'

// In Cloudflare Workers production, use the HYPERDRIVE binding for connection pooling.
// In local dev, @cloudflare/vite-plugin injects .env.local into process.env, so
// DATABASE_URL is used as a direct connection.
//
// If HYPERDRIVE is present but misconfigured (e.g. wrong binding name in wrangler.jsonc),
// this will throw at module load time so the error surfaces immediately on deploy.
const cfEnv = env as Record<string, unknown>
const hyperdrive = cfEnv.HYPERDRIVE as { connectionString: string } | undefined

if (hyperdrive !== undefined && typeof hyperdrive.connectionString !== 'string') {
  throw new Error('HYPERDRIVE binding is present but missing connectionString — check wrangler.jsonc')
}

const connectionString = hyperdrive?.connectionString ?? process.env.DATABASE_URL!

// Singleton per isolate — postgres.js manages the connection pool internally.
// max: 1 is correct for Cloudflare Workers: each isolate handles one request at a time,
// so a single connection avoids pool exhaustion across concurrent isolates.
const client = postgres(connectionString, {
  max: 1,
  connect_timeout: 5,   // fail fast if DB is unreachable (seconds)
  idle_timeout: 20,     // release idle connections promptly in serverless
})

export const db = drizzle(client, { schema })
