import { paraglideMiddleware } from './paraglide/server.js'
import handler from '@tanstack/react-start/server-entry'

// Custom Cloudflare Workers entry that wraps TanStack Start with Paraglide middleware.
// TanStack Router handles URL localization/delocalization via its `rewrite` option,
// so we pass the original request (not the middleware-delocalized one) to avoid redirect loops.
export default {
  fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, () => handler.fetch(req))
  },
}
