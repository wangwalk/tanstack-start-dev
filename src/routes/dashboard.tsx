import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: session } = authClient.useSession()
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

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

  const showBanner = session?.user && !session.user.emailVerified

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {showBanner && (
        <div className="rise-in mb-6 flex flex-col items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800/40 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Your email address is not verified. Please check your inbox for a verification link.
          </p>
          <button
            onClick={handleResend}
            disabled={resendStatus === 'loading' || resendStatus === 'sent'}
            className="shrink-0 rounded-full border border-amber-300 bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-200 disabled:opacity-60 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-800/50"
          >
            {resendStatus === 'loading'
              ? 'Sending…'
              : resendStatus === 'sent'
                ? 'Email sent!'
                : resendStatus === 'error'
                  ? 'Failed — try again'
                  : 'Resend email'}
          </button>
        </div>
      )}
      <section className="island-shell rise-in rounded-[2rem] px-6 py-12 sm:px-10">
        <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
          Dashboard
        </h1>
        <p className="mt-4 text-[var(--sea-ink-soft)]">
          Welcome back. Your subscription is being set up.
        </p>
      </section>
    </main>
  )
}
