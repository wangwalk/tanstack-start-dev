import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { authClient } from '#/lib/auth-client'
import AuthLayout from '#/components/AuthLayout'
import { SITE_TITLE, SITE_URL } from '#/lib/site'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const Route = createFileRoute('/auth/forgot-password')({
  beforeLoad: async ({ context }) => {
    if (context.session) {
      throw redirect({ to: '/dashboard' })
    }
  },
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/auth/forgot-password` }],
    meta: [
      { title: `Forgot Password | ${SITE_TITLE}` },
      { name: 'description', content: `Reset your ${SITE_TITLE} password` },
    ],
  }),
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setIsLoading(true)
    try {
      const { error: authError } = await authClient.requestPasswordReset({
        email,
        redirectTo: '/auth/reset-password',
      })

      if (authError) {
        setError(authError.message ?? 'Failed to send reset email. Please try again.')
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
      <AuthLayout title="Check your email" subtitle={`We sent a reset link to ${email}`}>
        <div className="mt-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sand)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--lagoon)" strokeWidth="1.5" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
            Click the link in the email to reset your password. The link expires in 60 minutes.
          </p>
          <Button
            asChild
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
          >
            <Link to="/auth/sign-in">Back to Sign In</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link">
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email" className="mb-1.5">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending link…
            </span>
          ) : (
            'Send Reset Link'
          )}
        </Button>

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
