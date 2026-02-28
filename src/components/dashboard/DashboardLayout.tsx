import { useState, useEffect } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, Settings, CreditCard, Menu, X, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import ThemeToggle from '#/components/ThemeToggle'
import { cn } from '#/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  exact: boolean
  disabled?: boolean
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false, disabled: true },
  { to: '/dashboard/billing', label: 'Billing', icon: CreditCard, exact: false, disabled: true },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { data: session } = authClient.useSession()

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--sea-ink)]/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-[var(--line)] bg-[var(--surface-strong)] backdrop-blur-sm',
          'transition-transform duration-200 md:static md:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-[var(--line)] px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
          >
            <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
            Stockholm
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to)

            if (item.disabled) {
              return (
                <span
                  key={item.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sea-ink-soft)] opacity-50 cursor-not-allowed"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  <span className="ml-auto text-[0.65rem] uppercase tracking-wider opacity-70">Soon</span>
                </span>
              )
            }

            return (
              <Link
                key={item.to}
                to={item.to as '/dashboard'}
                activeOptions={{ exact: item.exact }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-[rgba(79,184,178,0.12)] text-[var(--sea-ink)] font-semibold'
                    : 'text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        {session?.user && (
          <div className="border-t border-[var(--line)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(79,184,178,0.15)] text-xs font-semibold text-[var(--lagoon-deep)]">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  session.user.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--sea-ink)]">
                  {session.user.name}
                </p>
                <p className="truncate text-xs text-[var(--sea-ink-soft)]">
                  {session.user.email}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void authClient.signOut()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-sm md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
