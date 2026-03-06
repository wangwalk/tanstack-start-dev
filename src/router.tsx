import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import { getContext } from './integrations/tanstack-query/root-provider'
import { deLocalizeUrl, localizeUrl } from './paraglide/runtime.js'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,

    context: { ...getContext(), session: null },

    // Locale-transparent URL rewriting via Paraglide:
    // - input: strip locale prefix before routing  (/zh-CN/pricing → /pricing)
    // - output: add locale prefix to generated links (/pricing → /zh-CN/pricing)
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },

    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
