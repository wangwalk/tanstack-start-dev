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
    <article className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-4 transition hover:border-primary/40">
      <div className="flex items-start gap-3">
        {tool.logoUrl ? (
          <img
            src={tool.logoUrl}
            alt={`${tool.name} logo`}
            loading="lazy"
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {tool.name.charAt(0) || '?'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/tools/$slug"
              params={{ slug: tool.slug }}
              className="truncate text-sm font-semibold text-foreground no-underline transition hover:text-primary"
            >
              {tool.name}
            </Link>
            <span
              className={`rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${pricingBadgeClass[tool.pricingType] ?? pricingBadgeClass.free}`}
            >
              {pricingLabel[tool.pricingType] ?? tool.pricingType}
            </span>
            {tool.isFeatured && <span className="badge-sponsor">Featured</span>}
          </div>
          {categories[0] && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{categories[0].name}</p>
          )}
        </div>
      </div>

      {tool.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {tool.description}
        </p>
      )}

      {previewLinks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {previewLinks.map((entry) => (
            <Link
              key={`${entry.kind}-${entry.id}`}
              to={entry.kind === 'tag' ? '/tools/tag/$slug' : '/tools/category/$slug'}
              params={{ slug: entry.slug }}
              className="rounded-sm border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground no-underline transition hover:border-primary hover:text-primary"
            >
              {entry.label}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
        <SaveToolButton
          toolId={tool.id}
          initialIsSaved={tool.isSaved}
          initialSaveCount={tool.saveCount}
        />
        <Link
          to="/tools/$slug"
          params={{ slug: tool.slug }}
          className="text-xs font-medium text-primary no-underline hover:underline"
        >
          View →
        </Link>
      </div>
    </article>
  )
}
