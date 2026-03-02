import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'
import { z } from 'zod'
import { createCreditCheckoutSession } from '#/lib/billing'
import { getCreditTransactions } from '#/lib/credits'
import { CREDIT_PACKS } from '#/config/billing'
import type { CreditPackKey } from '#/config/billing'

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
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-4">Credit balance</p>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(79,184,178,0.3)] bg-[rgba(79,184,178,0.15)] px-4 py-1.5 text-lg font-bold text-[var(--lagoon-deep)]">
            <Zap className="h-4 w-4" />
            {balance}
          </span>
          <span className="text-sm text-[var(--sea-ink-soft)]">credits available</span>
        </div>

        {isLowBalance && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300">
            Your balance is low. Purchase a credit pack to continue using credits.
          </div>
        )}
      </section>

      {/* Buy credits */}
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-6">Buy credits</p>

        <div className="grid gap-4 sm:grid-cols-3">
          {(
            Object.entries(CREDIT_PACKS) as [
              CreditPackKey,
              (typeof CREDIT_PACKS)[CreditPackKey],
            ][]
          ).map(([key, pack]) => (
            <div
              key={key}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
            >
              <div>
                <p className="font-semibold text-[var(--sea-ink)]">{pack.name}</p>
                <p className="mt-1 text-2xl font-bold text-[var(--sea-ink)]">{pack.amount}</p>
                <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                  {pack.credits} credits
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleBuyPack(key)}
                disabled={purchasing !== null}
                className="mt-auto inline-flex items-center justify-center rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
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
              </button>
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
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-4">Transaction history</p>

        {transactions.length === 0 ? (
          <p className="text-sm text-[var(--sea-ink-soft)]">
            No transactions yet. Purchase credits to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left">
                  <th className="pb-3 pr-4 font-medium text-[var(--sea-ink-soft)]">Date</th>
                  <th className="pb-3 pr-4 font-medium text-[var(--sea-ink-soft)]">Type</th>
                  <th className="pb-3 pr-4 font-medium text-[var(--sea-ink-soft)]">Amount</th>
                  <th className="pb-3 font-medium text-[var(--sea-ink-soft)]">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-3 pr-4 text-[var(--sea-ink-soft)]">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="capitalize text-[var(--sea-ink)]">{tx.type}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          tx.amount > 0
                            ? 'font-semibold text-teal-600 dark:text-teal-400'
                            : 'font-semibold text-[var(--sea-ink-soft)]'
                        }
                      >
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount}
                      </span>
                    </td>
                    <td className="py-3 text-[var(--sea-ink-soft)]">
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
