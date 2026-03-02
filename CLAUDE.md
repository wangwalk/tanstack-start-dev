# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` — Start dev server on port 3000 (Vite + Cloudflare Workers runtime)
- `pnpm build` — Build for Cloudflare Workers via Vite
- `pnpm preview` — Preview production build locally
- `pnpm deploy` — Build and deploy to Cloudflare Workers (`wrangler deploy`)
- `pnpm test` — Run tests with Vitest

### Database (Drizzle ORM)
- `pnpm db:generate` — Generate migration files from schema changes
- `pnpm db:migrate` — Apply pending migrations
- `pnpm db:push` — Sync schema directly to DB (dev only, no migration file)
- `pnpm db:pull` — Introspect existing DB and update schema
- `pnpm db:studio` — Open Drizzle Studio for visual DB inspection

## Linear Workflow

**Linear team key: `NWA`**

### Before Starting Any Task
1. Read the full issue with Linear MCP: `mcp__claude_ai_Linear__get_issue`
2. Output a short "Development Plan" (what files change, what approach) and wait for user approval
3. Mark issue as **In Progress** before writing any code

### Git Branch Naming
```
feat/NWA-{id}-{short-slug}      # new features
fix/NWA-{id}-{short-slug}       # bug fixes
refactor/NWA-{id}-{short-slug}  # refactors
chore/NWA-{id}-{short-slug}     # tooling / config
```

Examples:
```
feat/NWA-148-shadcn-ui-setup
fix/NWA-139-server-fn-userid-security
refactor/NWA-140-unified-auth-middleware
```

### Commit Message Format
```
type(NWA-{id}): short imperative description

Optional body explaining why (not what).
```

Examples:
```
feat(NWA-143): add pluggable analytics with PostHog and Umami support
fix(NWA-139): resolve server functions trusting client-provided userId
refactor(NWA-140): introduce userFn/adminFn middleware for server functions
```

Types: `feat` | `fix` | `refactor` | `chore` | `docs` | `test`

### After Completing a Task

**NEVER merge directly to main locally. Always go through a GitHub PR so CI checks run.**

1. Push the feature branch to remote:
   ```
   git push -u origin <branch-name>
   ```
2. Create a GitHub PR via `gh pr create`
3. Wait for all CI checks to pass — use `gh pr checks <number>` to verify
4. Only after checks pass: merge via `gh pr merge <number> --merge` (or ask user to merge)
5. Delete the feature branch: `git branch -d <branch-name>`
6. Update Linear issue status to **Done**
7. Add a Linear comment with:
   - **What** was implemented
   - **Why** the approach was chosen (if non-obvious)
   - **How to test** it

## Project Architecture

### Core Stack
- **Framework**: TanStack Start (`@tanstack/react-start`) + React 19 + TypeScript
- **Routing**: TanStack Router — file-based, auto-generated route tree
- **Build**: Vite with `@cloudflare/vite-plugin` — runs in Cloudflare Workers runtime during dev
- **Deployment**: Cloudflare Workers via `wrangler deploy`
- **Database**: PostgreSQL + Drizzle ORM (currently Neon; migrating to generic postgres + Hyperdrive — NWA-142)
- **Auth**: Better Auth with `tanstackStartCookies()` plugin
- **Payments**: Stripe (subscriptions + one-time payments)
- **Email**: Resend + React Email templates
- **File Storage**: Cloudflare R2 (avatar uploads)
- **UI**: TailwindCSS v4 (migrating to shadcn/ui — NWA-148)
- **State**: TanStack Query for server state; no global client state library
- **Content**: Content Collections (`@content-collections/vite`) for blog/legal MDX
- **Testing**: Vitest + Testing Library

### Key Directory Structure
```
src/
├── routes/               # File-based routing — every file is a route
│   ├── __root.tsx        # Root layout, session loaded here via beforeLoad
│   ├── index.tsx         # Landing page
│   ├── dashboard.tsx     # Dashboard layout (auth guard)
│   ├── dashboard/        # Dashboard child routes
│   ├── admin.tsx         # Admin layout (role guard)
│   ├── admin/            # Admin child routes
│   ├── auth/             # Auth pages (sign-in, sign-up, etc.)
│   ├── api/              # API route handlers
│   │   ├── auth/$.ts     # Better Auth catch-all handler
│   │   ├── avatar/       # R2 avatar upload/serve
│   │   └── webhooks/     # Stripe webhook
│   └── *.tsx             # Marketing pages (pricing, blog, legal, etc.)
├── components/           # Reusable React components
│   ├── analytics/        # Per-provider analytics components (NWA-143)
│   ├── dashboard/        # Dashboard layout components
│   └── admin/            # Admin layout components
├── lib/                  # Core utilities and server-side logic
│   ├── auth.ts           # Better Auth server config
│   ├── auth-client.ts    # Better Auth client (browser)
│   ├── auth-guard.ts     # getSession() server function
│   ├── server-fn.ts      # userFn / adminFn middleware (NWA-140, once built)
│   ├── billing.ts        # Stripe checkout / portal server functions
│   ├── user.ts           # User-related server functions
│   ├── api-keys.ts       # API key CRUD server functions
│   ├── stripe.ts         # Stripe singleton
│   ├── email.ts          # sendEmail() wrapper
│   ├── r2.ts             # Cloudflare R2 helpers
│   └── site.ts           # SITE_TITLE, SITE_URL, feature flags
├── config/
│   └── billing.ts        # Plan definitions (Free / Pro / Lifetime)
├── db/
│   ├── index.ts          # Drizzle DB instance
│   └── schema.ts         # All table definitions
├── emails/               # React Email templates
├── integrations/
│   ├── better-auth/      # Auth UI helpers
│   └── tanstack-query/   # QueryClient provider + devtools
└── styles.css            # Global styles + CSS variables
content/
├── blog/                 # MDX blog posts
└── legal/                # Privacy policy, terms
drizzle/                  # Migration SQL files
```

