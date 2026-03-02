import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: ['.env.local', '.env'] })

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // drizzle-kit is a local/CI Node.js tool — it runs outside Cloudflare Workers and
    // cannot access the HYPERDRIVE binding. It always connects directly via DATABASE_URL.
    // This is intentional: migrations are one-off operations that don't need connection pooling.
    url: process.env.DATABASE_URL!,
  },
})
