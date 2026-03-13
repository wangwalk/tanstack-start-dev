import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { getCategoryBySlug, getToolsByCategory } from '#/lib/public'
import { ToolCard } from '#/components/tools/ToolCard'
import { Pagination } from '#/components/tools/Pagination'
import { SITE_TITLE, SITE_URL } from '#/lib/site'
import { breadcrumbSchema, collectionPageSchema } from '#/components/seo/JsonLd'

const searchSchema = z.object({
  pricingType: z.string().optional(),
  sort: z.enum(['latest', 'name']).optional().default('latest'),
  page: z.coerce.number().int().min(1).optional().default(1),
})

export const Route = createFileRoute('/tools/category/$slug')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps, context }) => {
    const viewerUserId = context.session?.user.id
    const [cat, result] = await Promise.all([
      getCategoryBySlug({ data: { slug: params.slug } }),
      getToolsByCategory({
        data: {
          slug: params.slug,
          pricingType: deps.pricingType,
          sort: deps.sort,
          page: deps.page,
          viewerUserId,
        },
      }),
    ])
    if (!cat) throw notFound()
    return { cat, ...result }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { cat, tools } = loaderData
    const url = `${SITE_URL}/tools/category/${cat.slug}`
    const description = cat.description ?? `发现最好的 ${cat.name} AI 工具，精选推荐。`
    return {
      links: [{ rel: 'canonical', href: url }],
      meta: [
        { title: `${cat.name} AI 工具推荐 | ${SITE_TITLE}` },
        { name: 'description', content: description },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(
            collectionPageSchema({ name: cat.name, description, url, tools, siteUrl: SITE_URL }),
          ),
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify(
            breadcrumbSchema(
              [
                { name: 'Home', href: '/' },
                { name: 'Tools', href: '/tools' },
                { name: cat.name, href: `/tools/category/${cat.slug}` },
              ],
              SITE_URL,
            ),
          ),
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
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/tools" className="hover:text-primary">首页</Link>
        <span>/</span>
        <span className="text-foreground">{cat.name}</span>
      </nav>

      {/* Header */}
      <div className="border border-border bg-card shadow-sm rise-in mb-8 flex items-start gap-4 rounded-2xl p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
          {cat.icon ?? '🔧'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{cat.name}</h1>
          {cat.description && (
            <p className="mt-1 text-muted-foreground">{cat.description}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">共 {total} 个工具</p>
        </div>
      </div>

      {/* Sub-categories */}
      {cat.children.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            to="/tools/category/$slug"
            params={{ slug }}
            className="rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary no-underline"
          >
            全部
          </Link>
          {cat.children.map((child) => (
            <Link
              key={child.id}
              to="/tools/category/$slug"
              params={{ slug: child.slug }}
              className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground no-underline transition hover:border-primary hover:text-primary"
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
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary'
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
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus-visible:ring-ring"
          >
            <option value="latest">最新上架</option>
            <option value="name">名称 A-Z</option>
          </select>
        </div>
      </div>

      {/* Tool grid */}
      {tools.length === 0 ? (
        <div className="border border-border bg-card shadow-sm rounded-2xl py-16 text-center text-muted-foreground">
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
