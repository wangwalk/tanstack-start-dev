import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { createBillingPortalSession } from '#/lib/billing'
import { BILLING_PLANS } from '#/config/billing'

export const Route = createFileRoute('/dashboard/settings/billing')({
  component: BillingPage,
})

function BillingPage() {
  const { data: session } = authClient.useSession()
  const { subscription } = Route.useRouteContext()
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isActive = subscription.subscriptionStatus === 'active'
  const planName = subscription.subscriptionPlan
    ? BILLING_PLANS[subscription.subscriptionPlan as keyof typeof BILLING_PLANS]?.name ??
      subscription.subscriptionPlan
    : null

  async function handleManageBilling() {
    if (!session?.user?.id) return
    setError(null)
    setPortalLoading(true)
    try {
      const result = await createBillingPortalSession({
        data: { userId: session.user.id },
      })
      if (result.url) {
        window.location.href = result.url
      }
    } catch {
      setError('Unable to open billing portal. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-4">Current plan</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {isActive && planName ? (
              <>
                <span className="inline-flex items-center rounded-full border border-[rgba(79,184,178,0.3)] bg-[rgba(79,184,178,0.15)] px-3 py-1 text-sm font-semibold text-[var(--lagoon-deep)]">
                  {planName}
                </span>
                <span className="text-sm text-[var(--sea-ink-soft)]">Active</span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(23,58,64,0.06)] px-3 py-1 text-sm font-medium text-[var(--sea-ink-soft)]">
                  Free
                </span>
                {subscription.subscriptionStatus === 'canceled' && (
                  <span className="text-sm text-[var(--sea-ink-soft)]">Canceled</span>
                )}
                {subscription.subscriptionStatus === 'past_due' && (
                  <span className="text-sm text-amber-600 dark:text-amber-400">Past due</span>
                )}
              </>
            )}
          </div>

          {isActive ? (
            <button
              type="button"
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)] disabled:pointer-events-none disabled:opacity-60"
            >
              {portalLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Opening…
                </span>
              ) : (
                'Manage subscription'
              )}
            </button>
          ) : (
            <a
              href="/#pricing"
              className="inline-flex items-center justify-center rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-5 py-2 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Upgrade to Pro
            </a>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}
      </section>

      {/* Invoice history */}
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-4">Invoice history</p>
        {isActive ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--sea-ink-soft)]">
              View and download your invoices from the Stripe billing portal.
            </p>
            <button
              type="button"
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)] disabled:pointer-events-none disabled:opacity-60"
            >
              View invoices
            </button>
          </div>
        ) : (
          <p className="text-sm text-[var(--sea-ink-soft)]">
            No invoices yet. Invoices will appear here after you subscribe to a plan.
          </p>
        )}
      </section>
    </div>
  )
}
