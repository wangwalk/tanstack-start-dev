import { Link } from '@tanstack/react-router'
import type { PublicToolCard } from '#/lib/public'
import { pricingBadgeClass, pricingLabel } from '#/lib/pricing-display'

interface ToolListItemProps {
  tool: PublicToolCard
}

export function ToolListItem({ tool }: ToolListItemProps) {
  const tags = tool.tags.slice(0, 4)
  const categories = tool.categories.slice(0, 2)

  return (
    <article className="flex items-start gap-3 border-b border-border py-4">
      {/* Logo */}
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

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/tools/$slug"
            params={{ slug: tool.slug }}
            className="text-sm font-semibold text-foreground no-underline hover:text-primary"
          >
            {tool.name}
          </Link>
          {tool.isFeatured && (
            <span className="badge-sponsor">Featured</span>
          )}
          <span
            className={`rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${pricingBadgeClass[tool.pricingType] ?? pricingBadgeClass.free}`}
          >
            {pricingLabel[tool.pricingType] ?? tool.pricingType}
          </span>
        </div>

        {tool.description && (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {tool.description}
          </p>
        )}

        {(tags.length > 0 || categories.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to="/tools/category/$slug"
                params={{ slug: cat.slug }}
                className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground no-underline hover:text-primary"
              >
                {cat.name}
              </Link>
            ))}
            {tags.map((tag) => (
              <Link
                key={tag.id}
                to="/tools/tag/$slug"
                params={{ slug: tag.slug }}
                className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground no-underline hover:text-primary"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
