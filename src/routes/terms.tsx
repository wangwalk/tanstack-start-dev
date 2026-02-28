import { createFileRoute, notFound } from '@tanstack/react-router'
import { MDXContent } from '@content-collections/mdx/react'
import { allLegals } from 'content-collections'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/terms')({
  loader: () => {
    const page = allLegals.find((entry) => entry.slug === 'terms')
    if (!page) throw notFound()
    return page
  },
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/terms` }],
    meta: [
      { title: `Terms of Service | ${SITE_TITLE}` },
      {
        name: 'description',
        content: `Terms of Service for ${SITE_TITLE}. Read our terms and conditions for using the service.`,
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/terms` },
      { property: 'og:title', content: `Terms of Service | ${SITE_TITLE}` },
      {
        property: 'og:description',
        content: `Terms of Service for ${SITE_TITLE}. Read our terms and conditions for using the service.`,
      },
    ],
  }),
  component: TermsPage,
})

function TermsPage() {
  const page = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 py-12">
      <article className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Legal</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          {page.title}
        </h1>
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
          Last updated: {new Date(page.lastUpdated).toLocaleDateString()}
        </p>
        <div className="prose prose-slate prose-headings:text-[var(--sea-ink)] prose-p:text-[var(--sea-ink-soft)] prose-li:text-[var(--sea-ink-soft)] prose-ul:text-[var(--sea-ink-soft)] prose-ol:text-[var(--sea-ink-soft)] prose-strong:text-[var(--sea-ink)] prose-a:text-[var(--lagoon-deep)] max-w-none">
          <MDXContent code={page.mdx} />
        </div>
      </article>
    </main>
  )
}
