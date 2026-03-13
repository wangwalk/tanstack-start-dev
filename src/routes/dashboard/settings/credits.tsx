import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'
import { z } from 'zod'
import { createCreditCheckoutSession } from '#/lib/billing'
import { getCreditTransactions } from '#/lib/credits'
import { CREDIT_PACKS } from '#/config/billing'
import type { CreditPackKey } from '#/config/billing'
import { Button } from '#/components/ui/button'

const searchSchema = z.object({
  checkout: z.enum(['success']).optional(),
})

export const Route = createFileRoute('/dashboard/settings/credits')({
  validateSearch: searchSchema,
  loader: async () => {
    const txResult = await getCreditTransactions({ data: { limit: 20 } })
    return { transactions: txResult.items, nextCursor: txResult.nextCursor }
  },
  component: CreditsPage,
})

function CreditsPage() {
  const { creditBalance } = Route.useRouteContext()
  const { transactions } = Route.useLoaderData()
  const { checkout } = Route.useSearch()
  const router = useRouter()
  const [purchasing, setPurchasing] = useState<CreditPackKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    if (checkout === 'success') {
      setToastVisible(true)
      router.invalidate()
      const t = setTimeout(() => setToastVisible(false), 5000)
      return () => clearTimeout(t)
    }
  }, [checkout, router])

  async function handleBuyPack(pack: CreditPackKey) {
    setError(null)
    setPurchasing(pack)
    try {
      const result = await createCreditCheckoutSession({ data: { pack } })
      if (result.url) {
        window.location.href = result.url
      }
    } catch {
      setError('Unable to start checkout. Please try again.')
    } finally {
      setPurchasing(null)
    }
  }

  const balance = creditBalance?.balance ?? 0
  const isLowBalance = balance < 10

  return (
    <div className="space-y-6">
      {/* Success toast */}
      {toastVisible && (
        <div className="rise-in rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4 text-sm font-medium text-teal-800 dark:border-teal-800/40 dark:bg-teal-950/30 dark:text-teal-300">
          Credits added to your account.
        </div>
      )}

      {/* Balance card */}
      <section className="rise-in border border-border bg-card shadow-sm rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Credit balance</p>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-4 py-1.5 text-lg font-bold text-primary">
            <Zap className="h-4 w-4" />
            {balance}
          </span>
          <span className="text-sm text-muted-foreground">credits available</span>
        </div>

        {isLowBalance && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300">
            Your balance is low. Purchase a credit pack to continue using credits.
          </div>
        )}
      </section>

      {/* Buy credits */}
      <section className="rise-in border border-border bg-card shadow-sm rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Buy credits</p>

        <div className="grid gap-4 sm:grid-cols-3">
          {(
            Object.entries(CREDIT_PACKS) as [
              CreditPackKey,
              (typeof CREDIT_PACKS)[CreditPackKey],
            ][]
          ).map(([key, pack]) => (
            <div
              key={key}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div>
                <p className="font-semibold text-foreground">{pack.name}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{pack.amount}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pack.credits} credits
                </p>
              </div>
              <Button
                type="button"
                onClick={() => void handleBuyPack(key)}
                disabled={purchasing !== null}
                className="mt-auto inline-flex items-center justify-center"
              >
                {purchasing === key ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Opening…
                  </span>
                ) : (
                  `Buy for ${pack.amount}`
                )}
              </Button>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}
      </section>

      {/* Transaction history */}
      <section className="rise-in border border-border bg-card shadow-sm rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Transaction history</p>

        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No transactions yet. Purchase credits to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">Type</th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">Amount</th>
                  <th className="pb-3 font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="capitalize text-foreground">{tx.type}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          tx.amount > 0
                            ? 'font-semibold text-primary dark:text-primary'
                            : 'font-semibold text-muted-foreground'
                        }
                      >
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {tx.description ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
