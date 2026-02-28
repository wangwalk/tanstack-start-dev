import { createFileRoute, Link, Outlet, redirect, useRouterState } from '@tanstack/react-router'
import { User, Shield, CreditCard, Bell } from 'lucide-react'
import { cn } from '#/lib/utils'

const tabs = [
  { to: '/dashboard/settings/profile', label: 'Profile', icon: User },
  { to: '/dashboard/settings/security', label: 'Security', icon: Shield },
  { to: '/dashboard/settings/billing', label: 'Billing', icon: CreditCard },
  { to: '/dashboard/settings/notifications', label: 'Notifications', icon: Bell },
] as const

export const Route = createFileRoute('/dashboard/settings')({
  beforeLoad: ({ location }) => {
    if (location.pathname === '/dashboard/settings' || location.pathname === '/dashboard/settings/') {
      throw redirect({ to: '/dashboard/settings/profile' })
    }
  },
  component: SettingsLayout,
})

function SettingsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rise-in">
        <h1 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
          Manage your account preferences
        </p>
      </div>

      {/* Tab navigation */}
      <nav className="rise-in flex gap-1 overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-1">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.to)
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-[var(--surface)] text-[var(--sea-ink)] shadow-sm'
                  : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]',
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {/* Page content */}
      <Outlet />
    </div>
  )
}
