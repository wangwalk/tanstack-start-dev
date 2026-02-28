import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getStripe } from '#/lib/stripe'
import { SITE_URL } from '#/lib/site'
import { db } from '#/db/index'
import { user } from '#/db/schema'
import { BILLING_PLANS } from '#/config/billing'
import type { PlanKey, BillingInterval } from '#/config/billing'

export const createCheckoutSession = createServerFn({ method: 'POST' })
  .inputValidator(
    (input: { userId: string; plan: PlanKey; interval: BillingInterval }) => input,
  )
  .handler(async ({ data }) => {
    const { userId, plan, interval } = data
    const stripe = getStripe()

    const [dbUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (!dbUser) {
      throw new Error('User not found')
    }

    let customerId = dbUser.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name,
        metadata: { userId },
      })
      customerId = customer.id

      await db
        .update(user)
        .set({ stripeCustomerId: customerId })
        .where(eq(user.id, userId))
    }

    const priceId = BILLING_PLANS[plan][interval].priceId
    if (!priceId) {
      throw new Error(`No price configured for ${plan}/${interval}`)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/dashboard?checkout=success`,
      cancel_url: `${SITE_URL}/?checkout=cancelled`,
      metadata: { userId, plan, interval },
    })

    return { url: session.url }
  })

export const getUserSubscription = createServerFn()
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const [dbUser] = await db
      .select({
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
      })
      .from(user)
      .where(eq(user.id, data.userId))
      .limit(1)
    return dbUser ?? { subscriptionStatus: null, subscriptionPlan: null }
  })

export const createBillingPortalSession = createServerFn({ method: 'POST' })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const { userId } = data
    const stripe = getStripe()

    const [dbUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (!dbUser?.stripeCustomerId) {
      throw new Error('No billing account found for this user')
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${SITE_URL}/dashboard`,
    })

    return { url: session.url }
  })
