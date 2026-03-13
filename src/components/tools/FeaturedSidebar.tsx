import { Link } from '@tanstack/react-router'
import type { PublicToolCard } from '#/lib/public'

interface FeaturedSidebarProps {
  tools: PublicToolCard[]
}

export function FeaturedSidebar({ tools }: FeaturedSidebarProps) {
  if (tools.length === 0) return null

  return (
    <aside className="space-y-1">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Featured</h2>
      {tools.map((tool) => (
        <Link
          key={tool.id}
          to="/tools/$slug"
          params={{ slug: tool.slug }}
          className="sidebar-accent-card flex items-start gap-2.5 rounded-sm py-2 no-underline transition hover:bg-accent"
        >
          {tool.logoUrl ? (
            <img
              src={tool.logoUrl}
              alt={`${tool.name} logo`}
              loading="lazy"
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {tool.name.charAt(0) || '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{tool.name}</p>
            {tool.description && (
              <p className="line-clamp-1 text-xs text-muted-foreground">{tool.description}</p>
            )}
          </div>
        </Link>
      ))}
    </aside>
  )
}
