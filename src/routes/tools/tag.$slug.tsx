import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { getTagBySlug, getToolsByTag } from '#/lib/public'
import { ToolCard } from '#/components/tools/ToolCard'
import { Pagination } from '#/components/tools/Pagination'
import { SITE_TITLE, SITE_URL } from '#/lib/site'
import { breadcrumbSchema, collectionPageSchema } from '#/components/seo/JsonLd'

const searchSchema = z.object({
  pricingType: z.string().optional(),
  sort: z.enum(['latest', 'name']).optional().default('latest'),
  page: z.coerce.number().int().min(1).optional().default(1),
})

export const Route = createFileRoute('/tools/tag/$slug')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const [tag, result] = await Promise.all([
      getTagBySlug({ data: { slug: params.slug } }),
      getToolsByTag({
        data: {
          slug: params.slug,
          pricingType: deps.pricingType,
          sort: deps.sort,
          page: deps.page,
        },
      }),
    ])
    if (!tag) throw notFound()
    return { tag, ...result }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { tag, tools } = loaderData
    const url = `${SITE_URL}/tools/tag/${tag.slug}`
    const description = `浏览标签 #${tag.name} 下的 AI 工具。`
    return {
      links: [{ rel: 'canonical', href: url }],
      meta: [
        { title: `#${tag.name} AI 工具 | ${SITE_TITLE}` },
        { name: 'description', content: description },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(
            collectionPageSchema({ name: `#${tag.name}`, description, url, tools, siteUrl: SITE_URL }),
          ),
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify(
            breadcrumbSchema(
              [
                { name: 'Home', href: '/' },
                { name: 'Tools', href: '/tools' },
                { name: `#${tag.name}`, href: `/tools/tag/${tag.slug}` },
              ],
              SITE_URL,
            ),
          ),
        },
      ],
    }
  },
  component: TagPage,
})

const PRICING_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'free', label: '免费' },
  { value: 'freemium', label: '免费增值' },
  { value: 'paid', label: '付费' },
  { value: 'open_source', label: '开源' },
]

function TagPage() {
  const { tag, tools, total, page, totalPages } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
        <Link to="/tools" className="hover:text-[var(--lagoon)]">首页</Link>
        <span>/</span>
        <Link to="/tools/tags" className="hover:text-[var(--lagoon)]">标签</Link>
        <span>/</span>
        <span className="text-[var(--sea-ink)]">#{tag.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <p className="island-kicker mb-1">标签</p>
        <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">#{tag.name}</h1>
        <p className="mt-2 text-[var(--sea-ink-soft)]">共 {total} 个工具</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {PRICING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                void navigate({
                  search: {
                    ...search,
                    pricingType: opt.value === 'all' ? undefined : opt.value,
                    page: 1,
                  },
                })
              }
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                (search.pricingType ?? 'all') === opt.value
                  ? 'border-[var(--lagoon)] bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]'
                  : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto">
          <select
            value={search.sort}
            onChange={(e) =>
              void navigate({
                search: { ...search, sort: e.target.value as 'latest' | 'name', page: 1 },
              })
            }
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20"
          >
            <option value="latest">最新上架</option>
            <option value="name">名称 A-Z</option>
          </select>
        </div>
      </div>

      {/* Tool grid */}
      {tools.length === 0 ? (
        <div className="island-shell rounded-2xl py-16 text-center text-[var(--sea-ink-soft)]">
          该标签下暂无工具
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => void navigate({ search: { ...search, page: p } })}
        />
      </div>
    </main>
  )
}
