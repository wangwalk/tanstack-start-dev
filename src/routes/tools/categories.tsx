import { createFileRoute, Link } from '@tanstack/react-router'
import { getCategoriesWithCount } from '#/lib/public'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/tools/categories')({
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/tools/categories` }],
    meta: [
      { title: `AI 工具分类索引 | ${SITE_TITLE}` },
      { name: 'description', content: '浏览完整 AI 工具分类索引，按顶级分类和子分类快速定位工具方向。' },
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

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
        <Link to="/tools" className="hover:text-[var(--lagoon)]">工具目录</Link>
        <span>/</span>
        <span className="text-[var(--sea-ink)]">分类索引</span>
      </nav>

      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -left-20 top-0 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.28),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.16),transparent_66%)]" />
        <p className="island-kicker mb-3">Category Atlas</p>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
              按完整分类地图浏览 AI 工具
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--sea-ink-soft)] sm:text-base">
              先从顶级分类找到方向，再进入子分类继续收窄范围。这个页面负责提供稳定的信息架构入口，而不是只展示热门卡片。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                顶级分类
              </p>
              <p className="mt-2 text-3xl font-bold text-[var(--lagoon-deep)]">{sections.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                已收录工具
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
              className="island-shell rise-in group rounded-[1.8rem] p-5 no-underline transition hover:-translate-y-0.5 hover:ring-1 hover:ring-[var(--lagoon)]"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(145deg,rgba(79,184,178,0.16),rgba(255,255,255,0.84))] text-3xl shadow-[inset_0_1px_0_var(--inset-glint)]">
                    {category.icon ?? '🔧'}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
                      Top Level
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
                      {category.name}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
                      {category.toolCount} 个工具
                    </p>
                  </div>
                </div>
                <Link
                  to="/tools/category/$slug"
                  params={{ slug: category.slug }}
                  className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--sea-ink)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
                >
                  进入分类
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
                  当前还没有细分子分类，直接进入该分类查看全部工具。
                </p>
              )}
            </article>
          )
        })}
      </section>
    </main>
  )
}
