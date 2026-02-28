import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { authClient } from '#/lib/auth-client'
import AuthLayout from '#/components/AuthLayout'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

const searchSchema = z.object({
  error: z.string().optional(),
})

export const Route = createFileRoute('/auth/verify-email')({
  validateSearch: searchSchema,
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/auth/verify-email` }],
    meta: [
      { title: `Verify Email | ${SITE_TITLE}` },
      { name: 'description', content: `Verify your email address for ${SITE_TITLE}` },
    ],
  }),
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { error } = Route.useSearch()
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

  if (error) {
    return (
      <AuthLayout title="Verification failed" subtitle="We couldn't verify your email address.">
        <div className="mt-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sand)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--lagoon)" strokeWidth="1.5" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
            The verification link may have expired or already been used. Request a new one below.
          </p>
          {session?.user ? (
            <>
              <button
                onClick={handleResend}
                disabled={resendStatus === 'loading' || resendStatus === 'sent'}
                className="inline-block rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)] disabled:pointer-events-none disabled:opacity-60"
              >
                {resendStatus === 'loading'
                  ? 'Sending…'
                  : resendStatus === 'sent'
                    ? 'Email sent!'
                    : 'Resend verification email'}
              </button>
              {resendStatus === 'error' && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  Failed to send. Please try again.
                </p>
              )}
            </>
          ) : (
            <Link
              to="/auth/sign-in"
              className="inline-block rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] no-underline transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
            >
              Sign in to resend
            </Link>
          )}
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Email verified" subtitle="Your email address has been confirmed.">
      <div className="mt-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sand)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--lagoon)" strokeWidth="1.5" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
          You're all set. Your account is now fully activated.
        </p>
        <Link
          to="/dashboard"
          className="inline-block rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] no-underline transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
        >
          Go to Dashboard
        </Link>
      </div>
    </AuthLayout>
  )
}
