export const CREDIT_PACKS = {
  starter: {
    name: 'Starter Pack',
    credits: 100,
    amount: '$9',
    priceId: process.env.STRIPE_PRICE_CREDITS_STARTER!,
  },
  growth: {
    name: 'Growth Pack',
    credits: 500,
    amount: '$39',
    priceId: process.env.STRIPE_PRICE_CREDITS_GROWTH!,
  },
  pro: {
    name: 'Pro Pack',
    credits: 2000,
    amount: '$129',
    priceId: process.env.STRIPE_PRICE_CREDITS_PRO!,
  },
} as const

export type CreditPackKey = keyof typeof CREDIT_PACKS

export const BILLING_PLANS = {
  pro: {
    name: 'Pro',
    mode: 'subscription' as const,
    monthly: {
      priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
      amount: '$29',
    },
    yearly: {
      priceId: process.env.STRIPE_PRICE_PRO_YEARLY!,
      amount: '$290',
    },
  },
  lifetime: {
    name: 'Lifetime',
    mode: 'payment' as const,
    priceId: process.env.STRIPE_PRICE_LIFETIME!,
    amount: '$299',
  },
} as const

export type PlanKey = keyof typeof BILLING_PLANS
export type BillingInterval = 'monthly' | 'yearly'

export const LISTING_TIERS = {
  standard: {
    name: 'Standard',
    amount: 3900, // $39 in cents
    display: '$39',
    priceId: process.env.STRIPE_PRICE_LISTING_STANDARD!,
  },
  featured: {
    name: 'Featured',
    amount: 9900, // $99 in cents
    display: '$99',
    priceId: process.env.STRIPE_PRICE_LISTING_FEATURED!,
  },
} as const

// Upgrade from standard → featured (pay the difference)
export const LISTING_UPGRADE_AMOUNT = 6000 // $60 in cents

export type ListingTierKey = keyof typeof LISTING_TIERS

export const REGISTER_GIFT_CREDITS = 100

export const PLAN_MONTHLY_CREDITS = {
  pro: 500,
  lifetime: 300,
} as const
