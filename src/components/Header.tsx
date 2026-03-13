import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import { siteConfig } from '#/config/site'

const NAV_LINKS = [
  { href: '/tools', label: 'Browse Tools' },
  { href: '/tools/categories', label: 'Category' },
  { href: '/tools/submit', label: 'Submit' },
  { href: '/listing-pricing', label: 'List Your Tool' },
  ...(siteConfig.features.blog ? [{ href: '/blog', label: 'Blog' }] : []),
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q') as string
    if (q.trim()) {
      void navigate({ to: '/tools/search', search: { q: q.trim() } })
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <nav className="page-wrap flex items-center gap-x-3 px-4 py-2.5">
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-1.5 text-base font-bold text-foreground no-underline"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            {siteConfig.name.charAt(0)}
          </span>
          {siteConfig.name}
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-x-4 text-sm sm:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              to={item.href as '/tools'}
              className="text-sm font-medium text-foreground no-underline transition hover:text-primary"
              activeProps={{ className: 'text-sm font-medium text-primary no-underline' }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Compact search */}
          <form onSubmit={handleSearch} className="hidden items-center gap-1 lg:flex">
            <input
              name="q"
              type="search"
              placeholder="Search tools..."
              className="h-8 w-40 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:bg-primary/90"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </button>
          </form>

          <BetterAuthHeader />
          <LanguageSwitcher />
          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground sm:hidden"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 sm:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                to={item.href as '/tools'}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground no-underline transition hover:bg-accent"
                activeProps={{ className: 'rounded-md px-3 py-2.5 text-sm font-medium text-primary no-underline bg-accent' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
