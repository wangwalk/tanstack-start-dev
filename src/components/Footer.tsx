import { Link, useRouterState } from '@tanstack/react-router'
import NewsletterForm from '#/components/NewsletterForm'
import { LOCALE_LABELS } from '#/components/LanguageSwitcher'
import { siteConfig } from '#/config/site'
import { deLocalizeHref, getLocale, locales, localizeHref } from '#/paraglide/runtime.js'

type PrimaryLink = {
  label: string
  to: '/tools' | '/tools/categories' | '/tools/submit' | '/blog' | '/about' | '/contact' | '/privacy' | '/terms'
  enabled?: boolean
}

const primaryLinks: PrimaryLink[] = [
  { label: 'Browse Tools', to: '/tools' as const },
  { label: 'Categories', to: '/tools/categories' as const },
  { label: 'Submit', to: '/tools/submit' as const },
  { label: 'Blog', to: '/blog' as const, enabled: siteConfig.features.blog },
  { label: 'About', to: '/about' as const },
  { label: 'Contact', to: '/contact' as const },
  { label: 'Privacy', to: '/privacy' as const },
  { label: 'Terms', to: '/terms' as const },
].filter((link) => link.enabled ?? true)

export default function Footer() {
  const year = new Date().getFullYear()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const currentLocale = getLocale()

  function getLocalizedHref(targetLocale: string) {
    const delocalized = deLocalizeHref(pathname)
    return localizeHref(delocalized, { locale: targetLocale })
  }

  return (
    <footer className="mt-16 border-t border-border px-4 pb-10 pt-8 text-muted-foreground">
      <div className="page-wrap">
        {siteConfig.features.newsletter && (
          <section className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Stay updated
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Product updates, new tools, and directory additions. No spam.
              </p>
            </div>
            <NewsletterForm />
          </section>
        )}

        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          {/* Logo + description */}
          <div className="max-w-xs">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-base font-bold text-foreground no-underline"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
                {siteConfig.name.charAt(0)}
              </span>
              {siteConfig.name}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A focused discovery surface for AI tools, organized by category.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Directory</p>
              <ul className="mt-2 space-y-1.5">
                {primaryLinks.slice(0, 4).map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground no-underline hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Company</p>
              <ul className="mt-2 space-y-1.5">
                {primaryLinks.slice(4).map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground no-underline hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Language</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {locales.map((locale) => {
                  const active = locale === currentLocale
                  return (
                    <a
                      key={locale}
                      href={getLocalizedHref(locale)}
                      className={`text-sm no-underline ${active ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {LOCALE_LABELS[locale] ?? locale}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-start gap-3">
            {siteConfig.social.twitter && (
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:text-foreground"
              >
                <span className="sr-only">Follow us on X</span>
                <svg viewBox="0 0 16 16" aria-hidden="true" width="16" height="16">
                  <path
                    fill="currentColor"
                    d="M12.6 1h2.2L10 6.48 15.64 15h-4.41L7.78 9.82 3.23 15H1l5.14-5.84L.72 1h4.52l3.12 4.73L12.6 1zm-.77 12.67h1.22L4.57 2.26H3.26l8.57 11.41z"
                  />
                </svg>
              </a>
            )}
            {siteConfig.social.github && (
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:text-foreground"
              >
                <span className="sr-only">GitHub</span>
                <svg viewBox="0 0 16 16" aria-hidden="true" width="16" height="16">
                  <path
                    fill="currentColor"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
