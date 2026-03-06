import { useRouterState } from '@tanstack/react-router'
import { getLocale, locales, deLocalizeHref, localizeHref } from '#/paraglide/runtime.js'
import { m } from '#/paraglide/messages.js'
import { useState, useRef, useEffect } from 'react'

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  'zh-CN': '中文',
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const currentLocale = getLocale()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function getLocalizedHref(targetLocale: string) {
    const delocalized = deLocalizeHref(pathname)
    return localizeHref(delocalized, { locale: targetLocale })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={m.lang_switcher_label()}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
            clipRule="evenodd"
          />
        </svg>
        <span>{LOCALE_LABELS[currentLocale] ?? currentLocale}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-3 w-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[7.5rem] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-lg">
          {locales.map((locale) => (
            <a
              key={locale}
              href={getLocalizedHref(locale)}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-4 py-2 text-sm no-underline transition hover:bg-[var(--link-bg-hover)] ${
                locale === currentLocale
                  ? 'font-semibold text-[var(--lagoon-deep)]'
                  : 'text-[var(--sea-ink-soft)]'
              }`}
            >
              {locale === currentLocale && (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[var(--lagoon)]">
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {locale !== currentLocale && <span className="w-3.5" />}
              {LOCALE_LABELS[locale] ?? locale}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
