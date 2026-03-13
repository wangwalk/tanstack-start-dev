import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { SITE_TITLE } from '#/lib/site'
import { getMyListings, createUpgradeCheckoutSession } from '#/lib/billing'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'

type Listing = {
  id: string
  name: string
  slug: string
  listingTier: string
  status: string
  ctaLabel: string | null
  ctaUrl: string | null
}

export const Route = createFileRoute('/dashboard/listings/')({
  head: () => ({
    meta: [{ title: `My Listings | ${SITE_TITLE}` }],
  }),
  loader: () => getMyListings({ data: undefined }) as Promise<Listing[]>,
  component: DashboardListingsPage,
})

const tierBadge: Record<string, string> = {
  standard: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  featured: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const tierLabel: Record<string, string> = {
  standard: 'Standard Verified',
  featured: 'Featured',
}

function DashboardListingsPage() {
  const listings = Route.useLoaderData()
  const [upgradingId, setUpgradingId] = useState<string | null>(null)

  async function handleUpgrade(toolId: string) {
    setUpgradingId(toolId)
    try {
      const result = await createUpgradeCheckoutSession({ data: { toolId } })
      if (result.url) {
        window.location.href = result.url
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upgrade failed')
      setUpgradingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Listings</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Tools you've paid to list in the directory
          </p>
        </div>
        <Link
          to="/listing-pricing"
          className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground no-underline transition hover:border-primary"
        >
          View Pricing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="border border-border bg-card shadow-sm rounded-2xl p-10 text-center">
          <p className="mb-1 font-semibold text-foreground">No paid listings yet</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Upgrade one of your submitted tools to get a Verified or Featured listing.
          </p>
          <Button asChild>
            <Link to="/listing-pricing" className="inline-block no-underline">
              See Listing Plans
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((item) => (
            <div
              key={item.id}
              className="border border-border bg-card shadow-sm flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        tierBadge[item.listingTier] ?? '',
                      )}
                    >
                      {tierLabel[item.listingTier] ?? item.listingTier}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        item.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-border text-muted-foreground',
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">Permanent listing</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {item.status === 'approved' && (
                  <Link
                    to="/tools/$slug"
                    params={{ slug: item.slug }}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground no-underline transition hover:border-primary"
                  >
                    View Page
                  </Link>
                )}
                {item.listingTier === 'standard' && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={upgradingId === item.id}
                    onClick={() => handleUpgrade(item.id)}
                  >
                    {upgradingId === item.id ? 'Redirecting…' : 'Upgrade to Featured — $60'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upsell for approved free-tier tools */}
      <div className="border border-border bg-card shadow-sm rounded-xl p-5">
        <p className="mb-1 text-sm font-semibold text-foreground">
          Have tools on the free tier?
        </p>
        <p className="mb-3 text-sm text-muted-foreground">
          Upgrade any of your submitted tools to Standard ($39) or Featured ($99) for permanent enhanced visibility.
        </p>
        <Link
          to="/dashboard/submissions"
          className="text-sm font-medium text-primary no-underline hover:underline"
        >
          View my submissions →
        </Link>
      </div>
    </div>
  )
}
