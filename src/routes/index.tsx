import { createFileRoute, Link } from '@tanstack/react-router'
import { websiteSchema } from '#/components/seo/JsonLd'
import { ToolCard } from '#/components/tools/ToolCard'
import {
  getCategoriesWithCount,
  getDirectoryStats,
  getFeaturedTools,
  getNewTools,
  getTagsWithCount,
} from '#/lib/public'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '#/lib/site'
import { useMemo } from 'react'
import { m } from '#/paraglide/messages.js'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    const viewerUserId = context.session?.user.id
    const [stats, featured, newest, categories, tags] = await Promise.all([
      getDirectoryStats(),
      getFeaturedTools({ data: { viewerUserId } }),
      getNewTools({ data: { limit: 6, viewerUserId } }),
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

function LandingPage() {
  const { stats, featured, newest, categories, trendingTags } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const topCategories = useMemo(() => categories.filter((cat) => !cat.parentId && cat.toolCount > 0), [categories])
  const leadingCategories = useMemo(() => topCategories.slice(0, 4), [topCategories])

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q') as string
    if (q.trim()) {
      void navigate({ to: '/tools/search', search: { q: q.trim() } })
    }
  }

  return (
    <main className="page-wrap px-4 pb-16 pt-14">
      <div className="grid gap-10 xl:grid-cols-[1fr_320px] xl:items-start">
        <section className="space-y-10">
          <section className="border border-border bg-card shadow-sm rise-in relative overflow-hidden rounded-[2.2rem] px-6 py-12 sm:px-10 sm:py-16 md:py-[4.5rem]">
            <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_260px] xl:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{m.home_hero_kicker()}</p>
                <h1 className="mb-5 max-w-4xl text-4xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  {m.home_hero_title()}
                </h1>
                <p className="mb-8 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {m.home_hero_description()}
                </p>

                <form onSubmit={handleSearch} className="max-w-3xl">
                  <div className="flex flex-col gap-3 rounded-[1.8rem] border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
                    <Input
                      name="q"
                      type="search"
                      aria-label="Search tools"
                      placeholder={m.home_hero_search_placeholder()}
                      className="h-14 flex-1 rounded-[1.1rem]"
                    />
                    <Button
                      type="submit"
                      className="h-14 shrink-0 rounded-[1.1rem] px-6 text-sm font-semibold"
                    >
                      {m.home_hero_search_button()}
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{m.home_hero_search_hint()}</p>
                </form>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    to="/tools"
                    className="no-underline"
                  >
                    <Button>{m.home_hero_browse_tools()}</Button>
                  </Link>
                  <Link
                    to="/tools/submit"
                    className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground no-underline transition hover:-translate-y-0.5 hover:border-border"
                  >
                    {m.home_hero_submit_tool()}
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {[
                  [stats.toolCount.toLocaleString(), m.home_stats_tools()],
                  [stats.categoryCount.toString(), m.home_stats_categories()],
                  [stats.tagCount.toString(), m.home_stats_tags()],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-[1.4rem] border border-border bg-card px-4 py-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {featured.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{m.home_featured_kicker()}</p>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {m.home_featured_title()}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    {m.home_featured_description()}
                  </p>
                </div>
                <Link
                  to="/tools"
                  className="text-sm font-medium text-primary no-underline hover:underline"
                >
                  {m.home_featured_view_all()}
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.slice(0, 6).map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )}

          {newest.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{m.home_newest_kicker()}</p>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {m.home_newest_title()}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    {m.home_newest_description()}
                  </p>
                </div>
                <Link
                  to="/tools/search"
                  search={{ sort: 'latest' }}
                  className="text-sm font-medium text-primary no-underline hover:underline"
                >
                  {m.home_newest_view_all()}
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {newest.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )}

          {topCategories.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{m.home_categories_kicker()}</p>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {m.home_categories_title()}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Browse the full atlas instead of a hand-picked shortlist.
                  </p>
                </div>
                <Link
                  to="/tools/categories"
                  className="text-sm font-medium text-primary no-underline hover:underline"
                >
                  {m.home_categories_view_all()}
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {topCategories.map((cat, index) => (
                  <Link
                    key={cat.id}
                    to="/tools/category/$slug"
                    params={{ slug: cat.slug }}
                    className="rounded-xl border border-border bg-card shadow-sm rise-in no-underline"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center justify-center rounded-xl bg-primary/10">{cat.icon ?? '🔧'}</span>
                      <span className="rounded-full border border-border bg-muted px-2 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">{cat.toolCount} tools</span>
                    </div>
                    <div className="mt-6">
                      <p className="text-sm font-bold text-foreground">{cat.name}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {m.home_categories_tool_count({ count: cat.toolCount })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </section>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <section className="border border-border bg-card shadow-sm rise-in rounded-[2rem] p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Category Atlas</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {m.home_sidebar_title()}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {m.home_sidebar_description()}
            </p>

            <div className="mt-5 grid gap-3">
              {leadingCategories.map((category) => (
                <Link
                  key={category.id}
                  to="/tools/category/$slug"
                  params={{ slug: category.slug }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:bg-accent no-underline"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{category.icon ?? '🔧'}</span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">
                        {category.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {category.toolCount} indexed tools
                      </span>
                    </span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Open
                  </span>
                </Link>
              ))}
            </div>

            <Link
              to="/tools/categories"
              className="mt-5 inline-flex no-underline"
            >
              <Button>Open category atlas</Button>
            </Link>
          </section>

          {trendingTags.length > 0 && (
            <section className="border border-border bg-card shadow-sm rise-in rounded-[2rem] p-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{m.home_trending_kicker()}</p>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {m.home_trending_title()}
                  </h2>
                </div>
                <Link
                  to="/tools/tags"
                  className="text-sm font-medium text-primary no-underline hover:underline"
                >
                  {m.home_trending_view_all()}
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag, index) => (
                  <Link
                    key={tag.id}
                    to="/tools/tag/$slug"
                    params={{ slug: tag.slug }}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground no-underline transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    #{tag.name}
                    <span className="ml-1.5 text-xs text-muted-foreground/70">{tag.toolCount}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="border border-border bg-card shadow-sm rise-in rounded-[2rem] p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{m.home_submit_kicker()}</p>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {m.home_submit_title()}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {m.home_submit_description()}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                to="/tools/submit"
                className="text-center no-underline"
              >
                <Button className="w-full">{m.home_submit_primary()}</Button>
              </Link>
              <Link
                to="/listing-pricing"
                className="text-center no-underline"
              >
                <Button variant="outline" className="w-full">{m.home_submit_secondary()}</Button>
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}
