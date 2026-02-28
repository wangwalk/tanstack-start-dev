import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { authClient } from '#/lib/auth-client'
import { updateUserName } from '#/lib/user'

const nameSchema = z.string().trim().min(1, 'Name is required')

export const Route = createFileRoute('/dashboard/settings/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: session } = authClient.useSession()
  const [name, setName] = useState(session?.user?.name ?? '')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const result = nameSchema.safeParse(name)
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    if (!session?.user?.id) return

    setStatus('loading')
    try {
      await updateUserName({ data: { userId: session.user.id, name: result.data } })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setError('Failed to update name. Please try again.')
    }
  }

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-4">Avatar</p>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[rgba(79,184,178,0.15)] text-lg font-semibold text-[var(--lagoon-deep)]">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              userInitial
            )}
          </div>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Your avatar is managed by your connected OAuth provider. Change it on GitHub or Google to update it here.
          </p>
        </div>
      </section>

      {/* Profile form */}
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-4">Profile</p>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === 'loading'}
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
              value={session?.user?.email ?? ''}
              disabled
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] opacity-60"
            />
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
              Email cannot be changed
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {status === 'success' && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-400">
              Name updated successfully
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
                  Saving…
                </span>
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
