import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { searchTools, getPublicCategories } from '#/lib/public'
import { ToolCard } from '#/components/tools/ToolCard'
import { Pagination } from '#/components/tools/Pagination'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { SITE_TITLE } from '#/lib/site'

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  pricingType: z.string().optional(),
  sort: z.enum(['latest', 'name']).optional().default('latest'),
  page: z.coerce.number().int().min(1).optional().default(1),
})

export const Route = createFileRoute('/tools/search')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  head: () => ({
    meta: [{ title: `搜索工具 | ${SITE_TITLE}` }],
  }),
  loader: async ({ deps, context }) => {
    const [result, categories] = await Promise.all([
      searchTools({
        data: {
          query: deps.q,
          categorySlug: deps.category,
          tagSlug: deps.tag,
          pricingType: deps.pricingType,
          sort: deps.sort,
          page: deps.page,
          viewerUserId: context.session?.user.id,
        },
      }),
      getPublicCategories(),
    ])
    return { ...result, categories, q: deps.q }
  },
  component: SearchPage,
})

const PRICING_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'free', label: '免费' },
  { value: 'freemium', label: '免费增值' },
  { value: 'paid', label: '付费' },
  { value: 'open_source', label: '开源' },
]

function SearchPage() {
  const { tools, total, page, totalPages, categories, q } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const newQ = new FormData(e.currentTarget).get('q') as string
    void navigate({ search: { ...search, q: newQ || undefined, page: 1 } })
  }

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/tools" className="hover:text-primary">首页</Link>
        <span>/</span>
        <span className="text-foreground">搜索</span>
      </nav>

      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-foreground">
          {q ? `"${q}" 的搜索结果` : '搜索工具'}
        </h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex max-w-xl gap-2">
          <Input
            name="q"
            type="search"
            defaultValue={q ?? ''}
            aria-label="Search tools"
            placeholder="搜索工具名称或描述..."
            className="flex-1 rounded-full px-5 py-3"
          />
          <Button type="submit" className="px-6 py-3">
            搜索
          </Button>
        </form>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-x-visible sm:pb-0">
          <button
            type="button"
            onClick={() => void navigate({ search: { ...search, category: undefined, page: 1 } })}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              !search.category
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary'
            }`}
          >
            全部分类
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                void navigate({
                  search: {
                    ...search,
                    category: search.category === cat.slug ? undefined : cat.slug,
                    page: 1,
                  },
                })
              }
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                search.category === cat.slug
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Pricing + sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">找到 {total} 个工具</p>

      {/* Tool grid */}
      {tools.length === 0 ? (
        <div className="border border-border bg-card shadow-sm rounded-2xl py-16 text-center">
          <p className="text-lg font-medium text-foreground">未找到相关工具</p>
          <p className="mt-2 text-sm text-muted-foreground">尝试其他关键词或清除筛选条件</p>
          <button
            type="button"
            onClick={() => void navigate({ to: '/tools/search' })}
            className="mt-4 rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
          >
            清除所有筛选
          </button>
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
