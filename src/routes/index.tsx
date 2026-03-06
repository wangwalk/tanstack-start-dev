import { createFileRoute, Link } from '@tanstack/react-router'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '#/lib/site'
import { getFeaturedTools, getNewTools, getCategoriesWithCount, getDirectoryStats } from '#/lib/public'
import { ToolCard } from '#/components/tools/ToolCard'
import NewsletterForm from '#/components/NewsletterForm'
import { websiteSchema } from '#/components/seo/JsonLd'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [stats, featured, newest, categories] = await Promise.all([
      getDirectoryStats(),
      getFeaturedTools(),
      getNewTools({ data: { limit: 6 } }),
      getCategoriesWithCount(),
    ])
    return { stats, featured, newest, categories: categories.slice(0, 8) }
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

const FAQ = [
  {
    q: '收录的工具都经过审核吗？',
    a: '是的。所有提交的工具都由我们的团队手动审核，确保质量和真实性后才会上线。',
  },
  {
    q: '如何提交我的工具？',
    a: '点击"提交工具"，填写工具信息后免费提交。付费的 Standard 或 Featured 套餐可获得更快审核和更高曝光。',
  },
  {
    q: '付费收录和免费收录有什么区别？',
    a: 'Standard（$39）包含 dofollow 反链、Verified badge、截图展示和分类页优先排序。Featured（$99）在此基础上还有首页精选展示、自定义 CTA 按钮和 Newsletter 推荐。',
  },
  {
    q: '付费收录会过期吗？',
    a: '不会。付费收录为一次性永久有效，无需续费。',
  },
  {
    q: '如何搜索特定类型的工具？',
    a: '可以通过分类浏览、标签筛选，或直接使用搜索功能找到你需要的工具。',
  },
]

function LandingPage() {
  const { stats, featured, newest, categories } = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 pb-16 pt-14">
      {/* Hero */}
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 sm:py-16 md:py-20">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">AI Tool Directory</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-[var(--sea-ink)] sm:text-5xl md:text-6xl">
          发现最适合你的 AI 工具
        </h1>
        <p className="mb-8 max-w-2xl text-base leading-relaxed text-[var(--sea-ink-soft)] sm:text-lg">
          精选收录数百款经过审核的 AI 工具，按分类、定价、使用场景分类整理。
          找到你需要的，一站搞定。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/tools"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
          >
            浏览所有工具
          </Link>
          <Link
            to="/tools/submit"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-6 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)] dark:bg-white/10"
          >
            提交你的工具
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-8">
        <div className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              [stats.toolCount.toLocaleString() + '+', '收录工具'],
              [stats.categoryCount.toString(), '工具分类'],
              [stats.tagCount.toString(), '标签'],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="display-title m-0 text-3xl font-bold text-[var(--lagoon-deep)] sm:text-4xl">
                  {value}
                </p>
                <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured tools */}
      {featured.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="island-kicker mb-1">精选推荐</p>
              <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
                Featured Tools
              </h2>
            </div>
            <Link
              to="/tools"
              className="text-sm font-medium text-[var(--lagoon)] no-underline hover:underline"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mt-14">
          <div className="mb-6">
            <p className="island-kicker mb-1">分类浏览</p>
            <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
              按场景找工具
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to="/tools/category/$slug"
                params={{ slug: cat.slug }}
                className="island-shell rise-in flex items-center gap-3 rounded-xl p-4 no-underline transition hover:-translate-y-0.5 hover:ring-1 hover:ring-[var(--lagoon)]"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="text-2xl">{cat.icon ?? '🔧'}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">{cat.name}</p>
                  <p className="text-xs text-[var(--sea-ink-soft)]">{cat.toolCount} 工具</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              to="/tools"
              className="text-sm font-medium text-[var(--lagoon)] no-underline hover:underline"
            >
              查看全部分类 →
            </Link>
          </div>
        </section>
      )}

      {/* Newest tools */}
      {newest.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="island-kicker mb-1">最新收录</p>
              <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/tools"
              className="text-sm font-medium text-[var(--lagoon)] no-underline hover:underline"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newest.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto mt-16 max-w-2xl">
        <div className="mb-8 text-center">
          <p className="island-kicker mb-2">FAQ</p>
          <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
            常见问题
          </h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="island-shell group rounded-xl px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[var(--sea-ink)]">
                {item.q}
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 shrink-0 text-[var(--sea-ink-soft)] transition group-open:rotate-180"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--sea-ink-soft)]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto mt-16 max-w-xl text-center">
        <div className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10">
          <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.2),transparent_66%)]" />
          <p className="island-kicker mb-2">Newsletter</p>
          <h2 className="display-title mb-2 text-xl font-bold tracking-tight text-[var(--sea-ink)]">
            每周精选 AI 工具推送
          </h2>
          <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
            订阅后每周收到 5 款精选工具推荐，不错过任何好工具。
          </p>
          <NewsletterForm />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-12">
        <div className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.24),transparent_66%)]" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.14),transparent_66%)]" />
          <h2 className="display-title mb-4 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
            有好工具想推荐？
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-[var(--sea-ink-soft)]">
            免费提交，审核通过即可上线。付费 Featured 可获得首页展示和 Newsletter 推荐。
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/tools/submit"
              className="inline-block rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-8 py-3 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
            >
              免费提交工具
            </Link>
            <Link
              to="/listing-pricing"
              className="inline-block rounded-full border border-[var(--line)] bg-[var(--surface)] px-8 py-3 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[var(--lagoon)]"
            >
              查看付费套餐
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
