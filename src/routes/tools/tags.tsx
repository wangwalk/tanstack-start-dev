import { createFileRoute, Link } from '@tanstack/react-router'
import { getTagsWithCount } from '#/lib/public'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/tools/tags')({
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/tools/tags` }],
    meta: [
      { title: `所有标签 | ${SITE_TITLE}` },
      { name: 'description', content: '按标签浏览 AI 工具目录。' },
    ],
  }),
  loader: async () => {
    return getTagsWithCount()
  },
  component: TagsIndexPage,
})

function TagsIndexPage() {
  const tags = Route.useLoaderData()

  const maxCount = Math.max(...tags.map((t) => t.toolCount), 1)

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
        <Link to="/tools" className="hover:text-[var(--lagoon)]">首页</Link>
        <span>/</span>
        <span className="text-[var(--sea-ink)]">所有标签</span>
      </nav>

      <div className="mb-8">
        <p className="island-kicker mb-1">标签云</p>
        <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">所有标签</h1>
        <p className="mt-2 text-[var(--sea-ink-soft)]">共 {tags.length} 个标签</p>
      </div>

      {tags.length === 0 ? (
        <div className="island-shell rounded-2xl py-16 text-center text-[var(--sea-ink-soft)]">
          暂无标签
        </div>
      ) : (
        <div className="island-shell rounded-2xl p-8">
          <div className="flex flex-wrap items-center gap-3">
            {tags.map((t) => {
              // Scale font size between 0.75rem and 1.5rem based on tool count
              const ratio = t.toolCount / maxCount
              const fontSize = 0.75 + ratio * 0.75
              return (
                <Link
                  key={t.id}
                  to="/tools/tag/$slug"
                  params={{ slug: t.slug }}
                  style={{ fontSize: `${fontSize}rem` }}
                  className="font-medium text-[var(--sea-ink-soft)] no-underline transition hover:text-[var(--lagoon-deep)]"
                >
                  #{t.name}
                  <span className="ml-1 text-xs text-[var(--sea-ink-soft)]/60">{t.toolCount}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
