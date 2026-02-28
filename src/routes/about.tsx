import { createFileRoute } from '@tanstack/react-router'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/about')({
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/about` }],
    meta: [
      { title: `About | ${SITE_TITLE}` },
      {
        name: 'description',
        content:
          'TanStack Start gives you type-safe routing, server functions, and modern SSR defaults.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/about` },
      { property: 'og:title', content: `About | ${SITE_TITLE}` },
      {
        property: 'og:description',
        content:
          'TanStack Start gives you type-safe routing, server functions, and modern SSR defaults.',
      },
      { property: 'og:image', content: `${SITE_URL}/images/lagoon-about.svg` },
    ],
  }),
  component: About,
})

function About() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <img
          src="/images/lagoon-about.svg"
          alt=""
          className="mb-6 h-56 w-full rounded-2xl object-cover"
        />
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Built for shipping fast.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          TanStack Start gives you type-safe routing, server functions, and
          modern SSR defaults so you can focus on product work instead of
          framework glue.
        </p>
      </section>
    </main>
  )
}
