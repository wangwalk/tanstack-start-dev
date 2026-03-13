import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { m } from '#/paraglide/messages.js'

interface TagItem {
  id: string
  name: string
  slug: string
  toolCount: number
}

interface NewsSidebarProps {
  trendingTags: TagItem[]
}

export function NewsSidebar({ trendingTags }: NewsSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Trending tags */}
      {trendingTags.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{m.home_trending_title()}</h2>
            <Link
              to="/tools/tags"
              className="text-xs font-medium text-primary no-underline hover:underline"
            >
              {m.home_trending_view_all()}
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.map((tag) => (
              <Link
                key={tag.id}
                to="/tools/tag/$slug"
                params={{ slug: tag.slug }}
                className="rounded-sm border border-border bg-card px-2 py-1 text-xs text-muted-foreground no-underline transition hover:border-primary hover:text-primary"
              >
                #{tag.name}
                <span className="ml-1 text-[10px] text-muted-foreground/60">{tag.toolCount}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Submit CTA */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">{m.home_submit_title()}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {m.home_submit_description()}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Button asChild size="sm" className="w-full text-xs">
            <Link to="/tools/submit" className="no-underline">{m.home_submit_primary()}</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full text-xs">
            <Link to="/listing-pricing" className="no-underline">{m.home_submit_secondary()}</Link>
          </Button>
        </div>
      </div>
    </aside>
  )
}
