import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { getCategoryBySlug, getToolsByCategory } from '#/lib/public'
import { ToolCard } from '#/components/tools/ToolCard'
import { Pagination } from '#/components/tools/Pagination'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

const searchSchema = z.object({
  pricingType: z.string().optional(),
  sort: z.enum(['latest', 'name']).optional().default('latest'),
  page: z.coerce.number().int().min(1).optional().default(1),
})

export const Route = createFileRoute('/tools/category/$slug')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const [cat, result] = await Promise.all([
      getCategoryBySlug({ data: { slug: params.slug } }),
      getToolsByCategory({
        data: {
          slug: params.slug,
          pricingType: deps.pricingType,
          sort: deps.sort,
          page: deps.page,
        },
      }),
    ])
    if (!cat) throw notFound()
    return { cat, ...result }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    return {
      links: [{ rel: 'canonical', href: `${SITE_URL}/tools/category/${loaderData.cat.slug}` }],
      meta: [
        { title: `${loaderData.cat.name} AI 工具推荐 | ${SITE_TITLE}` },
        {
          name: 'description',
          content: loaderData.cat.description ?? `发现最好的 ${loaderData.cat.name} AI 工具，精选推荐。`,
        },
      ],
    }
  },
  component: CategoryPage,
})

const PRICING_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'free', label: '免费' },
  { value: 'freemium', label: '免费增值' },
  { value: 'paid', label: '付费' },
  { value: 'open_source', label: '开源' },
]

function CategoryPage() {
  const { cat, tools, total, page, totalPages } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { slug } = Route.useParams()

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
        <Link to="/tools" className="hover:text-[var(--lagoon)]">首页</Link>
        <span>/</span>
        <span className="text-[var(--sea-ink)]">{cat.name}</span>
      </nav>

      {/* Header */}
      <div className="island-shell rise-in mb-8 flex items-start gap-4 rounded-2xl p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[rgba(79,184,178,0.12)] text-3xl">
          {cat.icon ?? '🔧'}
        </div>
        <div>
          <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">{cat.name}</h1>
          {cat.description && (
            <p className="mt-1 text-[var(--sea-ink-soft)]">{cat.description}</p>
          )}
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">共 {total} 个工具</p>
        </div>
      </div>

      {/* Sub-categories */}
      {cat.children.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            to="/tools/category/$slug"
            params={{ slug }}
            className="rounded-full border border-[var(--lagoon)] bg-[var(--lagoon)]/10 px-3 py-1.5 text-sm font-medium text-[var(--lagoon-deep)] no-underline"
          >
            全部
          </Link>
          {cat.children.map((child) => (
            <Link
              key={child.id}
              to="/tools/category/$slug"
              params={{ slug: child.slug }}
              className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--sea-ink-soft)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

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
          该分类下暂无工具
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
