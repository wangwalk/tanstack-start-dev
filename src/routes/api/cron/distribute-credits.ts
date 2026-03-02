import { createFileRoute } from '@tanstack/react-router'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '#/db/index'
import { user } from '#/db/schema'
import { distributeMonthlyCredits } from '#/lib/credits'
import { PLAN_MONTHLY_CREDITS } from '#/config/billing'

// Constant-time string comparison to prevent timing oracle attacks
function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a)
  const bBytes = new TextEncoder().encode(b)
  if (aBytes.length !== bBytes.length) return false
  let diff = 0
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i]! ^ bBytes[i]!
  }
  return diff === 0
}

async function handleDistributeCredits({ request }: { request: Request }) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : undefined

  if (!cronSecret || !token || !timingSafeEqual(token, cronSecret)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const activeUsers = await db
    .select({ id: user.id, subscriptionPlan: user.subscriptionPlan })
    .from(user)
    .where(
      and(
        eq(user.subscriptionStatus, 'active'),
        inArray(user.subscriptionPlan, ['pro', 'lifetime']),
      ),
    )

  let distributed = 0
  let skipped = 0
  let errors = 0

  for (const u of activeUsers) {
    const plan = u.subscriptionPlan

    // Runtime guard: skip if plan is somehow not in the expected set
    if (!plan || !(plan in PLAN_MONTHLY_CREDITS)) continue

    const source =
      plan === 'lifetime' ? 'lifetime_monthly' : 'subscription_monthly'
    const amount = PLAN_MONTHLY_CREDITS[plan as keyof typeof PLAN_MONTHLY_CREDITS]

    try {
      const result = await distributeMonthlyCredits(u.id, source, amount)
      if (result.distributed) {
        distributed++
      } else {
        skipped++
      }
    } catch (err) {
      errors++
      console.error('[cron] distributeMonthlyCredits failed for user', u.id, err)
    }
  }

  const status = errors > 0 ? 207 : 200
  return Response.json({ distributed, skipped, errors }, { status })
}

export const Route = createFileRoute('/api/cron/distribute-credits')({
  server: {
    handlers: {
      POST: handleDistributeCredits,
    },
  },
})
