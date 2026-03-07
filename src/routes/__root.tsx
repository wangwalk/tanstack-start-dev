import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import Footer from '../components/Footer'
import Header from '../components/Header'

import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'
import { Analytics } from '#/components/analytics'
import { Toaster } from '#/components/ui/sonner'
import appCss from '../styles.css?url'
import { getAnalyticsConfig } from '#/lib/analytics'
import { getSession } from '#/lib/auth-guard'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '#/lib/site'
import { getLocale } from '#/paraglide/runtime.js'
import type { QueryClient } from '@tanstack/react-query'

const DevToolsPanel = import.meta.env.DEV
  ? lazy(() => import('#/components/DevToolsPanel'))
  : null

type Session = Awaited<ReturnType<typeof getSession>>

interface MyRouterContext {
  queryClient: QueryClient
  session: Session
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (session?.user.banned && location.pathname !== '/auth/banned') {
      throw redirect({ to: '/auth/banned' })
    }
    return { session }
  },
  loader: () => getAnalyticsConfig(),
  staleTime: Infinity,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: SITE_TITLE },
      { name: 'description', content: SITE_DESCRIPTION },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_TITLE },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:title', content: SITE_TITLE },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:image', content: `${SITE_URL}/images/lagoon-1.svg` },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
      { rel: 'icon', type: 'image/png', href: '/logo192.png', sizes: '192x192' },
      { rel: 'apple-touch-icon', href: '/logo192.png' },
    ],
  }),
  component: RootLayout,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Page not found
      </p>
      <a
        href="/"
        className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Back to home
      </a>
    </div>
  )
}

function RootLayout() {
  const analytics = Route.useLoaderData()
  return (
    <>
      <Analytics config={analytics} />
      <Outlet />
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <TanStackQueryProvider>
          {!isDashboard && <Header />}
          {children}
          {!isDashboard && <Footer />}
          <Toaster />
          {DevToolsPanel && (
            <Suspense>
              <DevToolsPanel />
            </Suspense>
          )}
        </TanStackQueryProvider>
        <Scripts />
      </body>
    </html>
  )
}
