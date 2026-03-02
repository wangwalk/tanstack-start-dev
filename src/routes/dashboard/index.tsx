import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { createBillingPortalSession } from '#/lib/billing'
import { BILLING_PLANS } from '#/config/billing'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverviewPage,
})

function DashboardOverviewPage() {
  const { data: session } = authClient.useSession()
  const { subscription } = Route.useRouteContext()
  const [resendStatus, setResendStatus] = useState<
    'idle' | 'loading' | 'sent' | 'error'
  >('idle')

  const showBanner = session?.user && !session.user.emailVerified

  async function handleResend() {
    const email = session?.user?.email
    if (!email) return

    setResendStatus('loading')
    try {
      await authClient.sendVerificationEmail({ email })
      setResendStatus('sent')
    } catch {
      setResendStatus('error')
    }
  }

  async function handleManageBilling() {
    if (!session?.user?.id) return
    try {
      const result = await createBillingPortalSession()
      if (result.url) {
        window.location.href = result.url
      }
    } catch {
      // billing portal not available
    }
  }

  const isActive = subscription.subscriptionStatus === 'active'
  const planName = subscription.subscriptionPlan
    ? BILLING_PLANS[subscription.subscriptionPlan as keyof typeof BILLING_PLANS]
        ?.name ?? subscription.subscriptionPlan
    : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Email verification banner */}
      {showBanner && (
        <div className="rise-in flex flex-col items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800/40 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Your email address is not verified. Please check your inbox for a
            verification link.
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus === 'loading' || resendStatus === 'sent'}
            className="shrink-0 rounded-full border border-amber-300 bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-200 disabled:opacity-60 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-800/50"
          >
            {resendStatus === 'loading'
              ? 'Sending\u2026'
              : resendStatus === 'sent'
                ? 'Email sent!'
                : resendStatus === 'error'
                  ? 'Failed \u2014 try again'
                  : 'Resend email'}
          </button>
        </div>
      )}

      {/* Welcome card */}
      <section className="island-shell rise-in rounded-[2rem] px-6 py-10 sm:px-10">
        <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}
        </h1>
        <p className="mt-2 text-[var(--sea-ink-soft)]">
          Here&apos;s an overview of your account.
        </p>
      </section>

      {/* Subscription status card */}
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-4">Subscription</p>

        {isActive && planName ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-[rgba(79,184,178,0.3)] bg-[rgba(79,184,178,0.15)] px-3 py-1 text-sm font-semibold text-[var(--lagoon-deep)]">
                {planName}
              </span>
              <span className="text-sm text-[var(--sea-ink-soft)]">Active</span>
            </div>
            <button
              type="button"
              onClick={handleManageBilling}
              className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
            >
              Manage billing
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(23,58,64,0.06)] px-3 py-1 text-sm font-medium text-[var(--sea-ink-soft)]">
                Free
              </span>
              {subscription.subscriptionStatus === 'canceled' && (
                <span className="text-sm text-[var(--sea-ink-soft)]">
                  Canceled
                </span>
              )}
            </div>
            <a
              href="/#pricing"
              className="inline-flex items-center justify-center rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-5 py-2 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Upgrade to Pro
            </a>
          </div>
        )}
      </section>
    </div>
  )
}
