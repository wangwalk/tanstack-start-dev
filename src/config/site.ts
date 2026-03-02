/**
 * Central site configuration — the single entry point for all template settings.
 *
 * Fork this project and update the values here to customise your app.
 * Every component, route, and email reads from this object.
 */
export const siteConfig = {
  /** The application name shown in titles, emails, and UI. */
  name: 'Stockholm',

  /** Short tagline used for meta descriptions and OG tags. */
  description:
    'The modern platform for building, deploying, and scaling your next great product.',

  /** Canonical base URL (no trailing slash). */
  url: 'https://example.com',

  /**
   * Feature flags — set to `false` to hide UI elements.
   * Code is never deleted; features are conditionally rendered.
   */
  features: {
    /** Show the Credits balance widget and settings page in the dashboard. */
    credits: true,

    /** Show the newsletter signup form in the footer. */
    newsletter: true,

    /** Show the Blog link in the header and footer. */
    blog: true,

    /** Show the Changelog link in the header. */
    changelog: true,

    /**
     * Enable analytics components (GA4, PostHog, Plausible, etc.).
     * Configure the specific provider via env vars.
     */
    analytics: true,

    /**
     * Enable Cloudflare Turnstile CAPTCHA on the contact form.
     * Requires TURNSTILE_SECRET_KEY env var.
     */
    turnstile: true,

    /** Send email notifications to admins on contact form submissions. */
    adminNotifications: true,
  },

  /**
   * Enabled authentication methods.
   * Disabling a method here hides the button in the UI,
   * but you must also remove the provider from `src/lib/auth.ts`.
   */
  auth: {
    emailPassword: true,
    github: true,
    google: true,
  },

  /** Billing / Stripe settings. */
  billing: {
    /** Set to `false` to hide all pricing UI and disable checkout. */
    enabled: true,

    /** ISO 4217 currency code used for display purposes. */
    currency: 'USD',
  },

  /**
   * Social profile URLs.
   * Leave a value as an empty string `''` to hide that icon.
   */
  social: {
    twitter: 'https://x.com/tan_stack',
    github: 'https://github.com/TanStack',
    discord: '',
  },
} as const

export type SiteConfig = typeof siteConfig
