import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { createBillingPortalSession } from '#/lib/billing'
import { BILLING_PLANS } from '#/config/billing'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/dashboard/settings/billing')({
  component: BillingPage,
})

function BillingPage() {
  const { data: session } = authClient.useSession()
  const { subscription } = Route.useRouteContext()
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isActive = subscription.subscriptionStatus === 'active'
  const isLifetime = subscription.subscriptionPlan === 'lifetime'
  const planName = subscription.subscriptionPlan
    ? BILLING_PLANS[subscription.subscriptionPlan as keyof typeof BILLING_PLANS]?.name ??
      subscription.subscriptionPlan
    : null

  async function handleManageBilling() {
    if (!session?.user?.id) return
    setError(null)
    setPortalLoading(true)
    try {
      const result = await createBillingPortalSession()
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
      <section className="rise-in border border-border bg-card shadow-sm rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Current plan</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {isActive && planName ? (
              <>
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                  {planName}
                </span>
                {isLifetime ? (
                  <span className="text-sm text-muted-foreground">Lifetime access</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Active</span>
                )}
              </>
            ) : (
              <>
                <span className="inline-flex items-center rounded-full border border-border bg-[rgba(23,58,64,0.06)] px-3 py-1 text-sm font-medium text-muted-foreground">
                  Free
                </span>
                {subscription.subscriptionStatus === 'canceled' && (
                  <span className="text-sm text-muted-foreground">Canceled</span>
                )}
                {subscription.subscriptionStatus === 'past_due' && (
                  <span className="text-sm text-amber-600 dark:text-amber-400">Past due</span>
                )}
              </>
            )}
          </div>

          {isLifetime ? (
            <span className="text-sm text-muted-foreground">No renewal needed</span>
          ) : isActive ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="rounded-full"
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
            </Button>
          ) : (
            <Button asChild>
              <a href="/#pricing" className="inline-flex items-center justify-center no-underline">
                Upgrade to Pro
              </a>
            </Button>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}
      </section>

      {/* Invoice history */}
      <section className="rise-in border border-border bg-card shadow-sm rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Invoice history</p>
        {isActive ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              View and download your invoices from the Stripe billing portal.
            </p>
            {!isLifetime && (
              <Button
                type="button"
                variant="outline"
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="rounded-full"
              >
                View invoices
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No invoices yet. Invoices will appear here after you subscribe to a plan.
          </p>
        )}
      </section>
    </div>
  )
}
