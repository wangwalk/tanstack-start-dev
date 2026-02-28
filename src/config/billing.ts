export const BILLING_PLANS = {
  pro: {
    name: 'Pro',
    monthly: {
      priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
      amount: '$29',
    },
    yearly: {
      priceId: process.env.STRIPE_PRICE_PRO_YEARLY!,
      amount: '$290',
    },
  },
} as const

export type PlanKey = keyof typeof BILLING_PLANS
export type BillingInterval = 'monthly' | 'yearly'
