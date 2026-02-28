import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { authClient } from '#/lib/auth-client'
import AuthLayout from '#/components/AuthLayout'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

const signUpSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const Route = createFileRoute('/auth/sign-up')({
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/auth/sign-up` }],
    meta: [
      { title: `Sign Up | ${SITE_TITLE}` },
      { name: 'description', content: `Create your ${SITE_TITLE} account` },
    ],
  }),
  component: SignUpPage,
})

function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const result = signUpSchema.safeParse({ name, email, password, confirmPassword })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setIsLoading(true)
    try {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
      })

      if (authError) {
        setError(authError.message ?? 'Sign up failed. Please try again.')
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
      <AuthLayout title="Check your email" subtitle={`We sent a verification link to ${email}`}>
        <div className="mt-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sand)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--lagoon)" strokeWidth="1.5" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
            Click the link in the email to verify your account, then sign in.
          </p>
          <Link
            to="/auth/sign-in"
            className="inline-block rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] no-underline transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
          >
            Go to Sign In
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create an account" subtitle="Get started for free">
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            disabled={isLoading}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isLoading}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            disabled={isLoading}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
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
              Creating account…
            </span>
          ) : (
            'Sign Up'
          )}
        </button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--line)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--surface)] px-3 text-[var(--sea-ink-soft)]">or continue with</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={isLoading || socialLoading !== null}
            onClick={async () => {
              setSocialLoading('github')
              setError(null)
              try {
                await authClient.signIn.social({
                  provider: 'github',
                  callbackURL: '/',
                })
              } catch {
                setError('Failed to sign in with GitHub. Please try again.')
                setSocialLoading(null)
              }
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-6 py-2.5 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-[var(--sand)] disabled:pointer-events-none disabled:opacity-60"
          >
            {socialLoading === 'github' ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            )}
            Continue with GitHub
          </button>

          <button
            type="button"
            disabled={isLoading || socialLoading !== null}
            onClick={async () => {
              setSocialLoading('google')
              setError(null)
              try {
                await authClient.signIn.social({
                  provider: 'google',
                  callbackURL: '/',
                })
              } catch {
                setError('Failed to sign in with Google. Please try again.')
                setSocialLoading(null)
              }
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-6 py-2.5 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-[var(--sand)] disabled:pointer-events-none disabled:opacity-60"
          >
            {socialLoading === 'google' ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-[var(--sea-ink-soft)]">
          Already have an account?{' '}
          <Link to="/auth/sign-in" className="font-medium text-[var(--lagoon)] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
