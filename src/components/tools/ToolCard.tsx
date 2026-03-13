import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import type { PublicToolCard } from '#/lib/public'
import { pricingBadgeClass, pricingLabel } from '#/lib/pricing-display'
import { SaveToolButton } from '#/components/tools/SaveToolButton'

interface ToolCardProps {
  tool: PublicToolCard
}

export function ToolCard({ tool }: ToolCardProps) {
  const { categories, previewLinks } = useMemo(() => {
    const cats = tool.categories.slice(0, 2)
    const tagLinks = tool.tags.slice(0, 4)
    const fallbackLinks = cats
      .filter((category) => !tagLinks.some((entry) => entry.slug === category.slug))
      .slice(0, Math.max(0, 4 - tagLinks.length))
    return {
      categories: cats,
      previewLinks: [
        ...tagLinks.map((entry) => ({ ...entry, kind: 'tag' as const, label: `#${entry.name}` })),
        ...fallbackLinks.map((entry) => ({ ...entry, kind: 'category' as const, label: entry.name })),
      ],
    }
  }, [tool.categories, tool.tags])

  return (
    <article className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-4 transition hover:-translate-y-0.5">
      <div className="grid gap-4 md:grid-cols-[1fr_108px]">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            {tool.logoUrl ? (
              <img
                src={tool.logoUrl}
                alt={`${tool.name} logo`}
                loading="lazy"
                className="h-11 w-11 shrink-0 rounded-2xl object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                {tool.name.charAt(0) || '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/tools/$slug"
                  params={{ slug: tool.slug }}
                  className="truncate font-semibold text-foreground no-underline transition hover:text-primary"
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
                <p className="mt-1 truncate text-xs text-muted-foreground">{categories[0].name}</p>
              )}
            </div>
          </div>

          {tool.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
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
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground no-underline transition hover:border-primary hover:text-primary"
                  >
                    {entry.label}
                  </Link>
                ) : (
                  <Link
                    key={`${entry.kind}-${entry.id}`}
                    to="/tools/category/$slug"
                    params={{ slug: entry.slug }}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground no-underline transition hover:border-primary hover:text-primary"
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
          className="hidden h-full min-h-28 overflow-hidden rounded-[1.25rem] border border-border bg-card no-underline md:block"
        >
          {tool.screenshotUrl ? (
            <img
              src={tool.screenshotUrl}
              alt={`${tool.name} screenshot`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full min-h-28 flex-col justify-between bg-muted p-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Snapshot
              </span>
              <span className="text-sm font-semibold text-foreground">{tool.name}</span>
            </div>
          )}
        </Link>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <SaveToolButton
            toolId={tool.id}
            initialIsSaved={tool.isSaved}
            initialSaveCount={tool.saveCount}
          />
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/tools/category/$slug"
              params={{ slug: category.slug }}
              className="text-xs font-medium text-muted-foreground no-underline transition hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </div>
        <Link
          to="/tools/$slug"
          params={{ slug: tool.slug }}
          className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-primary no-underline transition hover:text-primary"
        >
          Open
        </Link>
      </div>
    </article>
  )
}
