import { useState, useEffect, useMemo } from 'react'
import { Link, useRouteContext, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, Settings, ShieldCheck, Menu, X, LogOut, Zap, Send, Star, Bookmark } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import ThemeToggle from '#/components/ThemeToggle'
import LanguageSwitcher from '#/components/LanguageSwitcher'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { siteConfig } from '#/config/site'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  exact: boolean
  disabled?: boolean
}

const baseNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/submissions', label: 'My Submissions', icon: Send, exact: false },
  { to: '/dashboard/listings', label: 'My Listings', icon: Star, exact: false },
  { to: '/dashboard/saves', label: 'My Saves', icon: Bookmark, exact: false },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { session, creditBalance } = useRouteContext({ from: '/dashboard' })

  const navItems = useMemo<NavItem[]>(() => [
    ...baseNavItems,
    ...(session?.user.role === 'admin'
      ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, exact: false }]
      : []),
  ], [session?.user.role])

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
            <span className="h-2 w-2 rounded-full bg-[var(--logo-gradient)]" />
            Stockholm
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
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
                to={item.to as string}
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

        {/* Credit balance */}
        {siteConfig.features.credits && (
          <div className="px-3 pb-2">
            <Link
              to="/dashboard/settings/credits"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
            >
              <Zap className="h-4 w-4 text-teal-500" />
              <span className="text-teal-600 dark:text-teal-400 font-semibold">
                {creditBalance?.balance ?? 0} credits
              </span>
            </Link>
          </div>
        )}

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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void authClient.signOut()}
              className="mt-3 w-full gap-2 rounded-lg border-[var(--line)] text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-sm md:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
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
