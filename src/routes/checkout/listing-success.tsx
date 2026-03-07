import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { SITE_TITLE } from '#/lib/site'
import { getListingOrderBySession } from '#/lib/billing'

const searchSchema = z.object({
  session_id: z.string(),
})

export const Route = createFileRoute('/checkout/listing-success')({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: `Listing Confirmed | ${SITE_TITLE}` }],
  }),
  component: ListingSuccessPage,
})

const TIER_BENEFITS: Record<string, string[]> = {
  standard: [
    'Verified badge on your listing',
    'dofollow backlink to your site',
    'Logo & screenshot display',
    'Detailed Markdown description',
    'Priority sorting in category pages',
  ],
  featured: [
    'Verified badge on your listing',
    'dofollow backlink to your site',
    'Logo & screenshot display',
    'Detailed Markdown description',
    'Priority sorting in category pages',
    'Featured badge + homepage spotlight',
    'Custom CTA button',
    'Included in next newsletter',
  ],
}

function ListingSuccessPage() {
  const { session_id } = Route.useSearch()
  const [order, setOrder] = useState<Awaited<ReturnType<typeof getListingOrderBySession>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let attempts = 0
    const MAX_ATTEMPTS = 12

    async function poll() {
      try {
        const result = await getListingOrderBySession({ data: { sessionId: session_id } })
        if (result?.status === 'paid') {
          setOrder(result)
          setLoading(false)
          return
        }
      } catch {
        // ignore and retry
      }

      attempts++
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(poll, 2000)
      } else {
        setLoading(false)
      }
    }

    void poll()
  }, [session_id])

  if (loading) {
    return (
      <main className="page-wrap flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--lagoon)] border-t-transparent" />
          <p className="text-sm text-[var(--sea-ink-soft)]">Confirming your payment…</p>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="page-wrap flex min-h-[60vh] items-center justify-center px-4">
        <div className="island-shell max-w-md rounded-2xl p-8 text-center">
          <p className="mb-2 text-lg font-semibold text-[var(--sea-ink)]">
            Payment received
          </p>
          <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
            Your listing upgrade is being processed. Check your dashboard shortly.
          </p>
          <Link
            to="/dashboard/listings"
            className="inline-block rounded-full bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white no-underline"
          >
            Go to My Listings
          </Link>
        </div>
      </main>
    )
  }

  const tierLabel = order.tier === 'featured' ? 'Featured' : 'Standard Verified'
  const benefits = TIER_BENEFITS[order.tier] ?? []

  return (
    <main className="page-wrap px-4 pb-16 pt-14">
      <div className="mx-auto max-w-lg">
        {/* Success header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(79,184,178,0.15)]">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-[var(--lagoon)]">
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="display-title mb-2 text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
            You're listed!
          </h1>
          <p className="text-[var(--sea-ink-soft)]">
            Your <strong className="text-[var(--sea-ink)]">{tierLabel}</strong> listing is now active.
          </p>
          {order.tier === 'featured' && (
            <p className="mt-1 text-sm text-[var(--lagoon-deep)]">
              Your tool will be included in our next newsletter.
            </p>
          )}
        </div>

        {/* Benefits */}
        <div className="island-shell mb-6 rounded-2xl p-6">
          <p className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Your {tierLabel} benefits</p>
          <ul className="space-y-2 pl-0">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-[var(--sea-ink-soft)]">
                <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lagoon)]">
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/dashboard/listings"
            className="btn-brand flex-1 text-center no-underline"
          >
            Manage My Listings
          </Link>
          <Link
            to="/dashboard/submissions"
            className="btn-brand-outline flex-1 text-center no-underline"
          >
            View My Submissions
          </Link>
        </div>
      </div>
    </main>
  )
}
