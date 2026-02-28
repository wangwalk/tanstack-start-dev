import { createFileRoute } from '@tanstack/react-router'
import type Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { getStripe } from '#/lib/stripe'
import { db } from '#/db/index'
import { user } from '#/db/schema'
import { sendEmail } from '#/lib/email'
import SubscriptionEmail from '#/emails/subscription'
import PaymentFailedEmail from '#/emails/payment-failed'

async function handleStripeWebhook({ request }: { request: Request }) {
  const stripe = getStripe()
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
    )
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        )
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        )
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        )
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
    }
  } catch (err) {
    console.error(`Webhook handler failed for ${event.type}:`, err)
  }

  return new Response('ok', { status: 200 })
}

async function findUserByCustomerId(customerId: string) {
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.stripeCustomerId, customerId))
    .limit(1)
  return dbUser ?? null
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id
  if (!customerId) return

  const plan = (session.metadata?.plan as string) ?? 'pro'
  const dbUser = await findUserByCustomerId(customerId)
  if (!dbUser) return

  await db
    .update(user)
    .set({
      subscriptionStatus: 'active',
      subscriptionPlan: plan,
    })
    .where(eq(user.stripeCustomerId, customerId))

  const stripe = getStripe()
  let periodEnd: number | undefined
  if (session.subscription) {
    const sub = await stripe.subscriptions.retrieve(
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id,
    )
    periodEnd = sub.items.data[0]?.current_period_end
  }

  await sendEmail({
    to: dbUser.email,
    subject: 'Subscription confirmed',
    template: SubscriptionEmail,
    props: {
      userName: dbUser.name,
      planName: plan.charAt(0).toUpperCase() + plan.slice(1),
      amount: session.amount_total
        ? `$${(session.amount_total / 100).toFixed(2)}`
        : '',
      nextBillingDate: periodEnd
        ? new Date(periodEnd * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : undefined,
    },
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  await db
    .update(user)
    .set({
      subscriptionStatus: subscription.status,
    })
    .where(eq(user.stripeCustomerId, customerId))
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  await db
    .update(user)
    .set({
      subscriptionStatus: 'canceled',
      subscriptionPlan: null,
    })
    .where(eq(user.stripeCustomerId, customerId))
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id
  if (!customerId) return

  const dbUser = await findUserByCustomerId(customerId)
  if (!dbUser) return

  await db
    .update(user)
    .set({ subscriptionStatus: 'past_due' })
    .where(eq(user.stripeCustomerId, customerId))

  await sendEmail({
    to: dbUser.email,
    subject: 'Payment failed — action required',
    template: PaymentFailedEmail,
    props: {
      userName: dbUser.name,
    },
  })
}

export const Route = createFileRoute('/api/webhooks/stripe')({
  server: {
    handlers: {
      POST: handleStripeWebhook,
    },
  },
})
