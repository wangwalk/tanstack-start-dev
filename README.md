# TanStack Start + Cloudflare D1

Full-stack app built with TanStack Start, deployed on Cloudflare Workers with D1 (SQLite) as the database.

## Tech Stack

- **Framework**: TanStack Start + React 19 + TypeScript
- **Database**: Cloudflare D1 (SQLite) + Drizzle ORM
- **Auth**: Better Auth
- **Payments**: Stripe
- **Email**: Resend + React Email
- **UI**: TailwindCSS v4 + shadcn/ui
- **Deployment**: Cloudflare Workers

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/)
- [Cloudflare account](https://dash.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (included as dev dependency)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Authenticate with Cloudflare

```bash
pnpm dlx wrangler login
```

### 3. Create the D1 database

```bash
pnpm dlx wrangler d1 create damascus-db
```

This outputs a `database_id`. Copy it and update `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "damascus-db",
    "database_id": "<paste-your-database-id-here>",
    "migrations_dir": "drizzle"
  }
]
```

### 4. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables for local development:

| Variable | Description | Where to get it |
|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | [Cloudflare Dashboard](https://dash.cloudflare.com/) > Account ID |
| `CLOUDFLARE_D1_DATABASE_ID` | The D1 database ID from step 3 | Output of `wrangler d1 create` |
| `CLOUDFLARE_API_TOKEN` | API token with D1 edit permission | [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) |
| `BETTER_AUTH_SECRET` | Auth signing secret | Run `pnpm dlx @better-auth/cli secret` |
| `BETTER_AUTH_URL` | App URL (`http://localhost:3000` for dev) | — |

See `.env.example` for the full list including OAuth, Stripe, email, and analytics.

### 5. Apply database migrations

Apply to the local D1 simulator:

```bash
pnpm db:migrate:local
```

Apply to the remote D1 database (production):

```bash
pnpm db:migrate:remote
```

### 6. Start the dev server

```bash
pnpm dev
```

The app runs at `http://localhost:3000` using the Cloudflare Workers runtime with a local D1 simulator.

## Database Workflow

This project uses [Drizzle ORM](https://orm.drizzle.team/) with Cloudflare D1. Migrations are applied via `wrangler d1 migrations apply`.

| Command | Description |
|---|---|
| `pnpm db:generate` | Generate migration SQL from schema changes |
| `pnpm db:migrate:local` | Apply migrations to the local D1 simulator |
| `pnpm db:migrate:remote` | Apply migrations to the remote D1 database |
| `pnpm db:push` | Sync schema directly (dev only, no migration file) |
| `pnpm db:studio` | Open Drizzle Studio for visual DB inspection |

After changing schema files (`src/db/auth.schema.ts` or `src/db/app.schema.ts`):

1. `pnpm db:generate`
2. `pnpm db:migrate:local` (test locally)
3. `pnpm db:migrate:remote` (apply to production)
4. Commit the schema change and generated migration file together

## Production Deployment

### Set Cloudflare Workers secrets

```bash
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put BETTER_AUTH_URL
wrangler secret put RESEND_API_KEY
wrangler secret put RESEND_FROM
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_PUBLISHABLE_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put STRIPE_PRICE_PRO_MONTHLY
wrangler secret put STRIPE_PRICE_PRO_YEARLY
wrangler secret put STRIPE_PRICE_LIFETIME
```

### Deploy

```bash
pnpm deploy
```

This builds the app and deploys to Cloudflare Workers via `wrangler deploy`.

## Testing

```bash
pnpm test
```

## Adding UI Components

```bash
pnpm dlx shadcn@latest add button
```
