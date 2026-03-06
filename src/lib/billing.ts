import { and, eq, inArray } from 'drizzle-orm'
import { getStripe } from '#/lib/stripe'
import { SITE_URL } from '#/lib/site'
import { db } from '#/db/index'
import { user, tool, listingOrder } from '#/db/schema'
import { BILLING_PLANS, CREDIT_PACKS, LISTING_TIERS, LISTING_UPGRADE_AMOUNT } from '#/config/billing'
import type { PlanKey, BillingInterval, CreditPackKey, ListingTierKey } from '#/config/billing'
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

export const createListingCheckoutSession = userFn({ method: 'POST' })
  .inputValidator((input: { toolId: string; tier: ListingTierKey }) => input)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const stripe = getStripe()

    const [dbTool] = await db
      .select({ id: tool.id, name: tool.name, slug: tool.slug, listingTier: tool.listingTier, submittedBy: tool.submittedBy })
      .from(tool)
      .where(eq(tool.id, data.toolId))
      .limit(1)

    if (!dbTool) throw new Error('Tool not found')
    if (dbTool.submittedBy !== userId) throw new Error('Forbidden')
    if (dbTool.listingTier === 'featured') throw new Error('Already at Featured tier')
    if (dbTool.listingTier === data.tier) throw new Error(`Already at ${data.tier} tier`)

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
      await db.update(user).set({ stripeCustomerId: customerId }).where(eq(user.id, userId))
    }

    const tierConfig = LISTING_TIERS[data.tier]

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: tierConfig.priceId, quantity: 1 }],
      success_url: `${SITE_URL}/checkout/listing-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/tool/${dbTool.slug}`,
      metadata: { userId, type: 'listing_purchase', toolId: data.toolId, tier: data.tier },
    })

    // Create a pending listing order
    await db.insert(listingOrder).values({
      id: crypto.randomUUID(),
      toolId: data.toolId,
      userId,
      tier: data.tier,
      amount: tierConfig.amount,
      stripeSessionId: session.id,
      status: 'pending',
      createdAt: new Date(),
    })

    return { url: session.url }
  })

export const createUpgradeCheckoutSession = userFn({ method: 'POST' })
  .inputValidator((input: { toolId: string }) => input)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const stripe = getStripe()

    const [dbTool] = await db
      .select({ id: tool.id, name: tool.name, slug: tool.slug, listingTier: tool.listingTier, submittedBy: tool.submittedBy })
      .from(tool)
      .where(eq(tool.id, data.toolId))
      .limit(1)

    if (!dbTool) throw new Error('Tool not found')
    if (dbTool.submittedBy !== userId) throw new Error('Forbidden')
    if (dbTool.listingTier !== 'standard') throw new Error('Only Standard listings can be upgraded')

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
      await db.update(user).set({ stripeCustomerId: customerId }).where(eq(user.id, userId))
    }

    const featuredConfig = LISTING_TIERS.featured

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: featuredConfig.priceId, quantity: 1 }],
      success_url: `${SITE_URL}/checkout/listing-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/dashboard/listings`,
      metadata: { userId, type: 'listing_purchase', toolId: data.toolId, tier: 'featured', upgrade: 'true' },
    })

    await db.insert(listingOrder).values({
      id: crypto.randomUUID(),
      toolId: data.toolId,
      userId,
      tier: 'featured',
      amount: LISTING_UPGRADE_AMOUNT,
      stripeSessionId: session.id,
      status: 'pending',
      createdAt: new Date(),
    })

    return { url: session.url }
  })

export const getMyListings = userFn().handler(async ({ context }) => {
  return db
    .select({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      listingTier: tool.listingTier,
      status: tool.status,
      ctaLabel: tool.ctaLabel,
      ctaUrl: tool.ctaUrl,
    })
    .from(tool)
    .where(
      and(
        eq(tool.submittedBy, context.user.id),
        inArray(tool.listingTier, ['standard', 'featured']),
      ),
    )
    .orderBy(tool.createdAt)
})

export const getListingOrders = userFn()
  .inputValidator((input: { toolId: string }) => input)
  .handler(async ({ data, context }) => {
    const [dbTool] = await db
      .select({ submittedBy: tool.submittedBy })
      .from(tool)
      .where(eq(tool.id, data.toolId))
      .limit(1)

    if (!dbTool || dbTool.submittedBy !== context.user.id) throw new Error('Forbidden')

    return db
      .select()
      .from(listingOrder)
      .where(eq(listingOrder.toolId, data.toolId))
      .orderBy(listingOrder.createdAt)
  })

export const getListingOrderBySession = userFn()
  .inputValidator((input: { sessionId: string }) => input)
  .handler(async ({ data, context }) => {
    const [order] = await db
      .select()
      .from(listingOrder)
      .where(
        and(
          eq(listingOrder.stripeSessionId, data.sessionId),
          eq(listingOrder.userId, context.user.id),
        ),
      )
      .limit(1)
    return order ?? null
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
