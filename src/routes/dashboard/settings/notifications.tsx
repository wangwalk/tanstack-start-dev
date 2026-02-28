import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

interface NotificationPref {
  key: string
  label: string
  description: string
}

const prefs: NotificationPref[] = [
  {
    key: 'security',
    label: 'Security alerts',
    description: 'Get notified about sign-ins from new devices and password changes',
  },
  {
    key: 'product',
    label: 'Product updates',
    description: 'News about new features and improvements',
  },
  {
    key: 'marketing',
    label: 'Marketing emails',
    description: 'Tips, special offers, and promotions',
  },
]

export const Route = createFileRoute('/dashboard/settings/notifications')({
  component: NotificationsPage,
})

function NotificationsPage() {
  const [values, setValues] = useState<Record<string, boolean>>({
    security: true,
    product: true,
    marketing: false,
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  function toggle(key: string) {
    setValues((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    // Simulate save — replace with server function when DB column is added
    await new Promise((r) => setTimeout(r, 500))
    setStatus('success')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className="space-y-6">
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-4">Email notifications</p>
        <form onSubmit={handleSave} className="space-y-1">
          {prefs.map((pref) => (
            <label
              key={pref.key}
              className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition hover:bg-[var(--link-bg-hover)]"
            >
              <div>
                <p className="text-sm font-medium text-[var(--sea-ink)]">{pref.label}</p>
                <p className="text-xs text-[var(--sea-ink-soft)]">{pref.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={values[pref.key]}
                onClick={() => toggle(pref.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 focus:ring-offset-2 ${
                  values[pref.key] ? 'bg-[var(--lagoon)]' : 'bg-[var(--line)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                    values[pref.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          ))}

          {status === 'success' && (
            <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-400">
              Preferences saved
            </div>
          )}

          <div className="flex justify-end pt-3">
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
                'Save preferences'
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
