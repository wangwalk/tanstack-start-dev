import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { SITE_TITLE, SITE_URL } from '#/lib/site'
import { authClient } from '#/lib/auth-client'
import { createCheckoutSession, getUserSubscription } from '#/lib/billing'
import { BILLING_PLANS } from '#/config/billing'
import type { PlanKey, BillingInterval } from '#/config/billing'

export const Route = createFileRoute('/pricing')({
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
  const isYearly = interval === 'yearly'

  return [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      desc: 'Perfect for getting started',
      features: [
        'Up to 3 projects',
        '1 GB storage',
        'Community support',
        'Basic analytics',
      ],
      cta: 'Get Started',
      highlighted: false,
      planKey: null as PlanKey | null,
      href: '/auth/sign-up',
    },
    {
      name: 'Pro',
      price: isYearly ? pro.yearly.amount : pro.monthly.amount,
      period: isYearly ? '/yr' : '/mo',
      desc: 'For growing teams',
      features: [
        'Unlimited projects',
        '100 GB storage',
        'Priority support',
        'Advanced analytics',
        'Custom domains',
        'Team collaboration',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
      planKey: 'pro' as PlanKey,
      href: null as string | null,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'For large organizations',
      features: [
        'Everything in Pro',
        'Unlimited storage',
        'Dedicated support',
        'SSO & SAML',
        'SLA guarantee',
        'Custom integrations',
      ],
      cta: 'Contact Sales',
      highlighted: false,
      planKey: null as PlanKey | null,
      href: '/contact',
    },
  ]
}

function PricingPage() {
  const { data: session } = authClient.useSession()
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [subscription, setSubscription] = useState<{
    subscriptionStatus: string | null
    subscriptionPlan: string | null
  } | null>(null)

  useEffect(() => {
    if (session?.user) {
      getUserSubscription({ data: { userId: session.user.id } }).then(
        setSubscription,
      )
    }
  }, [session?.user?.id])

  const plans = getPlans(interval)

  const isCurrentPlan = (planKey: PlanKey | null) => {
    if (!planKey) return false
    return (
      subscription?.subscriptionPlan === planKey &&
      subscription?.subscriptionStatus === 'active'
    )
  }

  async function handleUpgrade(planKey: PlanKey) {
    if (!session?.user) {
      window.location.href = '/auth/sign-up'
      return
    }
    setCheckoutLoading(true)
    try {
      const result = await createCheckoutSession({
        data: { userId: session.user.id, plan: planKey, interval },
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
        <p className="island-kicker mb-2">Pricing</p>
        <h1 className="display-title mb-4 text-4xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto max-w-lg text-[var(--sea-ink-soft)]">
          Start for free, upgrade when you're ready. No hidden fees.
        </p>

        {/* Billing interval toggle */}
        <div className="mt-8 inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface)] p-1">
          <button
            type="button"
            onClick={() => setInterval('monthly')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              interval === 'monthly'
                ? 'bg-[var(--lagoon)] text-white shadow-sm'
                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setInterval('yearly')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              interval === 'yearly'
                ? 'bg-[var(--lagoon)] text-white shadow-sm'
                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
            }`}
          >
            Yearly
            <span className="ml-1.5 rounded-full bg-[rgba(79,184,178,0.15)] px-2 py-0.5 text-xs font-semibold text-[var(--lagoon-deep)]">
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
              key={plan.name}
              className={`island-shell feature-card rise-in rounded-2xl p-6 ${plan.highlighted ? 'ring-2 ring-[var(--lagoon)]' : ''}`}
              style={{ animationDelay: `${i * 100 + 80}ms` }}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-block rounded-full bg-[rgba(79,184,178,0.15)] px-3 py-1 text-xs font-semibold text-[var(--lagoon-deep)]">
                  Most Popular
                </span>
              )}
              <p className="island-kicker mb-1">{plan.name}</p>
              <p className="m-0 mb-1">
                <span className="display-title text-3xl font-bold text-[var(--sea-ink)]">
                  {plan.price}
                </span>
                <span className="text-sm text-[var(--sea-ink-soft)]">
                  {plan.period}
                </span>
              </p>
              <p className="mb-4 text-sm text-[var(--sea-ink-soft)]">
                {plan.desc}
              </p>
              <ul className="mb-6 space-y-2 pl-0">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-[var(--sea-ink-soft)]"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lagoon)]"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <span className="block w-full rounded-full border border-[var(--lagoon)] bg-[rgba(79,184,178,0.1)] px-5 py-2.5 text-center text-sm font-semibold text-[var(--lagoon-deep)]">
                  Current Plan
                </span>
              ) : plan.planKey ? (
                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={() => handleUpgrade(plan.planKey!)}
                  className={`block w-full rounded-full px-5 py-2.5 text-center text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-50 ${
                    plan.highlighted
                      ? 'border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] hover:bg-[var(--lagoon-deep)]'
                      : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] hover:border-[var(--lagoon)]'
                  }`}
                >
                  {checkoutLoading ? 'Redirecting...' : plan.cta}
                </button>
              ) : (
                <a
                  href={plan.href!}
                  className={`block rounded-full px-5 py-2.5 text-center text-sm font-semibold no-underline transition hover:-translate-y-0.5 ${
                    plan.highlighted
                      ? 'border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] hover:bg-[var(--lagoon-deep)]'
                      : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] hover:border-[var(--lagoon)]'
                  }`}
                >
                  {plan.cta}
                </a>
              )}
            </article>
          )
        })}
      </div>

      {/* FAQ / Bottom CTA */}
      <section className="mt-16">
        <div className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.24),transparent_66%)]" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.14),transparent_66%)]" />
          <h2 className="display-title mb-4 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
            Questions? We're here to help.
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-[var(--sea-ink-soft)]">
            Need help choosing the right plan? Contact our team for a
            personalized recommendation.
          </p>
          <a
            href="/contact"
            className="inline-block rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-8 py-3 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
          >
            Contact Sales
          </a>
        </div>
      </section>
    </main>
  )
}
