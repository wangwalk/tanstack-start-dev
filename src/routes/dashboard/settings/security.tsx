import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { authClient } from '#/lib/auth-client'
import { getLinkedAccounts, getActiveSessions, revokeSession } from '#/lib/user'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const Route = createFileRoute('/dashboard/settings/security')({
  component: SecurityPage,
})

function SecurityPage() {
  const { data: session } = authClient.useSession()

  return (
    <div className="space-y-6">
      <ChangePasswordSection />
      {session?.user?.id && <ConnectedAccountsSection />}
      {session?.user?.id && <ActiveSessionsSection />}
    </div>
  )
}

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const result = passwordSchema.safeParse({ currentPassword, newPassword, confirmPassword })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setStatus('loading')
    try {
      const { error: authError } = await authClient.changePassword({
        currentPassword,
        newPassword,
      })
      if (authError) {
        setStatus('error')
        setError(authError.message ?? 'Failed to change password')
        return
      }
      setStatus('success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setError('Failed to change password. Please try again.')
    }
  }

  return (
    <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
      <p className="island-kicker mb-4">Change password</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={status === 'loading'}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            disabled={status === 'loading'}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="confirmNewPassword" className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
            Confirm new password
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={status === 'loading'}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 disabled:opacity-60"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-400">
            Password changed successfully
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
          >
            {status === 'loading' ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Updating…
              </span>
            ) : (
              'Update password'
            )}
          </button>
        </div>
      </form>
    </section>
  )
}

function ConnectedAccountsSection() {
  const [accounts, setAccounts] = useState<Array<{ providerId: string; accountId: string; createdAt: Date }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLinkedAccounts()
      .then(setAccounts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const providerLabel: Record<string, string> = {
    github: 'GitHub',
    google: 'Google',
  }

  return (
    <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
      <p className="island-kicker mb-4">Connected accounts</p>
      {loading ? (
        <p className="text-sm text-[var(--sea-ink-soft)]">Loading…</p>
      ) : accounts.length === 0 ? (
        <p className="text-sm text-[var(--sea-ink-soft)]">No connected accounts</p>
      ) : (
        <div className="space-y-3">
          {accounts.map((acc) => (
            <div
              key={acc.providerId}
              className="flex items-center justify-between rounded-xl border border-[var(--line)] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <ProviderIcon provider={acc.providerId} />
                <div>
                  <p className="text-sm font-medium text-[var(--sea-ink)]">
                    {providerLabel[acc.providerId] ?? acc.providerId}
                  </p>
                  <p className="text-xs text-[var(--sea-ink-soft)]">
                    Connected {new Date(acc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-400">
                Connected
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ProviderIcon({ provider }: { provider: string }) {
  if (provider === 'github') {
    return (
      <svg className="h-5 w-5 text-[var(--sea-ink)]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    )
  }
  if (provider === 'google') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    )
  }
  return <div className="h-5 w-5 rounded-full bg-[var(--line)]" />
}

function ActiveSessionsSection() {
  const [sessions, setSessions] = useState<
    Array<{
      id: string
      createdAt: Date
      expiresAt: Date
      ipAddress: string | null
      userAgent: string | null
      isCurrent: boolean
    }>
  >([])
  const [loading, setLoading] = useState(true)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  useEffect(() => {
    getActiveSessions()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId)
    try {
      await revokeSession({ data: { sessionId } })
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch {
      // silently fail
    } finally {
      setRevokingId(null)
    }
  }

  function parseUserAgent(ua: string | null): string {
    if (!ua) return 'Unknown device'
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    return 'Unknown browser'
  }

  return (
    <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
      <p className="island-kicker mb-4">Active sessions</p>
      {loading ? (
        <p className="text-sm text-[var(--sea-ink-soft)]">Loading…</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-[var(--sea-ink-soft)]">No active sessions</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-[var(--line)] px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[var(--sea-ink)]">
                    {parseUserAgent(s.userAgent)}
                  </p>
                  {s.isCurrent && (
                    <span className="inline-flex items-center rounded-full border border-[rgba(79,184,178,0.3)] bg-[rgba(79,184,178,0.15)] px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--lagoon-deep)]">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--sea-ink-soft)]">
                  {s.ipAddress ?? 'Unknown IP'} · Created{' '}
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </div>
              {!s.isCurrent && (
                <button
                  type="button"
                  onClick={() => handleRevoke(s.id)}
                  disabled={revokingId === s.id}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  {revokingId === s.id ? 'Revoking…' : 'Revoke'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
