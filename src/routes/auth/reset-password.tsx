import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { authClient } from '#/lib/auth-client'
import AuthLayout from '#/components/AuthLayout'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

const searchSchema = z.object({
  token: z.string().optional(),
})

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const Route = createFileRoute('/auth/reset-password')({
  validateSearch: searchSchema,
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/auth/reset-password` }],
    meta: [
      { title: `Reset Password | ${SITE_TITLE}` },
      { name: 'description', content: `Set a new password for your ${SITE_TITLE} account` },
    ],
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <AuthLayout title="Invalid reset link" subtitle="This link is missing a reset token.">
        <div className="mt-6 text-center">
          <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
            Reset links are only valid when opened from the email we send you.
          </p>
          <Link
            to="/auth/forgot-password"
            className="inline-block rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] no-underline transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
          >
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const result = resetPasswordSchema.safeParse({ newPassword, confirmPassword })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setIsLoading(true)
    try {
      const { error: authError } = await authClient.resetPassword({
        newPassword,
        token: token!,
      })

      if (authError) {
        setError(authError.message ?? 'Reset failed. The link may have expired — request a new one.')
        return
      }

      setSuccess(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout title="Password updated" subtitle="Your password has been changed successfully.">
        <div className="mt-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sand)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--lagoon)" strokeWidth="1.5" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
            You can now sign in with your new password.
          </p>
          <Link
            to="/auth/sign-in"
            className="inline-block rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] no-underline transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
          >
            Sign In
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Choose a new password for your account">
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            disabled={isLoading}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            required
            disabled={isLoading}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 disabled:opacity-60"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)] disabled:pointer-events-none disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Resetting password…
            </span>
          ) : (
            'Reset Password'
          )}
        </button>

        <p className="text-center text-sm text-[var(--sea-ink-soft)]">
          Remember your password?{' '}
          <Link to="/auth/sign-in" className="font-medium text-[var(--lagoon)] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
