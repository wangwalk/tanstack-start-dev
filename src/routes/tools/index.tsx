import { createFileRoute, Link } from '@tanstack/react-router'
import { getFeaturedTools, getNewTools, getCategoriesWithCount } from '#/lib/public'
import { ToolListItem } from '#/components/tools/ToolListItem'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/tools/')({
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/tools` }],
    meta: [
      { title: `AI Tools Directory | ${SITE_TITLE}` },
      { name: 'description', content: 'Discover the best AI tools — browse by category, featured picks, and latest additions.' },
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
    <main className="page-wrap px-4 pb-16 pt-8">
      {/* Hero */}
      <section className="py-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AI Tools Directory
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {categories.reduce((s, c) => s + c.toolCount, 0)}+ AI tools curated and organized by category.
        </p>

        <form onSubmit={handleSearch} className="mt-4 flex max-w-lg gap-2">
          <Input
            name="q"
            type="search"
            placeholder="Search tools by name or description..."
            className="h-10 flex-1"
          />
          <Button type="submit" className="h-10 px-6">
            Search
          </Button>
        </form>

        {/* Category shortcuts */}
        {topCategories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {topCategories.map((cat) => (
              <Link
                key={cat.id}
                to="/tools/category/$slug"
                params={{ slug: cat.slug }}
                className="rounded-sm border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground no-underline transition hover:border-primary hover:text-primary"
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
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-foreground">Featured Tools</h2>
          <div>
            {featured.map((t) => (
              <ToolListItem key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}

      {/* New tools */}
      {newTools.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Latest Tools</h2>
            <Link
              to="/tools/search"
              search={{ sort: 'latest' }}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <div>
            {newTools.map((t) => (
              <ToolListItem key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold text-foreground">Browse by Category</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {categories
              .filter((c) => !c.parentId && c.toolCount > 0)
              .map((cat) => (
                <Link
                  key={cat.id}
                  to="/tools/category/$slug"
                  params={{ slug: cat.slug }}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 no-underline transition hover:border-primary"
                >
                  <span className="text-lg">{cat.icon ?? '🔧'}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.toolCount} tools</p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mt-12 rounded-lg border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">Have an AI tool to share?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Submit your tool to the directory and help others discover it.
        </p>
        <Button asChild className="mt-4">
          <Link to="/tools/submit" className="no-underline">
            Submit Tool
          </Link>
        </Button>
      </section>
    </main>
  )
}
