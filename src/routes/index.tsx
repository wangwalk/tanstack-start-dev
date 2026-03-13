import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { websiteSchema } from '#/components/seo/JsonLd'
import { ToolListItem } from '#/components/tools/ToolListItem'
import { FeaturedSidebar } from '#/components/tools/FeaturedSidebar'
import { NewsSidebar } from '#/components/tools/NewsSidebar'
import {
  getCategoriesWithCount,
  getDirectoryStats,
  getFeaturedTools,
  getNewTools,
  getTagsWithCount,
} from '#/lib/public'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '#/lib/site'
import { m } from '#/paraglide/messages.js'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    const viewerUserId = context.session?.user.id
    const [stats, featured, newest, categories, tags] = await Promise.all([
      getDirectoryStats(),
      getFeaturedTools({ data: { viewerUserId } }),
      getNewTools({ data: { limit: 20, viewerUserId } }),
      getCategoriesWithCount(),
      getTagsWithCount(),
    ])

    return {
      stats,
      featured,
      newest,
      categories,
      trendingTags: tags.slice(0, 12),
    }
  },
  head: () => ({
    links: [{ rel: 'canonical', href: SITE_URL }],
    meta: [
      { title: SITE_TITLE },
      { name: 'description', content: SITE_DESCRIPTION },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:title', content: SITE_TITLE },
      { property: 'og:description', content: SITE_DESCRIPTION },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(websiteSchema(SITE_URL, SITE_TITLE)),
      },
    ],
  }),
  component: LandingPage,
})

type TabKey = 'today' | 'new' | 'saved' | 'free'

function LandingPage() {
  const { stats, featured, newest, categories, trendingTags } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('today')

  const topCategories = useMemo(() => categories.filter((cat) => !cat.parentId && cat.toolCount > 0), [categories])

  const allTools = useMemo(() => {
    const seen = new Set<string>()
    const result: typeof featured = []
    for (const t of [...featured, ...newest]) {
      if (!seen.has(t.id)) {
        seen.add(t.id)
        result.push(t)
      }
    }
    return result
  }, [featured, newest])

  const displayTools = useMemo(() => {
    switch (activeTab) {
      case 'today':
        return allTools.slice(0, 15)
      case 'new':
        return newest
      case 'saved':
        return [...allTools].sort((a, b) => b.saveCount - a.saveCount).slice(0, 15)
      case 'free':
        return allTools.filter((t) => t.pricingType === 'free' || t.pricingType === 'open_source').slice(0, 15)
    }
  }, [activeTab, allTools, newest])

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q') as string
    if (q.trim()) {
      void navigate({ to: '/tools/search', search: { q: q.trim() } })
    }
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'new', label: 'New' },
    { key: 'saved', label: 'Most Saved' },
    { key: 'free', label: 'Free' },
  ]

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      {/* Hero */}
      <section className="py-8">
        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {m.home_hero_title()}{' '}
          <span className="bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
            AI Tools
          </span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {stats.toolCount.toLocaleString()} AIs and {stats.categoryCount} categories updated daily. {m.home_hero_description()}
        </p>

        <form onSubmit={handleSearch} className="mt-5 flex max-w-xl gap-2">
          <Input
            name="q"
            type="search"
            aria-label="Search tools"
            placeholder={m.home_hero_search_placeholder()}
            className="h-10 flex-1"
          />
          <Button type="submit" className="h-10 px-6 text-sm font-semibold">
            {m.home_hero_search_button()}
          </Button>
        </form>
      </section>

      {/* Three-column layout */}
      <div className="grid gap-6 lg:grid-cols-[220px_1fr_280px]">
        {/* Left sidebar - featured */}
        <div className="hidden lg:block lg:sticky lg:top-16 lg:self-start">
          <FeaturedSidebar tools={featured.slice(0, 8)} />
        </div>

        {/* Center column */}
        <div>
          {/* Tab bar */}
          <div className="mb-4 flex items-center gap-1 border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tool list */}
          <div>
            {displayTools.map((tool) => (
              <ToolListItem key={tool.id} tool={tool} />
            ))}
          </div>

          {displayTools.length > 0 && (
            <div className="mt-4 text-center">
              <Link to="/tools" className="no-underline">
                <Button variant="outline" size="sm">{m.home_featured_view_all()}</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="hidden lg:block lg:sticky lg:top-16 lg:self-start">
          <NewsSidebar trendingTags={trendingTags} />
        </div>
      </div>

      {/* Category grid - full width */}
      {topCategories.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">{m.home_categories_title()}</h2>
            <Link
              to="/tools/categories"
              className="text-sm font-medium text-primary no-underline hover:underline"
            >
              {m.home_categories_view_all()}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {topCategories.map((cat) => (
              <Link
                key={cat.id}
                to="/tools/category/$slug"
                params={{ slug: cat.slug }}
                className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 no-underline transition hover:border-primary"
              >
                <span className="text-lg">{cat.icon ?? '🔧'}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.toolCount} tools</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
