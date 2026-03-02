import { createServerFn } from '@tanstack/react-start'

export const getAnalyticsConfig = createServerFn({ method: 'GET' }).handler(() => {
  return {
    posthog: process.env.POSTHOG_KEY
      ? {
          apiKey: process.env.POSTHOG_KEY,
          host: process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com',
        }
      : null,
    umami: process.env.UMAMI_WEBSITE_ID
      ? {
          websiteId: process.env.UMAMI_WEBSITE_ID,
          src: process.env.UMAMI_SRC ?? 'https://cloud.umami.is/script.js',
        }
      : null,
    plausible: process.env.PLAUSIBLE_DOMAIN
      ? {
          domain: process.env.PLAUSIBLE_DOMAIN,
          src: process.env.PLAUSIBLE_SRC ?? 'https://plausible.io/js/script.js',
        }
      : null,
    ga4: process.env.GA4_MEASUREMENT_ID
      ? {
          measurementId: process.env.GA4_MEASUREMENT_ID,
        }
      : null,
    openpanel: process.env.OPENPANEL_CLIENT_ID
      ? {
          clientId: process.env.OPENPANEL_CLIENT_ID,
          apiUrl: process.env.OPENPANEL_API_URL ?? 'https://api.openpanel.dev',
        }
      : null,
  }
})

export type AnalyticsConfig = Awaited<ReturnType<typeof getAnalyticsConfig>>
