import { createFileRoute, Link } from '@tanstack/react-router'
import { getCategoriesWithCount } from '#/lib/public'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/tools/categories')({
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/tools/categories` }],
    meta: [
      { title: `AI Tool Categories | ${SITE_TITLE}` },
      {
        name: 'description',
        content: 'Browse the full AI tool category atlas with top-level clusters, subcategories, and tool counts.',
      },
    ],
  }),
  loader: async () => {
    const categories = await getCategoriesWithCount()
    const sections = categories
      .filter((category) => !category.parentId && category.toolCount > 0)
      .map((category) => ({
        ...category,
        children: categories
          .filter((child) => child.parentId === category.id && child.toolCount > 0)
          .sort((a, b) => b.toolCount - a.toolCount || a.name.localeCompare(b.name, 'zh-CN')),
      }))

    return { sections }
  },
  component: CategoriesIndexPage,
})

function CategoriesIndexPage() {
  const { sections } = Route.useLoaderData()
  const totalTools = sections.reduce((sum, category) => sum + category.toolCount, 0)
  const totalChildren = sections.reduce((sum, category) => sum + category.children.length, 0)

  return (
    <main className="page-wrap px-4 pb-16 pt-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/tools" className="hover:text-primary">Tools</Link>
        <span>/</span>
        <span className="text-foreground">Categories</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Category Atlas
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {sections.length} top-level categories, {totalChildren} subcategories, {totalTools} indexed tools.
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {sections.map((category) => (
          <Link
            key={category.id}
            to="/tools/category/$slug"
            params={{ slug: category.slug }}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 no-underline transition hover:border-primary"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{category.icon ?? '🔧'}</span>
              <span className="truncate text-sm font-semibold text-foreground">{category.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{category.toolCount} tools</span>
          </Link>
        ))}
      </div>

      {/* Expanded sections with children */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {sections.map((category) => {
          const children = category.children
          if (children.length === 0) return null

          return (
            <div
              key={category.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon ?? '🔧'}</span>
                <div>
                  <h2 className="text-base font-bold text-foreground">{category.name}</h2>
                  <p className="text-xs text-muted-foreground">{category.toolCount} tools</p>
                </div>
                <Link
                  to="/tools/category/$slug"
                  params={{ slug: category.slug }}
                  className="ml-auto text-xs font-medium text-primary no-underline hover:underline"
                >
                  Open
                </Link>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    to="/tools/category/$slug"
                    params={{ slug: child.slug }}
                    className="rounded-sm border border-border bg-background px-2 py-1 text-xs text-muted-foreground no-underline transition hover:border-primary hover:text-primary"
                  >
                    {child.name}
                    <span className="ml-1 text-[10px] text-muted-foreground/60">{child.toolCount}</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
