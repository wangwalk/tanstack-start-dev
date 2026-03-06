import { createFileRoute, Link } from '@tanstack/react-router'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '#/lib/site'
import { getFeaturedTools, getNewTools, getCategoriesWithCount, getDirectoryStats } from '#/lib/public'
import { ToolCard } from '#/components/tools/ToolCard'
import NewsletterForm from '#/components/NewsletterForm'
import { websiteSchema } from '#/components/seo/JsonLd'
import { m } from '#/paraglide/messages.js'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [stats, featured, newest, categories] = await Promise.all([
      getDirectoryStats(),
      getFeaturedTools(),
      getNewTools({ data: { limit: 6 } }),
      getCategoriesWithCount(),
    ])
    return { stats, featured, newest, categories }
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
  { q: () => m.home_faq_q1(), a: () => m.home_faq_a1() },
  { q: () => m.home_faq_q2(), a: () => m.home_faq_a2() },
  { q: () => m.home_faq_q3(), a: () => m.home_faq_a3() },
  { q: () => m.home_faq_q4(), a: () => m.home_faq_a4() },
  { q: () => m.home_faq_q5(), a: () => m.home_faq_a5() },
]

function LandingPage() {
  const { stats, featured, newest, categories } = Route.useLoaderData()
  const topCategories = categories.filter((cat) => !cat.parentId && cat.toolCount > 0)

  return (
    <main className="page-wrap px-4 pb-16 pt-14">
      {/* Hero */}
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 sm:py-16 md:py-20">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">{m.home_hero_kicker()}</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-[var(--sea-ink)] sm:text-5xl md:text-6xl">
          {m.home_hero_title()}
        </h1>
        <p className="mb-8 max-w-2xl text-base leading-relaxed text-[var(--sea-ink-soft)] sm:text-lg">
          {m.home_hero_description()}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/tools"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
          >
            {m.home_hero_browse_tools()}
          </Link>
          <Link
            to="/tools/submit"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-6 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)] dark:bg-white/10"
          >
            {m.home_hero_submit_tool()}
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-8">
        <div className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              [stats.toolCount.toLocaleString() + '+', m.home_stats_tools()],
              [stats.categoryCount.toString(), m.home_stats_categories()],
              [stats.tagCount.toString(), m.home_stats_tags()],
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
              <p className="island-kicker mb-1">{m.home_featured_kicker()}</p>
              <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
                {m.home_featured_title()}
              </h2>
            </div>
            <Link
              to="/tools"
              className="text-sm font-medium text-[var(--lagoon)] no-underline hover:underline"
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

      {/* Categories */}
      {topCategories.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="island-kicker mb-1">{m.home_categories_kicker()}</p>
            <Link
              to="/tools/categories"
              className="text-sm font-medium text-[var(--lagoon)] no-underline hover:underline"
            >
              查看分类索引
            </Link>
          </div>
          <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
            {m.home_categories_title()}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--sea-ink-soft)]">
            从完整的顶级分类出发，快速找到适合的 AI 工具方向。
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
          <div className="mt-4 text-center">
            <Link
              to="/tools/categories"
              className="text-sm font-medium text-[var(--lagoon)] no-underline hover:underline"
            >
              {m.home_categories_view_all()}
            </Link>
          </div>
        </section>
      )}

      {/* Newest tools */}
      {newest.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="island-kicker mb-1">{m.home_newest_kicker()}</p>
              <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
                {m.home_newest_title()}
              </h2>
            </div>
            <Link
              to="/tools"
              className="text-sm font-medium text-[var(--lagoon)] no-underline hover:underline"
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

      {/* FAQ */}
      <section className="mx-auto mt-16 max-w-2xl">
        <div className="mb-8 text-center">
          <p className="island-kicker mb-2">{m.home_faq_kicker()}</p>
          <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
            {m.home_faq_title()}
          </h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q()} className="island-shell group rounded-xl px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[var(--sea-ink)]">
                {item.q()}
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
              <p className="mt-3 text-sm leading-relaxed text-[var(--sea-ink-soft)]">{item.a()}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto mt-16 max-w-xl text-center">
        <div className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10">
          <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.2),transparent_66%)]" />
          <p className="island-kicker mb-2">{m.home_newsletter_kicker()}</p>
          <h2 className="display-title mb-2 text-xl font-bold tracking-tight text-[var(--sea-ink)]">
            {m.home_newsletter_title()}
          </h2>
          <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
            {m.home_newsletter_description()}
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
            {m.home_cta_title()}
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-[var(--sea-ink-soft)]">
            {m.home_cta_description()}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/tools/submit"
              className="inline-block rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-8 py-3 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
            >
              {m.home_cta_submit_free()}
            </Link>
            <Link
              to="/listing-pricing"
              className="inline-block rounded-full border border-[var(--line)] bg-[var(--surface)] px-8 py-3 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[var(--lagoon)]"
            >
              {m.home_cta_view_plans()}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
