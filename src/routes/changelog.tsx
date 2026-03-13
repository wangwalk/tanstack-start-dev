import { createFileRoute } from '@tanstack/react-router'
import { allChangelogs } from 'content-collections'
import { MDXContent } from '@content-collections/mdx/react'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

const canonical = `${SITE_URL}/changelog`
const pageTitle = `Changelog | ${SITE_TITLE}`
const pageDescription = 'Product updates, new features, and improvements.'

export const Route = createFileRoute('/changelog')({
  head: () => ({
    links: [{ rel: 'canonical', href: canonical }],
    meta: [
      { title: pageTitle },
      { name: 'description', content: pageDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: canonical },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: pageDescription },
    ],
  }),
  component: ChangelogPage,
})

function ChangelogPage() {
  const entries = [...allChangelogs].sort(
    (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf(),
  )

  return (
    <main className="page-wrap px-4 pb-16 pt-14">
      <section className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">What&apos;s New</p>
        <h1 className="m-0 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Changelog
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {pageDescription}
        </p>
      </section>

      <div className="flex flex-col gap-12">
        {entries.map((entry) => {
          return (
            <article key={entry.slug} className="flex flex-col gap-4 sm:flex-row sm:gap-8">
              <div className="flex-shrink-0 sm:w-36">
                <time
                  dateTime={entry.date}
                  className="inline-block rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground"
                >
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-border bg-card shadow-sm min-w-0 flex-1 rounded-2xl p-6">
                <h2 className="m-0 mb-2 text-xl font-semibold text-foreground">
                  {entry.title}
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  {entry.description}
                </p>
                <div className="prose prose-slate prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-th:text-foreground prose-td:text-muted-foreground max-w-none text-sm">
                  <MDXContent code={entry.mdx} />
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}
