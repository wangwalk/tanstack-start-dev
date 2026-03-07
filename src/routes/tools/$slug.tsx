import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { getToolBySlug, getRelatedTools } from '#/lib/public'
import { pricingBadgeClass, pricingLabel } from '#/lib/pricing-display'
import { SaveToolButton } from '#/components/tools/SaveToolButton'
import { ToolCard } from '#/components/tools/ToolCard'
import { SITE_TITLE, SITE_URL } from '#/lib/site'
import { softwareApplicationSchema, breadcrumbSchema } from '#/components/seo/JsonLd'

export const Route = createFileRoute('/tools/$slug')({
  loader: async ({ params, context }) => {
    const viewerUserId = context.session?.user.id
    const tool = await getToolBySlug({ data: { slug: params.slug, viewerUserId } })
    if (!tool) throw notFound()

    const related = await getRelatedTools({
      data: {
        toolId: tool.id,
        categoryIds: tool.categories.map((c) => c.id),
        limit: 6,
        viewerUserId,
      },
    })
    return { tool, related }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { tool } = loaderData
    const title = `${tool.name} — ${tool.description ?? tool.name} | ${SITE_TITLE}`
    const description = tool.description ?? `了解更多关于 ${tool.name} 的信息。`
    const url = `${SITE_URL}/tools/${tool.slug}`
    return {
      links: [{ rel: 'canonical', href: url }],
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        ...(tool.screenshotUrl
          ? [{ property: 'og:image', content: tool.screenshotUrl }]
          : []),
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(softwareApplicationSchema(tool)),
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify(
            breadcrumbSchema(
              [
                { name: 'Home', href: '/' },
                { name: 'Tools', href: '/tools' },
                ...(tool.categories[0]
                  ? [{ name: tool.categories[0].name, href: `/tools/category/${tool.categories[0].slug}` }]
                  : []),
                { name: tool.name, href: `/tools/${tool.slug}` },
              ],
              SITE_URL,
            ),
          ),
        },
      ],
    }
  },
  component: ToolDetailPage,
})

function ToolDetailPage() {
  const { tool, related } = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
        <Link to="/tools" className="hover:text-[var(--lagoon)]">首页</Link>
        {tool.categories[0] && (
          <>
            <span>/</span>
            <Link
              to="/tools/category/$slug"
              params={{ slug: tool.categories[0].slug }}
              className="hover:text-[var(--lagoon)]"
            >
              {tool.categories[0].name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[var(--sea-ink)]">{tool.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div className="space-y-8">
          {/* Tool header */}
          <div className="island-shell rise-in flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-start">
            {tool.logoUrl ? (
              <img
                src={tool.logoUrl}
                alt={`${tool.name} logo`}
                className="h-16 w-16 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[rgba(79,184,178,0.12)] text-2xl font-bold text-[var(--lagoon-deep)]">
                {tool.name.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">{tool.name}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${pricingBadgeClass[tool.pricingType] ?? pricingBadgeClass.free}`}
                >
                  {pricingLabel[tool.pricingType] ?? tool.pricingType}
                </span>
                {tool.isFeatured && (
                  <span className="text-sm text-amber-500">★ 精选</span>
                )}
              </div>
              {tool.description && (
                <p className="mt-2 text-[var(--sea-ink-soft)]">{tool.description}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn-brand inline-block no-underline"
                >
                  访问官网 →
                </a>
                <SaveToolButton
                  toolId={tool.id}
                  initialIsSaved={tool.isSaved}
                  initialSaveCount={tool.saveCount}
                  variant="detail"
                />
              </div>
            </div>
          </div>

          {/* Screenshot */}
          {tool.screenshotUrl && (
            <div className="island-shell overflow-hidden rounded-2xl">
              <img
                src={tool.screenshotUrl}
                alt={`${tool.name} screenshot`}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Content / detailed description */}
          {tool.content && (
            <div className="island-shell rounded-2xl p-6">
              <h2 className="display-title mb-4 text-xl font-bold text-[var(--sea-ink)]">详细介绍</h2>
              <div className="prose prose-sm max-w-none text-[var(--sea-ink-soft)]">
                {tool.content}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="island-shell rounded-2xl p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              工具信息
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[var(--sea-ink-soft)]">定价</dt>
                <dd className="mt-0.5 font-medium text-[var(--sea-ink)]">
                  {pricingLabel[tool.pricingType] ?? tool.pricingType}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--sea-ink-soft)]">收藏数</dt>
                <dd className="mt-0.5 font-medium text-[var(--sea-ink)]">{tool.saveCount}</dd>
              </div>
              {tool.categories.length > 0 && (
                <div>
                  <dt className="text-[var(--sea-ink-soft)]">分类</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {tool.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to="/tools/category/$slug"
                        params={{ slug: cat.slug }}
                        className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-xs text-[var(--sea-ink-soft)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
              {tool.tags.length > 0 && (
                <div>
                  <dt className="text-[var(--sea-ink-soft)]">标签</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {tool.tags.map((t) => (
                      <Link
                        key={t.id}
                        to="/tools/tag/$slug"
                        params={{ slug: t.slug }}
                        className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-xs text-[var(--sea-ink-soft)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
                      >
                        #{t.name}
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
              {tool.approvedAt && (
                <div>
                  <dt className="text-[var(--sea-ink-soft)]">收录时间</dt>
                  <dd className="mt-0.5 font-medium text-[var(--sea-ink)]">
                    {new Date(tool.approvedAt).toLocaleDateString('zh-CN')}
                  </dd>
                </div>
              )}
            </dl>

            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="btn-brand-outline mt-5 block text-center no-underline"
            >
              访问官网 →
            </a>
          </div>
        </aside>
      </div>

      {/* Related tools */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="display-title mb-6 text-xl font-bold text-[var(--sea-ink)]">相关工具</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
