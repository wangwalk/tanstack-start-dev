import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getUserById } from '#/lib/admin'
import { authClient } from '#/lib/auth-client'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'

const BAN_DURATION_OPTIONS = [
  { label: 'Permanent', value: 0 },
  { label: '1 day', value: 60 * 60 * 24 },
  { label: '7 days', value: 60 * 60 * 24 * 7 },
  { label: '30 days', value: 60 * 60 * 24 * 30 },
] as const

export const Route = createFileRoute('/admin/users/$userId')({
  beforeLoad: async ({ params }) => {
    const userDetail = await getUserById({ data: { userId: params.userId } })
    return { userDetail }
  },
  component: AdminUserDetailPage,
})

function AdminUserDetailPage() {
  const { userDetail } = Route.useRouteContext()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const isSelf = session?.user.id === userDetail.id

  const [role, setRole] = useState<'user' | 'admin'>(
    (userDetail.role as 'user' | 'admin') ?? 'user',
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)

  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState<number>(0)
  const [banning, setBanning] = useState(false)
  const [banError, setBanError] = useState<string | null>(null)
  const isBanned = userDetail.banned === true

  async function handleRoleSave() {
    setSaving(true)
    setRoleError(null)
    try {
      const { error } = await authClient.admin.setRole({ userId: userDetail.id, role })
      if (error) {
        setRoleError(error.message ?? 'Failed to update role.')
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      await router.invalidate()
    } finally {
      setSaving(false)
    }
  }

  async function handleBan() {
    setBanning(true)
    setBanError(null)
    try {
      const { error } = await authClient.admin.banUser({
        userId: userDetail.id,
        banReason: banReason || undefined,
        banExpiresIn: banDuration > 0 ? banDuration : undefined,
      })
      if (error) {
        setBanError(error.message ?? 'Failed to ban user.')
        return
      }
      await router.invalidate()
    } finally {
      setBanning(false)
    }
  }

  async function handleUnban() {
    setBanning(true)
    setBanError(null)
    try {
      const { error } = await authClient.admin.unbanUser({ userId: userDetail.id })
      if (error) {
        setBanError(error.message ?? 'Failed to unban user.')
        return
      }
      await router.invalidate()
    } finally {
      setBanning(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      <h1 className="text-2xl font-bold text-foreground">
        {userDetail.name}
      </h1>

      {/* Info card */}
      <section className="border border-border bg-card shadow-sm rounded-2xl px-6 py-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Account details</p>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium text-foreground">
              {userDetail.email}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email verified</dt>
            <dd className="font-medium text-foreground">
              {userDetail.emailVerified ? 'Yes' : 'No'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Joined</dt>
            <dd className="font-medium text-foreground">
              {new Date(userDetail.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subscription</dt>
            <dd className="font-medium text-foreground">
              {userDetail.subscriptionStatus ?? 'Free'}
              {userDetail.subscriptionPlan
                ? ` (${userDetail.subscriptionPlan})`
                : ''}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium">
              {isBanned ? (
                <span className="text-red-500">Banned</span>
              ) : (
                <span className="text-emerald-600">Active</span>
              )}
            </dd>
          </div>
          {isBanned && userDetail.banReason && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Ban reason</dt>
              <dd className="font-medium text-foreground">
                {userDetail.banReason}
              </dd>
            </div>
          )}
          {isBanned && userDetail.banExpires && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Ban expires</dt>
              <dd className="font-medium text-foreground">
                {new Date(userDetail.banExpires).toLocaleDateString()}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Role editor */}
      <section className="border border-border bg-card shadow-sm rounded-2xl px-6 py-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Role</p>
        <div className="flex items-center gap-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
            disabled={isSelf}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus-visible:ring-ring disabled:opacity-50"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <Button
            type="button"
            disabled={saving || role === userDetail.role || isSelf}
            onClick={() => void handleRoleSave()}
          >
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save role'}
          </Button>
        </div>
        {isSelf && (
          <p className="mt-2 text-xs text-amber-600">
            You cannot change your own role.
          </p>
        )}
        {roleError && (
          <p className="mt-2 text-xs text-red-500">{roleError}</p>
        )}
        {!isSelf && (
          <p className="mt-2 text-xs text-muted-foreground">
            Role changes take effect immediately on the user's next request.
          </p>
        )}
      </section>

      {/* Ban / unban */}
      <section className="border border-border bg-card shadow-sm rounded-2xl px-6 py-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Access</p>
        {isSelf ? (
          <p className="text-sm text-amber-600">You cannot ban your own account.</p>
        ) : isBanned ? (
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              This user is currently banned.
            </p>
            <button
              type="button"
              disabled={banning}
              onClick={() => void handleUnban()}
              className={cn(
                'rounded-full border border-emerald-400/30 bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)] transition hover:-translate-y-0.5 hover:opacity-90',
                'disabled:pointer-events-none disabled:opacity-60',
              )}
            >
              {banning ? 'Unbanning…' : 'Unban user'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Ban reason (optional)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20"
            />
            <select
              value={banDuration}
              onChange={(e) => setBanDuration(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20"
            >
              {BAN_DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={banning}
              onClick={() => void handleBan()}
              className={cn(
                'rounded-full border border-red-400/30 bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)] transition hover:-translate-y-0.5 hover:opacity-90',
                'disabled:pointer-events-none disabled:opacity-60',
              )}
            >
              {banning ? 'Banning…' : 'Ban user'}
            </button>
            <p className="text-xs text-muted-foreground">
              Banning immediately revokes all active sessions.
            </p>
          </div>
        )}
        {banError && (
          <p className="mt-2 text-xs text-red-500">{banError}</p>
        )}
      </section>
    </div>
  )
}
