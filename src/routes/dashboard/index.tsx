import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth-client'
import { createBillingPortalSession } from '#/lib/billing'
import { BILLING_PLANS } from '#/config/billing'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'

export const Route = createFileRoute('/dashboard/')({
  validateSearch: (search) => ({
    checkout: search.checkout as string | undefined,
  }),
  component: DashboardOverviewPage,
})

function DashboardOverviewPage() {
  const { session, subscription } = Route.useRouteContext()
  const { checkout } = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()
  const [resendStatus, setResendStatus] = useState<
    'idle' | 'loading' | 'sent' | 'error'
  >('idle')

  useEffect(() => {
    if (checkout === 'success') {
      toast.success("You're now on Pro — enjoy!")
      void router.invalidate()
      void navigate({ to: '/dashboard', search: { checkout: undefined }, replace: true })
    }
  }, [checkout, navigate, router])

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
      toast.error('Unable to open billing portal. Please try again.')
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
          <Button
            type="button"
            size="sm"
            onClick={handleResend}
            disabled={resendStatus === 'loading' || resendStatus === 'sent'}
            className="shrink-0 rounded-full border border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-60 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-800/50"
          >
            {resendStatus === 'loading'
              ? 'Sending\u2026'
              : resendStatus === 'sent'
                ? 'Email sent!'
                : resendStatus === 'error'
                  ? 'Failed \u2014 try again'
                  : 'Resend email'}
          </Button>
        </div>
      )}

      {/* Welcome card */}
      <section className="rise-in border border-border bg-card shadow-sm rounded-[2rem] px-6 py-10 sm:px-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Here&apos;s an overview of your account.
        </p>
      </section>

      {/* Subscription status card */}
      <section className="rise-in border border-border bg-card shadow-sm rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Subscription</p>

        {isActive && planName ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Badge className="rounded-full border border-primary/30 bg-primary/15 text-primary hover:bg-primary/20">
                {planName}
              </Badge>
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleManageBilling}
              className="rounded-full border-border hover:bg-accent"
            >
              Manage billing
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-full border-border bg-muted text-muted-foreground">
                Free
              </Badge>
              {subscription.subscriptionStatus === 'canceled' && (
                <span className="text-sm text-muted-foreground">
                  Canceled
                </span>
              )}
            </div>
            <Button
              asChild
            >
              <a href="/#pricing">Upgrade to Pro</a>
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
