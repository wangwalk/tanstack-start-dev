import { eq } from 'drizzle-orm'
import { getStripe } from '#/lib/stripe'
import { SITE_URL } from '#/lib/site'
import { db } from '#/db/index'
import { user } from '#/db/schema'
import { BILLING_PLANS, CREDIT_PACKS } from '#/config/billing'
import type { PlanKey, BillingInterval, CreditPackKey } from '#/config/billing'
import { userFn } from '#/lib/server-fn'

export const createCheckoutSession = userFn({ method: 'POST' })
  .inputValidator(
    (input: { plan: PlanKey; interval?: BillingInterval }) => input,
  )
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const { plan, interval } = data
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

    const planConfig = BILLING_PLANS[plan]

    let priceId: string
    if (planConfig.mode === 'payment') {
      priceId = planConfig.priceId
    } else {
      if (!interval) throw new Error(`interval is required for plan: ${plan}`)
      priceId = planConfig[interval].priceId
    }

    if (!priceId) {
      throw new Error(`No price configured for ${plan}`)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: planConfig.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/dashboard?checkout=success`,
      cancel_url: `${SITE_URL}/pricing?checkout=cancelled`,
      metadata: { userId, plan, interval: interval ?? '' },
    })

    return { url: session.url }
  })

export const createCreditCheckoutSession = userFn({ method: 'POST' })
  .inputValidator((input: { pack: CreditPackKey }) => input)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const stripe = getStripe()

    const [dbUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (!dbUser) throw new Error('User not found')

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

    const pack = CREDIT_PACKS[data.pack]

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: pack.priceId, quantity: 1 }],
      success_url: `${SITE_URL}/dashboard/settings/credits?checkout=success`,
      cancel_url: `${SITE_URL}/dashboard/settings/credits`,
      metadata: { userId, type: 'credit_purchase', pack: data.pack },
    })

    return { url: session.url }
  })

export const getUserSubscription = userFn().handler(async ({ context }) => {
  const [dbUser] = await db
    .select({
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
    })
    .from(user)
    .where(eq(user.id, context.user.id))
    .limit(1)
  return dbUser ?? { subscriptionStatus: null, subscriptionPlan: null }
})

export const createBillingPortalSession = userFn({ method: 'POST' }).handler(
  async ({ context }) => {
    const userId = context.user.id
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
  },
)
