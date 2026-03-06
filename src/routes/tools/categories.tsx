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
    <main className="page-wrap px-4 pb-16 pt-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
        <Link to="/tools" className="hover:text-[var(--lagoon)]">
          Tool directory
        </Link>
        <span>/</span>
        <span className="text-[var(--sea-ink)]">Category atlas</span>
      </nav>

      <section className="island-shell rise-in relative overflow-hidden rounded-[2.2rem] px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -left-20 top-0 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.28),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-24 right-[-2rem] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.16),transparent_66%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div className="max-w-3xl">
            <p className="island-kicker mb-3">Category Atlas</p>
            <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
              Browse the full map, then drill into the right lane.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--sea-ink-soft)] sm:text-base">
              This page is the stable information-architecture layer for the directory: every top-level category, every active child category, and the tool density behind each one.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                Top-level
              </p>
              <p className="mt-2 text-3xl font-bold text-[var(--lagoon-deep)]">{sections.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                Subcategories
              </p>
              <p className="mt-2 text-3xl font-bold text-[var(--lagoon-deep)]">{totalChildren}</p>
            </div>
            <div className="col-span-2 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                Indexed tools
              </p>
              <p className="mt-2 text-3xl font-bold text-[var(--lagoon-deep)]">{totalTools}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        {sections.map((category, index) => {
          const children = category.children

          return (
            <article
              key={category.id}
              className="atlas-card rise-in rounded-[1.8rem] p-5"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="atlas-card__icon h-14 w-14 text-3xl">
                    {category.icon ?? '🔧'}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                      Top level
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-[var(--sea-ink)]">
                      {category.name}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
                      {category.toolCount} indexed tools
                    </p>
                  </div>
                </div>

                <Link
                  to="/tools/category/$slug"
                  params={{ slug: category.slug }}
                  className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--sea-ink)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
                >
                  Open
                </Link>
              </div>

              {children.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      to="/tools/category/$slug"
                      params={{ slug: child.slug }}
                      className="rounded-full border border-[var(--line)] bg-[var(--surface)]/85 px-3 py-1.5 text-sm text-[var(--sea-ink-soft)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
                    >
                      {child.name}
                      <span className="ml-1.5 text-xs text-[var(--sea-ink-soft)]/70">{child.toolCount}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-[var(--sea-ink-soft)]">
                  No active child categories yet. Use the top-level page as the main browsing surface.
                </p>
              )}
            </article>
          )
        })}
      </section>
    </main>
  )
}
