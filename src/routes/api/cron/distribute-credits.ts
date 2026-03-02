import { createFileRoute } from '@tanstack/react-router'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '#/db/index'
import { user } from '#/db/schema'
import { distributeMonthlyCredits } from '#/lib/credits'
import { PLAN_MONTHLY_CREDITS } from '#/config/billing'

async function handleDistributeCredits({ request }: { request: Request }) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : undefined

  if (!cronSecret || token !== cronSecret) {
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
    const plan = u.subscriptionPlan as 'pro' | 'lifetime'
    const source =
      plan === 'lifetime' ? 'lifetime_monthly' : 'subscription_monthly'
    const amount = PLAN_MONTHLY_CREDITS[plan]

    try {
      const result = await distributeMonthlyCredits(u.id, source, amount)
      if (result.distributed) {
        distributed++
      } else {
        skipped++
      }
    } catch {
      errors++
    }
  }

  return Response.json({ distributed, skipped, errors })
}

export const Route = createFileRoute('/api/cron/distribute-credits')({
  server: {
    handlers: {
      POST: handleDistributeCredits,
    },
  },
})
