import { createFileRoute, Link } from '@tanstack/react-router'
import { SITE_TITLE, SITE_URL } from '#/lib/site'
import { LISTING_TIERS } from '#/config/billing'
import { FeatureCheck, FeatureDash } from '#/components/icons/FeatureCheck'
import { Button } from '#/components/ui/button'

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
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">List Your Tool</p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Get discovered by thousands of users
        </h1>
        <p className="mx-auto max-w-lg text-muted-foreground">
          One-time payment. Permanent listing. No recurring fees.
        </p>
      </section>

      {/* Tier cards */}
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
        {TIERS.map((tier, i) => (
          <article
            key={tier.key}
            className={`border border-border bg-card shadow-sm rise-in flex flex-col rounded-2xl p-6 ${tier.highlighted ? 'ring-2 ring-primary' : ''}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {tier.highlighted && (
              <span className="mb-3 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                Most Popular
              </span>
            )}
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{tier.name}</p>
            <p className="m-0 mb-1">
              <span className="text-3xl font-bold text-foreground">
                {tier.price}
              </span>
              <span className="text-sm text-muted-foreground">{tier.period}</span>
            </p>
            <p className="mb-5 text-sm text-muted-foreground">{tier.desc}</p>

            <ul className="mb-6 grow space-y-2 pl-0">
              {tier.features.map((f) => (
                <li key={f.label} className="flex items-start gap-2 text-sm text-muted-foreground">
                  {f.included ? <FeatureCheck /> : <FeatureDash />}
                  <span className={f.included ? '' : 'opacity-40'}>{f.label}</span>
                </li>
              ))}
            </ul>

            <Link
              to={tier.ctaHref as '/tools/submit'}
              className="block text-center no-underline"
            >
              <Button
                variant={tier.ctaVariant === 'primary' ? 'default' : 'outline'}
                className="w-full"
              >
                {tier.cta}
              </Button>
            </Link>
          </article>
        ))}
      </div>

      {/* FAQ */}
      <section className="mx-auto mt-20 max-w-2xl">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="border border-border bg-card shadow-sm group rounded-xl px-5 py-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
                {item.q}
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto mt-16 max-w-2xl">
        <div className="border border-border bg-card shadow-sm rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 text-center">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            Ready to get listed?
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Start for free or go Featured for maximum visibility.
          </p>
          <Link
            to="/tools/submit"
            className="no-underline"
          >
            <Button className="px-8 py-3">Submit Your Tool</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
