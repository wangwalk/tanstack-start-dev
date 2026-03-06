import { createFileRoute, Link } from '@tanstack/react-router'
import { SITE_TITLE, SITE_URL } from '#/lib/site'
import { LISTING_TIERS } from '#/config/billing'

export const Route = createFileRoute('/listing-pricing')({
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/listing-pricing` }],
    meta: [
      { title: `List Your Tool | ${SITE_TITLE}` },
      {
        name: 'description',
        content:
          'Get your AI tool in front of thousands of users. One-time payment, permanent listing.',
      },
    ],
  }),
  component: ListingPricingPage,
})

const CHECK = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lagoon)]">
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
      clipRule="evenodd"
    />
  </svg>
)

const DASH = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--line)]">
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
)

const TIERS = [
  {
    key: 'free' as const,
    name: 'Free',
    price: '$0',
    period: '',
    desc: 'Basic listing, community reviewed',
    highlighted: false,
    features: [
      { label: 'Basic listing (name, URL, description)', included: true },
      { label: 'Category & tag indexing', included: true },
      { label: 'Standard review queue', included: true },
      { label: 'dofollow backlink', included: false },
      { label: 'Logo & screenshot upload', included: false },
      { label: 'Detailed Markdown description', included: false },
      { label: 'Verified badge', included: false },
      { label: 'Priority sorting in category pages', included: false },
      { label: 'Featured badge + homepage spotlight', included: false },
      { label: 'Custom CTA button', included: false },
      { label: 'Newsletter recommendation', included: false },
    ],
    cta: 'Submit for Free',
    ctaHref: '/tools/submit',
    ctaVariant: 'outline' as const,
  },
  {
    key: 'standard' as const,
    name: 'Standard',
    price: LISTING_TIERS.standard.display,
    period: ' one-time',
    desc: 'Everything you need to stand out',
    highlighted: false,
    features: [
      { label: 'Basic listing (name, URL, description)', included: true },
      { label: 'Category & tag indexing', included: true },
      { label: 'Fast-track review (priority queue)', included: true },
      { label: 'dofollow backlink', included: true },
      { label: 'Logo & screenshot upload', included: true },
      { label: 'Detailed Markdown description', included: true },
      { label: 'Verified badge', included: true },
      { label: 'Priority sorting in category pages', included: true },
      { label: 'Featured badge + homepage spotlight', included: false },
      { label: 'Custom CTA button', included: false },
      { label: 'Newsletter recommendation', included: false },
    ],
    cta: 'Get Standard',
    ctaHref: '/tools/submit',
    ctaVariant: 'outline' as const,
  },
  {
    key: 'featured' as const,
    name: 'Featured',
    price: LISTING_TIERS.featured.display,
    period: ' one-time',
    desc: 'Maximum visibility across the directory',
    highlighted: true,
    features: [
      { label: 'Basic listing (name, URL, description)', included: true },
      { label: 'Category & tag indexing', included: true },
      { label: 'Fast-track review (priority queue)', included: true },
      { label: 'dofollow backlink', included: true },
      { label: 'Logo & screenshot upload', included: true },
      { label: 'Detailed Markdown description', included: true },
      { label: 'Verified badge', included: true },
      { label: 'Priority sorting in category pages', included: true },
      { label: 'Featured badge + homepage spotlight', included: true },
      { label: 'Custom CTA button', included: true },
      { label: 'Newsletter recommendation', included: true },
    ],
    cta: 'Get Featured',
    ctaHref: '/tools/submit',
    ctaVariant: 'primary' as const,
  },
]

const FAQ = [
  {
    q: 'How soon will my tool go live after paying?',
    a: 'Paid listings are fast-tracked through our review queue — typically within 24 hours. Free listings may take 2–5 business days.',
  },
  {
    q: 'Is this really one-time? No subscription?',
    a: "Yes — you pay once and your listing stays live permanently. We don't believe in recurring fees for a static listing.",
  },
  {
    q: 'Can I upgrade from Standard to Featured later?',
    a: 'Absolutely. You only pay the $60 difference. Go to Dashboard → My Listings to upgrade at any time.',
  },
  {
    q: 'Can I submit multiple tools?',
    a: 'Yes. Each tool is priced independently — submit as many tools as you like.',
  },
  {
    q: 'What does the Featured homepage spotlight include?',
    a: 'Featured tools appear in a dedicated "Featured Tools" section on the homepage, rotating among up to 12 spots (first-come, first-served).',
  },
  {
    q: 'Do you offer refunds?',
    a: 'If your tool hasn\'t been reviewed yet, we\'ll refund within 7 days of purchase, no questions asked.',
  },
]

function ListingPricingPage() {
  return (
    <main className="page-wrap px-4 pb-16 pt-14">
      {/* Header */}
      <section className="mb-12 text-center">
        <p className="island-kicker mb-2">List Your Tool</p>
        <h1 className="display-title mb-4 text-4xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          Get discovered by thousands of users
        </h1>
        <p className="mx-auto max-w-lg text-[var(--sea-ink-soft)]">
          One-time payment. Permanent listing. No recurring fees.
        </p>
      </section>

      {/* Tier cards */}
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
        {TIERS.map((tier, i) => (
          <article
            key={tier.key}
            className={`island-shell feature-card rise-in flex flex-col rounded-2xl p-6 ${tier.highlighted ? 'ring-2 ring-[var(--lagoon)]' : ''}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {tier.highlighted && (
              <span className="mb-3 inline-block rounded-full bg-[rgba(79,184,178,0.15)] px-3 py-1 text-xs font-semibold text-[var(--lagoon-deep)]">
                Most Popular
              </span>
            )}
            <p className="island-kicker mb-1">{tier.name}</p>
            <p className="m-0 mb-1">
              <span className="display-title text-3xl font-bold text-[var(--sea-ink)]">
                {tier.price}
              </span>
              <span className="text-sm text-[var(--sea-ink-soft)]">{tier.period}</span>
            </p>
            <p className="mb-5 text-sm text-[var(--sea-ink-soft)]">{tier.desc}</p>

            <ul className="mb-6 grow space-y-2 pl-0">
              {tier.features.map((f) => (
                <li key={f.label} className="flex items-start gap-2 text-sm text-[var(--sea-ink-soft)]">
                  {f.included ? CHECK : DASH}
                  <span className={f.included ? '' : 'opacity-40'}>{f.label}</span>
                </li>
              ))}
            </ul>

            <Link
              to={tier.ctaHref as '/tools/submit'}
              className={`block rounded-full px-5 py-2.5 text-center text-sm font-semibold no-underline transition hover:-translate-y-0.5 ${
                tier.ctaVariant === 'primary'
                  ? 'border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] hover:bg-[var(--lagoon-deep)]'
                  : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] hover:border-[var(--lagoon)]'
              }`}
            >
              {tier.cta}
            </Link>
          </article>
        ))}
      </div>

      {/* FAQ */}
      <section className="mx-auto mt-20 max-w-2xl">
        <h2 className="display-title mb-8 text-center text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="island-shell group rounded-xl px-5 py-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[var(--sea-ink)]">
                {item.q}
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 shrink-0 text-[var(--sea-ink-soft)] transition group-open:rotate-180"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--sea-ink-soft)]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto mt-16 max-w-2xl">
        <div className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 text-center">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.24),transparent_66%)]" />
          <h2 className="display-title mb-3 text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
            Ready to get listed?
          </h2>
          <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
            Start for free or go Featured for maximum visibility.
          </p>
          <Link
            to="/tools/submit"
            className="inline-block rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-8 py-3 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
          >
            Submit Your Tool
          </Link>
        </div>
      </section>
    </main>
  )
}
