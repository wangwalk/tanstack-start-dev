import { createFileRoute, Link } from '@tanstack/react-router'
import { getFeaturedTools, getNewTools, getCategoriesWithCount } from '#/lib/public'
import { ToolCard } from '#/components/tools/ToolCard'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/tools/')({
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/tools` }],
    meta: [
      { title: `AI 工具导航 | ${SITE_TITLE}` },
      { name: 'description', content: '发现最好的 AI 工具 — 按分类浏览、精选推荐、最新上架。' },
    ],
  }),
  loader: async ({ context }) => {
    const viewerUserId = context.session?.user.id
    const [featured, newTools, categories] = await Promise.all([
      getFeaturedTools({ data: { viewerUserId } }),
      getNewTools({ data: { limit: 12, viewerUserId } }),
      getCategoriesWithCount(),
    ])
    return { featured, newTools, categories }
  },
  component: ToolsHomePage,
})

function ToolsHomePage() {
  const { featured, newTools, categories } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const topCategories = categories.filter((c) => !c.parentId).slice(0, 8)

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q') as string
    if (q.trim()) {
      void navigate({ to: '/tools/search', search: { q: q.trim() } })
    }
  }

  return (
    <main className="page-wrap px-4 pb-16 pt-14">
      {/* Hero */}
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[var(--deco-a)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[var(--deco-b)]" />
        <p className="island-kicker mb-3">AI 工具目录</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          发现最好的 AI 工具
        </h1>
        <p className="mb-8 max-w-2xl text-base leading-relaxed text-[var(--sea-ink-soft)] sm:text-lg">
          精选 {categories.reduce((s, c) => s + c.toolCount, 0)}+ 款 AI 工具，按分类整理，持续更新。
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex max-w-lg gap-2">
          <input
            name="q"
            type="search"
            placeholder="搜索工具名称或描述..."
            className="flex-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-3 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20"
          />
          <button
            type="submit"
            className="btn-brand px-6 py-3"
          >
            搜索
          </button>
        </form>

        {/* Category shortcuts */}
        {topCategories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {topCategories.map((cat) => (
              <Link
                key={cat.id}
                to="/tools/category/$slug"
                params={{ slug: cat.slug }}
                className="rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-1.5 text-xs font-medium text-[var(--sea-ink-soft)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="island-kicker mb-1">精选推荐</p>
              <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">编辑精选工具</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}

      {/* New tools */}
      {newTools.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="island-kicker mb-1">最新上架</p>
              <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">最近收录的工具</h2>
            </div>
            <Link
              to="/tools/search"
              search={{ sort: 'latest' }}
              className="text-sm font-medium text-[var(--lagoon)] hover:underline"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {newTools.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}

      {/* Popular categories */}
      {categories.length > 0 && (
        <section className="mt-16">
          <div className="mb-6">
            <p className="island-kicker mb-1">热门分类</p>
            <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">按分类发现工具</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories
              .filter((c) => !c.parentId && c.toolCount > 0)
              .map((cat) => (
                <Link
                  key={cat.id}
                  to="/tools/category/$slug"
                  params={{ slug: cat.slug }}
                  className="island-shell feature-card group flex items-center gap-4 rounded-2xl p-4 no-underline transition hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--lagoon-glow)] text-2xl">
                    {cat.icon ?? '🔧'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
                      {cat.name}
                    </p>
                    <p className="text-sm text-[var(--sea-ink-soft)]">{cat.toolCount} 个工具</p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* All categories */}
      {categories.filter((c) => c.parentId).length > 0 && (
        <section className="mt-16">
          <div className="mb-6">
            <h2 className="display-title text-xl font-bold text-[var(--sea-ink)]">全部子分类</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((c) => c.parentId && c.toolCount > 0)
              .map((cat) => (
                <Link
                  key={cat.id}
                  to="/tools/category/$slug"
                  params={{ slug: cat.slug }}
                  className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--sea-ink-soft)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
                >
                  {cat.name}
                  <span className="ml-1.5 text-xs text-[var(--sea-ink-soft)]/60">{cat.toolCount}</span>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section className="mt-16">
        <div className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[var(--deco-a)]" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[var(--deco-b)]" />
          <h2 className="display-title mb-4 text-2xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-3xl">
            发现了好用的 AI 工具？
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-[var(--sea-ink-soft)]">
            欢迎提交到目录，帮助更多人发现优质 AI 工具。
          </p>
          <Link
            to="/tools/submit"
            className="btn-brand inline-block px-8 py-3 no-underline"
          >
            提交工具
          </Link>
        </div>
      </section>
    </main>
  )
}
