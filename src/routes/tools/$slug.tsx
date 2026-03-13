import { useState } from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { getToolBySlug, getRelatedTools } from '#/lib/public'
import { pricingBadgeClass, pricingLabel } from '#/lib/pricing-display'
import { SaveToolButton } from '#/components/tools/SaveToolButton'
import { ToolCard } from '#/components/tools/ToolCard'
import { Button } from '#/components/ui/button'
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
    const description = tool.description ?? `Learn more about ${tool.name}.`
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
  const [activeTab, setActiveTab] = useState<'info' | 'related'>('info')

  return (
    <main className="page-wrap px-4 pb-16 pt-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/tools" className="hover:text-primary">Tools</Link>
        {tool.categories[0] && (
          <>
            <span>/</span>
            <Link
              to="/tools/category/$slug"
              params={{ slug: tool.categories[0].slug }}
              className="hover:text-primary"
            >
              {tool.categories[0].name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{tool.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Tool header - flat, no card wrapper */}
          <div className="flex items-start gap-4">
            {tool.logoUrl ? (
              <img
                src={tool.logoUrl}
                alt={`${tool.name} logo`}
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                {tool.name.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{tool.name}</h1>
                <span
                  className={`rounded-sm px-2 py-0.5 text-xs font-medium ${pricingBadgeClass[tool.pricingType] ?? pricingBadgeClass.free}`}
                >
                  {pricingLabel[tool.pricingType] ?? tool.pricingType}
                </span>
                {tool.isFeatured && (
                  <span className="badge-sponsor">Featured</span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button asChild>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="no-underline"
                  >
                    Open site →
                  </a>
                </Button>
                <SaveToolButton
                  toolId={tool.id}
                  initialIsSaved={tool.isSaved}
                  initialSaveCount={tool.saveCount}
                  variant="detail"
                />
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Pricing</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {pricingLabel[tool.pricingType] ?? tool.pricingType}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saves</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{tool.saveCount}</p>
            </div>
            {tool.approvedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Added on</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {new Date(tool.approvedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            )}
            {tool.categories[0] && (
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">{tool.categories[0].name}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {(tool.categories.length > 0 || tool.tags.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {tool.categories.map((cat) => (
                <Link
                  key={cat.id}
                  to="/tools/category/$slug"
                  params={{ slug: cat.slug }}
                  className="rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground no-underline transition hover:border-primary hover:text-primary"
                >
                  {cat.name}
                </Link>
              ))}
              {tool.tags.map((t) => (
                <Link
                  key={t.id}
                  to="/tools/tag/$slug"
                  params={{ slug: t.slug }}
                  className="rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground no-underline transition hover:border-primary hover:text-primary"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          )}

          {/* Tab navigation */}
          <div className="flex items-center gap-1 border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
                activeTab === 'info'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Product Information
            </button>
            {related.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('related')}
                className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
                  activeTab === 'related'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Related Tools
              </button>
            )}
          </div>

          {/* Tab content */}
          {activeTab === 'info' ? (
            <div className="space-y-6">
              {tool.description && (
                <div>
                  <h2 className="mb-2 text-lg font-bold text-foreground">What is {tool.name}?</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
                </div>
              )}
              {tool.content && (
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {tool.content}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          {/* Screenshot preview */}
          {tool.screenshotUrl && (
            <div className="overflow-hidden rounded-lg border border-border">
              <img
                src={tool.screenshotUrl}
                alt={`${tool.name} screenshot`}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Update CTA */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-semibold text-foreground">Is this your tool?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Keep your listing up to date to reach more users.
            </p>
            <Button variant="outline" asChild className="mt-3 w-full text-center">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="no-underline"
              >
                Update this tool
              </a>
            </Button>
          </div>
        </aside>
      </div>
    </main>
  )
}
