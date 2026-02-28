import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getUserById, updateUserRole } from '#/lib/admin'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/admin/users/$userId')({
  beforeLoad: async ({ params }) => {
    const userDetail = await getUserById({ data: { userId: params.userId } })
    return { userDetail }
  },
  component: AdminUserDetailPage,
})

function AdminUserDetailPage() {
  const { userDetail } = Route.useRouteContext()
  const [role, setRole] = useState<'user' | 'admin'>(
    (userDetail.role as 'user' | 'admin') ?? 'user',
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleRoleSave() {
    setSaving(true)
    try {
      await updateUserRole({ data: { userId: userDetail.id, role } })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)] transition hover:text-[var(--sea-ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
        {userDetail.name}
      </h1>

      {/* Info card */}
      <section className="island-shell rounded-2xl px-6 py-6">
        <p className="island-kicker mb-4">Account details</p>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--sea-ink-soft)]">Email</dt>
            <dd className="font-medium text-[var(--sea-ink)]">
              {userDetail.email}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--sea-ink-soft)]">Email verified</dt>
            <dd className="font-medium text-[var(--sea-ink)]">
              {userDetail.emailVerified ? 'Yes' : 'No'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--sea-ink-soft)]">Joined</dt>
            <dd className="font-medium text-[var(--sea-ink)]">
              {new Date(userDetail.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--sea-ink-soft)]">Subscription</dt>
            <dd className="font-medium text-[var(--sea-ink)]">
              {userDetail.subscriptionStatus ?? 'Free'}
              {userDetail.subscriptionPlan
                ? ` (${userDetail.subscriptionPlan})`
                : ''}
            </dd>
          </div>
        </dl>
      </section>

      {/* Role editor */}
      <section className="island-shell rounded-2xl px-6 py-6">
        <p className="island-kicker mb-4">Role</p>
        <div className="flex items-center gap-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <button
            type="button"
            disabled={saving || role === userDetail.role}
            onClick={() => void handleRoleSave()}
            className={cn(
              'rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:opacity-90',
              'disabled:pointer-events-none disabled:opacity-60',
            )}
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save role'}
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">
          Role changes take effect immediately on the user's next request.
        </p>
      </section>
    </div>
  )
}
