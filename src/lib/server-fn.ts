import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'

// Resolves session from cookies, injects { user, session } into context
export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const request = getRequest()
    const s = await auth.api.getSession({ headers: request.headers })
    if (!s) throw new Error('Unauthorized')
    return next({ context: { user: s.user, session: s.session } })
  },
)

// Chains authMiddleware, additionally checks role === 'admin'
export const adminMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    if (context.user.role !== 'admin') throw new Error('Forbidden')
    return next({ context })
  })

// Factory helpers — pass { method: 'POST' } for mutations, omit for GET (default)
export function userFn(opts?: Parameters<typeof createServerFn>[0]) {
  return createServerFn(opts).middleware([authMiddleware])
}

export function adminFn(opts?: Parameters<typeof createServerFn>[0]) {
  return createServerFn(opts).middleware([adminMiddleware])
}
