import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '#/db/index'
import { user } from '#/db/schema'

export const getUserSubscription = createServerFn()
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const [row] = await db
      .select({
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
      })
      .from(user)
      .where(eq(user.id, data.userId))
      .limit(1)

    return {
      subscriptionStatus: row?.subscriptionStatus ?? null,
      subscriptionPlan: row?.subscriptionPlan ?? null,
    }
  })
