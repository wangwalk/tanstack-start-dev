import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { getCategoryBySlug, getToolsByCategory } from '#/lib/public'
import { ToolListItem } from '#/components/tools/ToolListItem'
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
    const description = cat.description ?? `Discover the best ${cat.name} AI tools, curated and ranked.`
    return {
      links: [{ rel: 'canonical', href: url }],
      meta: [
        { title: `${cat.name} AI Tools | ${SITE_TITLE}` },
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
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
  { value: 'open_source', label: 'Open Source' },
]

function CategoryPage() {
  const { cat, tools, total, page, totalPages } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { slug } = Route.useParams()

  return (
    <main className="page-wrap px-4 pb-16 pt-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/tools" className="hover:text-primary">Tools</Link>
        <span>/</span>
        <span className="text-foreground">{cat.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-2xl">{cat.icon ?? '🔧'}</span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{cat.name}</h1>
          {cat.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{cat.description}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{total} tools</p>
        </div>
      </div>

      {/* Sub-categories */}
      {cat.children.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <Link
            to="/tools/category/$slug"
            params={{ slug }}
            className="rounded-sm border border-primary bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary no-underline"
          >
            All
          </Link>
          {cat.children.map((child) => (
            <Link
              key={child.id}
              to="/tools/category/$slug"
              params={{ slug: child.slug }}
              className="rounded-sm border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground no-underline transition hover:border-primary hover:text-primary"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
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
              className={`rounded-sm border px-2.5 py-1 text-xs font-medium transition ${
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
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="latest">Latest</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Tool list */}
      {tools.length === 0 ? (
        <div className="rounded-lg border border-border bg-card py-12 text-center text-sm text-muted-foreground">
          No tools found in this category.
        </div>
      ) : (
        <div>
          {tools.map((t) => (
            <ToolListItem key={t.id} tool={t} />
          ))}
        </div>
      )}

      <div className="mt-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => void navigate({ search: { ...search, page: p } })}
        />
      </div>
    </main>
  )
}
