import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FeatureCheck } from '#/components/icons/FeatureCheck'
import { toast } from 'sonner'
import { SITE_TITLE, SITE_URL } from '#/lib/site'
import { authClient } from '#/lib/auth-client'
import { createCheckoutSession, getUserSubscription } from '#/lib/billing'
import { BILLING_PLANS } from '#/config/billing'
import { m } from '#/paraglide/messages.js'
import type { PlanKey, BillingInterval } from '#/config/billing'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/pricing')({
  validateSearch: (search) => ({
    checkout: search.checkout as string | undefined,
  }),
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/pricing` }],
    meta: [
      { title: `Pricing | ${SITE_TITLE}` },
      {
        name: 'description',
        content:
          "Simple, transparent pricing. Start for free, upgrade when you're ready.",
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/pricing` },
      { property: 'og:title', content: `Pricing | ${SITE_TITLE}` },
      {
        property: 'og:description',
        content:
          "Simple, transparent pricing. Start for free, upgrade when you're ready.",
      },
    ],
  }),
  component: PricingPage,
})

const YEARLY_DISCOUNT_PERCENT = Math.round(
  (1 - 290 / (29 * 12)) * 100,
)

function getPlans(interval: BillingInterval) {
  const pro = BILLING_PLANS.pro
  const lifetime = BILLING_PLANS.lifetime
  const isYearly = interval === 'yearly'

  return [
    {
      name: () => m.pricing_free_name(),
      price: '$0',
      period: () => m.pricing_period_mo(),
      desc: () => m.pricing_free_desc(),
      features: [
        () => m.pricing_free_f1(),
        () => m.pricing_free_f2(),
        () => m.pricing_free_f3(),
        () => m.pricing_free_f4(),
      ],
      cta: () => m.pricing_free_cta(),
      highlighted: false,
      planKey: null as PlanKey | null,
      interval: interval as BillingInterval | undefined,
      href: '/auth/sign-up',
    },
    {
      name: () => m.pricing_pro_name(),
      price: isYearly ? pro.yearly.amount : pro.monthly.amount,
      period: () => isYearly ? m.pricing_period_yr() : m.pricing_period_mo(),
      desc: () => m.pricing_pro_desc(),
      features: [
        () => m.pricing_pro_f1(),
        () => m.pricing_pro_f2(),
        () => m.pricing_pro_f3(),
        () => m.pricing_pro_f4(),
        () => m.pricing_pro_f5(),
        () => m.pricing_pro_f6(),
      ],
      cta: () => m.pricing_pro_cta(),
      highlighted: true,
      planKey: 'pro' as PlanKey,
      interval: interval as BillingInterval | undefined,
      href: null as string | null,
    },
    {
      name: () => m.pricing_lifetime_name(),
      price: lifetime.amount,
      period: () => m.pricing_period_one_time(),
      desc: () => m.pricing_lifetime_desc(),
      features: [
        () => m.pricing_lifetime_f1(),
        () => m.pricing_lifetime_f2(),
        () => m.pricing_lifetime_f3(),
        () => m.pricing_lifetime_f4(),
        () => m.pricing_lifetime_f5(),
      ],
      cta: () => m.pricing_lifetime_cta(),
      highlighted: false,
      planKey: 'lifetime' as PlanKey,
      interval: undefined as BillingInterval | undefined,
      href: null as string | null,
    },
  ]
}

function PricingPage() {
  const { data: session } = authClient.useSession()
  const { checkout } = Route.useSearch()
  const navigate = useNavigate()
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [subscription, setSubscription] = useState<{
    subscriptionStatus: string | null
    subscriptionPlan: string | null
  } | null>(null)

  useEffect(() => {
    if (session?.user) {
      getUserSubscription().then(setSubscription).catch(() => null)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (checkout === 'cancelled') {
      toast('Checkout cancelled')
      void navigate({ to: '/pricing', search: { checkout: undefined }, replace: true })
    }
  }, [checkout, navigate])

  const plans = getPlans(interval)

  const isCurrentPlan = (planKey: PlanKey | null) => {
    if (!planKey) return false
    return (
      subscription?.subscriptionPlan === planKey &&
      subscription?.subscriptionStatus === 'active'
    )
  }

  async function handleUpgrade(planKey: PlanKey, planInterval?: BillingInterval) {
    if (!session?.user) {
      window.location.href = '/auth/sign-up'
      return
    }
    setCheckoutLoading(true)
    try {
      const result = await createCheckoutSession({
        data: { plan: planKey, interval: planInterval },
      })
      if (result.url) {
        window.location.href = result.url
      }
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {/* Header */}
      <section className="mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{m.pricing_kicker()}</p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {m.pricing_title()}
        </h1>
        <p className="mx-auto max-w-lg text-muted-foreground">
          {m.pricing_description()}
        </p>

        {/* Billing interval toggle */}
        <div className="mt-8 inline-flex items-center rounded-full border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setInterval('monthly')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              interval === 'monthly'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {m.pricing_monthly()}
          </button>
          <button
            type="button"
            onClick={() => setInterval('yearly')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              interval === 'yearly'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {m.pricing_yearly()}
            <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              -{YEARLY_DISCOUNT_PERCENT}%
            </span>
          </button>
        </div>
      </section>

      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan, i) => {
          const isCurrent = isCurrentPlan(plan.planKey)

          return (
            <article
              key={plan.name()}
              className={`border border-border bg-card shadow-sm rise-in rounded-2xl p-6 ${plan.highlighted ? 'ring-2 ring-primary' : ''}`}
              style={{ animationDelay: `${i * 100 + 80}ms` }}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {m.pricing_most_popular()}
                </span>
              )}
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{plan.name()}</p>
              <p className="m-0 mb-1">
                <span className="text-3xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period()}
                </span>
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                {plan.desc()}
              </p>
              <ul className="mb-6 space-y-2 pl-0">
                {plan.features.map((f) => (
                  <li
                    key={f()}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <FeatureCheck />
                    {f()}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <span className="block w-full rounded-full border border-primary bg-primary/10 px-5 py-2.5 text-center text-sm font-semibold text-primary">
                  {m.pricing_current_plan()}
                </span>
              ) : plan.planKey ? (
                <Button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={() => handleUpgrade(plan.planKey!, plan.interval)}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  className="block w-full px-5 py-2.5 text-center text-sm"
                >
                  {checkoutLoading ? m.pricing_redirecting() : plan.cta()}
                </Button>
              ) : (
                <Button
                  variant={plan.highlighted ? 'default' : 'outline'}
                  className="w-full"
                  asChild
                >
                  <a href={plan.href!} className="no-underline">
                    {plan.cta()}
                  </a>
                </Button>
              )}
            </article>
          )
        })}
      </div>

      {/* FAQ / Bottom CTA */}
      <section className="mt-16">
        <div className="border border-border bg-card shadow-sm rise-in relative overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-10 sm:py-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {m.pricing_faq_title()}
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
            {m.pricing_faq_description()}
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 no-underline"
          >
            <Button className="px-8 py-3">{m.pricing_faq_cta()}</Button>
          </a>
        </div>
      </section>
    </main>
  )
}
