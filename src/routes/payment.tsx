import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getCheckoutSessionStatus } from '#/lib/billing'
import { BILLING_PLANS, CREDIT_PACKS } from '#/config/billing'
import type { PlanKey, CreditPackKey } from '#/config/billing'

const POLL_INTERVAL_MS = 2000
const TIMEOUT_MS = 10000

export const Route = createFileRoute('/payment')({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: String(search.session_id ?? ''),
    type: (search.type === 'credit' ? 'credit' : 'subscription') as
      | 'subscription'
      | 'credit',
  }),
  beforeLoad: async ({ context, location }) => {
    if (!context.session) {
      throw redirect({
        to: '/auth/sign-in',
        search: { redirect: location.pathname },
      })
    }
  },
  component: PaymentConfirmation,
})

function PaymentConfirmation() {
  const { session_id, type } = Route.useSearch()
  const startTime = Date.now()

  const { data, isError } = useQuery({
    queryKey: ['checkout-session-status', session_id],
    queryFn: () => getCheckoutSessionStatus({ data: { sessionId: session_id } }),
    refetchInterval: (query) => {
      const paid = query.state.data?.paymentStatus === 'paid'
      const timedOut = Date.now() - startTime >= TIMEOUT_MS
      if (paid || timedOut) return false
      return POLL_INTERVAL_MS
    },
    enabled: !!session_id,
  })

  const isPaid = data?.paymentStatus === 'paid'
  const isTimedOut =
    !isPaid && data !== undefined && Date.now() - startTime >= TIMEOUT_MS

  if (isError || !session_id) {
    return <ErrorState />
  }

  if (isPaid) {
    if (type === 'credit') {
      const pack = data.metadata?.pack as CreditPackKey | undefined
      const packConfig = pack ? CREDIT_PACKS[pack] : undefined
      return <CreditSuccess credits={packConfig?.credits} />
    }
    const plan = data.metadata?.plan as PlanKey | undefined
    const planConfig = plan ? BILLING_PLANS[plan] : undefined
    return <SubscriptionSuccess planName={planConfig?.name} />
  }

  if (isTimedOut) {
    return <TimeoutState />
  }

  return <PendingState />
}

function PendingState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-current border-t-transparent opacity-40" />
      <p className="text-lg font-medium">正在确认支付...</p>
    </div>
  )
}

function SubscriptionSuccess({ planName }: { planName?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">订阅已激活</h1>
        <p className="text-muted-foreground">
          {planName ? `您的 ${planName} 订阅已成功开通。` : '您的订阅已成功开通。'}
        </p>
      </div>
      <Link
        to="/dashboard"
        search={{ checkout: undefined }}
        className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        前往 Dashboard
      </Link>
    </div>
  )
}

function CreditSuccess({ credits }: { credits?: number }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Credits 已到账</h1>
        <p className="text-muted-foreground">
          {credits !== undefined
            ? `${credits} Credits 已成功充值到您的账户。`
            : 'Credits 已成功充值到您的账户。'}
        </p>
      </div>
      <Link
        to="/dashboard/settings/credits"
        className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        查看 Credits
      </Link>
    </div>
  )
}

function TimeoutState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30">
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">支付确认中</h1>
        <p className="text-muted-foreground">
          支付正在处理，请查收确认邮件。如有疑问，请联系支持。
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/dashboard"
          search={{ checkout: undefined }}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          前往 Dashboard
        </Link>
        <a
          href="mailto:support@example.com"
          className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-accent"
        >
          联系支持
        </a>
      </div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <p className="text-muted-foreground">无效的支付链接。</p>
      <Link to="/dashboard" search={{ checkout: undefined }} className="text-sm underline">
        返回 Dashboard
      </Link>
    </div>
  )
}
