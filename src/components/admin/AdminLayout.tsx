import { useState, useEffect } from 'react'
import { Link, useRouteContext, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, Users, Wrench, FolderTree, Tag, Menu, X, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import ThemeToggle from '#/components/ThemeToggle'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  exact: boolean
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/admin/users', label: 'Users', icon: Users, exact: false },
  { to: '/admin/tools', label: 'Tools', icon: Wrench, exact: false },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree, exact: false },
  { to: '/admin/tags', label: 'Tags', icon: Tag, exact: false },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { session } = useRouteContext({ from: '/admin' })

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-card backdrop-blur-sm',
          'transition-transform duration-200 md:static md:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground no-underline"
          >
            <span className="h-2 w-2 rounded-full bg-primary" />
            Stockholm
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-primary">
              Admin
            </span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
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

            return (
              <Link
                key={item.to}
                to={item.to as '/admin'}
                activeOptions={{ exact: item.exact }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-primary/10 text-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Back to dashboard link */}
        <div className="border-t border-border px-3 py-3">
          <Link
            to="/dashboard"
            search={{ checkout: undefined }}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* User section */}
        {session?.user && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
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
                <p className="truncate text-sm font-medium text-foreground">
                  {session.user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void authClient.signOut()}
              className="mt-3 w-full gap-2 rounded-lg border-border text-muted-foreground hover:bg-accent hover:text-foreground"
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
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 backdrop-blur-sm md:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

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
