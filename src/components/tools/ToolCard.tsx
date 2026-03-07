import { Link } from '@tanstack/react-router'
import type { PublicToolCard } from '#/lib/public'
import { SaveToolButton } from '#/components/tools/SaveToolButton'

const pricingBadgeClass: Record<string, string> = {
  free: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  freemium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  open_source: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const pricingLabel: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  paid: 'Paid',
  open_source: 'Open Source',
}

interface ToolCardProps {
  tool: PublicToolCard
}

export function ToolCard({ tool }: ToolCardProps) {
  const categories = tool.categories.slice(0, 2)
  const tagLinks = tool.tags.slice(0, 4)
  const fallbackLinks = categories
    .filter((category) => !tagLinks.some((entry) => entry.slug === category.slug))
    .slice(0, Math.max(0, 4 - tagLinks.length))
  const previewLinks = [
    ...tagLinks.map((entry) => ({ ...entry, kind: 'tag' as const, label: `#${entry.name}` })),
    ...fallbackLinks.map((entry) => ({ ...entry, kind: 'category' as const, label: entry.name })),
  ]

  return (
    <article className="island-shell feature-card group flex h-full flex-col gap-4 rounded-[1.6rem] p-4 transition hover:-translate-y-0.5">
      <div className="grid gap-4 sm:grid-cols-[1fr_108px]">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            {tool.logoUrl ? (
              <img
                src={tool.logoUrl}
                alt={`${tool.name} logo`}
                className="h-11 w-11 shrink-0 rounded-2xl object-cover ring-1 ring-black/5"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(79,184,178,0.12)] text-lg font-bold text-[var(--lagoon-deep)]">
                {tool.name.charAt(0) || '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/tools/$slug"
                  params={{ slug: tool.slug }}
                  className="truncate font-semibold text-[var(--sea-ink)] no-underline transition hover:text-[var(--lagoon-deep)]"
                >
                  {tool.name}
                </Link>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${pricingBadgeClass[tool.pricingType] ?? pricingBadgeClass.free}`}
                >
                  {pricingLabel[tool.pricingType] ?? tool.pricingType}
                </span>
                {tool.isFeatured && <span className="text-xs text-amber-500">★ Featured</span>}
              </div>
              {categories[0] && (
                <p className="mt-1 truncate text-xs text-[var(--sea-ink-soft)]">{categories[0].name}</p>
              )}
            </div>
          </div>

          {tool.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
              {tool.description}
            </p>
          )}

          {previewLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {previewLinks.map((entry) =>
                entry.kind === 'tag' ? (
                  <Link
                    key={`${entry.kind}-${entry.id}`}
                    to="/tools/tag/$slug"
                    params={{ slug: entry.slug }}
                    className="rounded-full border border-[var(--line)] bg-[var(--surface)]/88 px-2.5 py-1 text-xs font-medium text-[var(--sea-ink-soft)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
                  >
                    {entry.label}
                  </Link>
                ) : (
                  <Link
                    key={`${entry.kind}-${entry.id}`}
                    to="/tools/category/$slug"
                    params={{ slug: entry.slug }}
                    className="rounded-full border border-[var(--line)] bg-[var(--surface)]/88 px-2.5 py-1 text-xs font-medium text-[var(--sea-ink-soft)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
                  >
                    {entry.label}
                  </Link>
                ),
              )}
            </div>
          )}
        </div>

        <Link
          to="/tools/$slug"
          params={{ slug: tool.slug }}
          className="hidden h-full min-h-28 overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] no-underline shadow-[inset_0_1px_0_var(--inset-glint)] sm:block"
        >
          {tool.screenshotUrl ? (
            <img
              src={tool.screenshotUrl}
              alt={`${tool.name} screenshot`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full min-h-28 flex-col justify-between bg-[linear-gradient(160deg,rgba(79,184,178,0.2),rgba(255,255,255,0.82))] p-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                Snapshot
              </span>
              <span className="text-sm font-semibold text-[var(--sea-ink)]">{tool.name}</span>
            </div>
          )}
        </Link>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <SaveToolButton
            toolId={tool.id}
            initialIsSaved={tool.isSaved}
            initialSaveCount={tool.saveCount}
          />
          {categories.slice(0, 2).map((category) => (
            <Link
              key={category.id}
              to="/tools/category/$slug"
              params={{ slug: category.slug }}
              className="text-xs font-medium text-[var(--sea-ink-soft)] no-underline transition hover:text-[var(--lagoon-deep)]"
            >
              {category.name}
            </Link>
          ))}
        </div>
        <Link
          to="/tools/$slug"
          params={{ slug: tool.slug }}
          className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--lagoon)] no-underline transition hover:text-[var(--lagoon-deep)]"
        >
          Open
        </Link>
      </div>
    </article>
  )
}
