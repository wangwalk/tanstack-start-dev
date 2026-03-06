import { createFileRoute, Link } from '@tanstack/react-router'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '#/lib/site'
import {
  getFeaturedTools,
  getNewTools,
  getCategoriesWithCount,
  getDirectoryStats,
  getTagsWithCount,
} from '#/lib/public'
import { ToolCard } from '#/components/tools/ToolCard'
import { websiteSchema } from '#/components/seo/JsonLd'
import { m } from '#/paraglide/messages.js'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [stats, featured, newest, categories, tags] = await Promise.all([
      getDirectoryStats(),
      getFeaturedTools(),
      getNewTools({ data: { limit: 6 } }),
      getCategoriesWithCount(),
      getTagsWithCount(),
    ])
    return { stats, featured, newest, categories, trendingTags: tags.slice(0, 12) }
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
  const topCategories = categories.filter((cat) => !cat.parentId && cat.toolCount > 0)

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q') as string
    if (q.trim()) {
      void navigate({ to: '/tools/search', search: { q: q.trim() } })
    }
  }

  return (
    <main className="page-wrap px-4 pb-16 pt-14">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 sm:py-16 md:py-20">
          <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
          <p className="island-kicker mb-3">{m.home_hero_kicker()}</p>
          <h1 className="display-title mb-5 max-w-4xl text-4xl font-bold leading-[1.02] tracking-tight text-[var(--sea-ink)] sm:text-5xl md:text-6xl">
            {m.home_hero_title()}
          </h1>
          <p className="mb-8 max-w-3xl text-base leading-relaxed text-[var(--sea-ink-soft)] sm:text-lg">
            {m.home_hero_description()}
          </p>

          <form onSubmit={handleSearch} className="max-w-3xl">
            <div className="flex flex-col gap-3 rounded-[1.8rem] border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_92%,white)] p-3 shadow-[0_18px_50px_rgba(31,84,72,0.08)] sm:flex-row sm:items-center">
              <input
                name="q"
                type="search"
                placeholder={m.home_hero_search_placeholder()}
                className="h-14 flex-1 rounded-[1.1rem] border border-transparent bg-white/55 px-5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/55 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20"
              />
              <button
                type="submit"
                className="h-14 shrink-0 rounded-[1.1rem] bg-[var(--lagoon)] px-6 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,184,178,0.28)] transition hover:bg-[var(--lagoon-deep)]"
              >
                {m.home_hero_search_button()}
              </button>
            </div>
            <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">{m.home_hero_search_hint()}</p>
          </form>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/tools"
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
            >
              {m.home_hero_browse_tools()}
            </Link>
            <Link
              to="/tools/submit"
              className="rounded-full border border-[rgba(23,58,64,0.16)] bg-white/55 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.32)]"
            >
              {m.home_hero_submit_tool()}
            </Link>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="island-shell rise-in rounded-[2rem] p-5">
            <p className="island-kicker mb-4">{m.home_trending_kicker()}</p>
            <div className="grid gap-3">
              {[
                [stats.toolCount.toLocaleString(), m.home_stats_tools()],
                [stats.categoryCount.toString(), m.home_stats_categories()],
                [stats.tagCount.toString(), m.home_stats_tags()],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                    {label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-[var(--lagoon-deep)]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="island-shell rise-in rounded-[2rem] p-5">
            <p className="island-kicker mb-2">{m.home_submit_kicker()}</p>
            <h2 className="display-title text-xl font-bold tracking-tight text-[var(--sea-ink)]">
              {m.home_submit_title()}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
              {m.home_submit_description()}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                to="/tools/submit"
                className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-4 py-2.5 text-center text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(79,184,178,0.3)] transition hover:bg-[var(--lagoon-deep)]"
              >
                {m.home_submit_primary()}
              </Link>
              <Link
                to="/listing-pricing"
                className="rounded-full border border-[var(--line)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
              >
                {m.home_submit_secondary()}
              </Link>
            </div>
          </div>
        </aside>
      </section>

      {trendingTags.length > 0 && (
        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="island-kicker mb-1">{m.home_trending_kicker()}</p>
              <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
                {m.home_trending_title()}
              </h2>
            </div>
            <Link
              to="/tools/tags"
              className="text-sm font-medium text-[var(--lagoon)] no-underline hover:underline"
            >
              {m.home_trending_view_all()}
            </Link>
          </div>
          <div className="-mx-4 overflow-x-auto px-4">
            <div className="flex min-w-max gap-2 pb-2">
              {trendingTags.map((tag, index) => (
                <Link
                  key={tag.id}
                  to="/tools/tag/$slug"
                  params={{ slug: tag.slug }}
                  className="island-shell rise-in rounded-full px-4 py-2 text-sm font-medium text-[var(--sea-ink-soft)] no-underline transition hover:-translate-y-0.5 hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  #{tag.name}
                  <span className="ml-2 text-xs text-[var(--sea-ink-soft)]/70">{tag.toolCount}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="island-kicker mb-1">{m.home_featured_kicker()}</p>
              <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
                {m.home_featured_title()}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--sea-ink-soft)]">
                {m.home_featured_description()}
              </p>
            </div>
            <Link
              to="/tools"
              className="text-sm font-medium text-[var(--lagoon)] no-underline hover:underline"
            >
              {m.home_featured_view_all()}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featured.slice(0, 6).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {newest.length > 0 && (
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="island-kicker mb-1">{m.home_newest_kicker()}</p>
              <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
                {m.home_newest_title()}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--sea-ink-soft)]">
                {m.home_newest_description()}
              </p>
            </div>
            <Link
              to="/tools/search"
              search={{ sort: 'latest' }}
              className="text-sm font-medium text-[var(--lagoon)] no-underline hover:underline"
            >
              {m.home_newest_view_all()}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {newest.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {topCategories.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="island-kicker mb-1">{m.home_categories_kicker()}</p>
              <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
                {m.home_categories_title()}
              </h2>
            </div>
            <Link
              to="/tools/categories"
              className="text-sm font-medium text-[var(--lagoon)] no-underline hover:underline"
            >
              {m.home_categories_view_all()}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {topCategories.map((cat, i) => (
              <Link
                key={cat.id}
                to="/tools/category/$slug"
                params={{ slug: cat.slug }}
                className="island-shell rise-in group flex min-h-28 flex-col justify-between rounded-[1.4rem] p-4 no-underline transition hover:-translate-y-0.5 hover:ring-1 hover:ring-[var(--lagoon)]"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-2xl">{cat.icon ?? '🔧'}</span>
                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                    {cat.toolCount} tools
                  </span>
                </div>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
                    {cat.name}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--sea-ink-soft)]">
                    {m.home_categories_tool_count({ count: cat.toolCount })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