## Patterns & Conventions

### Routing

Routes use TanStack Router's file-based convention:
- `routes/foo.tsx` → `/foo` layout route (wraps children via `<Outlet />`)
- `routes/foo/index.tsx` → `/foo` index page
- `routes/foo/bar.tsx` → `/foo/bar` page
- `routes/api/thing.ts` → `/api/thing` API handler
- `routes/foo[.]bar.ts` → `/foo.bar` (escaped dots, e.g. `sitemap[.]xml.ts`)

Route tree is auto-generated into `src/routeTree.gen.ts` — do not edit manually.

### Auth Guards

Session is loaded once in `__root.tsx` `beforeLoad` and stored in router context:

```ts
// __root.tsx
beforeLoad: async () => {
  const session = await getSession()
  return { session }
}
```

Protected route guards:
```ts
// dashboard.tsx (layout)
beforeLoad: async ({ context, location }) => {
  if (!context.session) {
    throw redirect({ to: '/auth/sign-in', search: { redirect: location.pathname } })
  }
}

// admin.tsx (layout)
beforeLoad: async ({ context }) => {
  if (!context.session || context.session.user.role !== 'admin') {
    throw redirect({ to: '/' })
  }
}
```

### Server Functions

**CRITICAL SECURITY RULE: Never trust client-provided `userId`. Always resolve identity from the session.**

```ts
// ❌ Wrong — attacker can supply any userId
export const doSomething = createServerFn({ method: 'POST' })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    // data.userId came from the browser — DO NOT USE
  })

// ✅ Correct — userId always comes from the server session
export const doSomething = createServerFn({ method: 'POST' })
  .handler(async () => {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    const userId = session.user.id  // trusted
  })
```

Once NWA-140 is complete, use the middleware helpers instead:

```ts
import { userFn, adminFn } from '#/lib/server-fn'

export const updateProfile = userFn
  .validator(z.object({ name: z.string() }))
  .handler(async ({ data, context }) => {
    // context.user is typed and guaranteed — no manual session check needed
    await db.update(user).set({ name: data.name }).where(eq(user.id, context.user.id))
  })
```

### API Route Handlers

```ts
// routes/api/thing.ts
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/thing')({
  GET: async ({ request }) => {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
  POST: async ({ request }) => { ... },
})
```

### Database

All schema definitions live in `src/db/schema.ts`. Follow the existing pattern:

```ts
export const myTable = pgTable('my_table', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull(),
})
```

After any schema change:
1. `pnpm db:generate` — creates migration SQL in `drizzle/`
2. `pnpm db:migrate` — applies it
3. Commit both the schema change and the generated migration file together

### Path Aliases

- `#/*` → `./src/*` (primary — prefer this)
- `@/*` → `./src/*` (also available)

### TypeScript

- Strict mode enabled — no implicit any, unused vars error
- `verbatimModuleSyntax` — use `import type` for type-only imports
- All new code must be fully typed — no `any` unless absolutely necessary

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` for local development. Required vars:

```bash
# Database
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM="Stockholm <noreply@yourdomain.com>"

# OAuth
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

For Cloudflare Workers, secrets are set via `wrangler secret put KEY_NAME`.

### Site Config

Edit `src/lib/site.ts` to configure the site title, URL, and feature flags:

```ts
export const SITE_TITLE = 'Your App Name'
export const SITE_URL = 'https://yourdomain.com'
```

### Billing Plans

Defined in `src/config/billing.ts`. Add/modify plans there — do not hardcode price IDs elsewhere.

## Important Notes

- **Package manager**: pnpm only — do not use npm or yarn
- **No middleware file**: TanStack Start has no `middleware.ts` equivalent — auth guards live in route `beforeLoad` functions
- **Route tree is auto-generated**: `src/routeTree.gen.ts` is generated by the Vite plugin on `pnpm dev`/`pnpm build` — never edit it manually
- **Cloudflare Workers runtime**: The dev server runs inside the Workers runtime via `@cloudflare/vite-plugin` — Node.js APIs unavailable at the edge may fail at runtime even if they work in tests
- **Content Collections**: Blog and legal content in `content/` is processed at build time — changes require a dev server restart to reflect
- **Dark mode**: Implemented via `localStorage` + `THEME_INIT_SCRIPT` injected in `__root.tsx` to prevent FOUC — follow this pattern for any theme changes
