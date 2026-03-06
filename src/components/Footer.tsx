import { Link, useRouterState } from '@tanstack/react-router'
import NewsletterForm from '#/components/NewsletterForm'
import { LOCALE_LABELS } from '#/components/LanguageSwitcher'
import { siteConfig } from '#/config/site'
import { deLocalizeHref, getLocale, locales, localizeHref } from '#/paraglide/runtime.js'

const primaryLinks = [
  { label: 'Browse Tools', to: '/tools' as const },
  { label: 'Categories', to: '/tools/categories' as const },
  { label: 'Submit', to: '/tools/submit' as const },
  { label: 'Blog', to: '/blog' as const, enabled: siteConfig.features.blog },
  { label: 'About', to: '/about' as const },
  { label: 'Contact', to: '/contact' as const },
  { label: 'Privacy', to: '/privacy' as const },
  { label: 'Terms', to: '/terms' as const },
].filter((link) => link.enabled !== false)

export default function Footer() {
  const year = new Date().getFullYear()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const currentLocale = getLocale()

  function getLocalizedHref(targetLocale: string) {
    const delocalized = deLocalizeHref(pathname)
    return localizeHref(delocalized, { locale: targetLocale })
  }

  return (
    <footer className="mt-20 px-4 pb-14 pt-8 text-[var(--sea-ink-soft)]">
      <div className="page-wrap">
        {siteConfig.features.newsletter && (
          <section className="footer-panel rounded-[2rem] px-5 py-6 sm:px-7">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
              <div>
                <p className="island-kicker mb-2">Field Notes</p>
                <h2 className="font-[Fraunces] text-2xl font-semibold tracking-tight text-[var(--sea-ink)]">
                  Product updates without the template-footer bulk.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--sea-ink-soft)]">
                  A tighter digest for launches, directory additions, and experiments happening inside the product.
                </p>
              </div>
              <NewsletterForm />
            </div>
          </section>
        )}

        <section className="footer-panel mt-6 rounded-[2rem] px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] no-underline shadow-[0_10px_24px_rgba(30,90,72,0.08)]"
                >
                  <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
                  {siteConfig.name}
                </Link>
                <p className="mt-4 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
                  A tighter discovery surface for AI tools, organized around categories instead of clutter.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {primaryLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="footer-chip"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="footer-divider" />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="footer-label">Language</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {locales.map((locale) => {
                      const active = locale === currentLocale
                      return (
                        <a
                          key={locale}
                          href={getLocalizedHref(locale)}
                          className={active ? 'footer-chip is-active' : 'footer-chip'}
                        >
                          {LOCALE_LABELS[locale] ?? locale}
                        </a>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <p className="footer-label">Contact</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <a
                      href={`mailto:${siteConfig.supportEmail}`}
                      className="text-sm font-medium text-[var(--lagoon-deep)] no-underline transition hover:text-[var(--sea-ink)]"
                    >
                      {siteConfig.supportEmail}
                    </a>
                    <span className="text-xs uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]/70">
                      Response within 2 business days
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 lg:items-end">
                <div className="flex gap-3">
                  {siteConfig.social.twitter && (
                    <a
                      href={siteConfig.social.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="footer-icon-link"
                    >
                      <span className="sr-only">Follow us on X</span>
                      <svg viewBox="0 0 16 16" aria-hidden="true" width="18" height="18">
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
                      className="footer-icon-link"
                    >
                      <span className="sr-only">GitHub</span>
                      <svg viewBox="0 0 16 16" aria-hidden="true" width="18" height="18">
                        <path
                          fill="currentColor"
                          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                        />
                      </svg>
                    </a>
                  )}
                </div>
                <p className="m-0 text-sm">
                  &copy; {year} {siteConfig.name}. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </footer>
  )
}
