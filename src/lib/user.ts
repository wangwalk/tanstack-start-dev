import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { eq, and } from 'drizzle-orm'
import { db } from '#/db/index'
import { user, account, session } from '#/db/schema'
import { auth } from '#/lib/auth'

export const getUserSubscription = createServerFn().handler(async () => {
  const request = getRequest()
  const currentSession = await auth.api.getSession({ headers: request.headers })
  if (!currentSession) throw new Error('Unauthorized')

  const [row] = await db
    .select({
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
    })
    .from(user)
    .where(eq(user.id, currentSession.user.id))
    .limit(1)

  return {
    subscriptionStatus: row?.subscriptionStatus ?? null,
    subscriptionPlan: row?.subscriptionPlan ?? null,
  }
})

export const updateUserName = createServerFn({ method: 'POST' })
  .inputValidator((input: { name: string }) => input)
  .handler(async ({ data }) => {
    const request = getRequest()
    const currentSession = await auth.api.getSession({ headers: request.headers })
    if (!currentSession) throw new Error('Unauthorized')

    const trimmed = data.name.trim()
    if (!trimmed) {
      throw new Error('Name is required')
    }

    await db
      .update(user)
      .set({ name: trimmed, updatedAt: new Date() })
      .where(eq(user.id, currentSession.user.id))

    return { success: true, name: trimmed }
  })

export const getLinkedAccounts = createServerFn().handler(async () => {
  const request = getRequest()
  const currentSession = await auth.api.getSession({ headers: request.headers })
  if (!currentSession) throw new Error('Unauthorized')

  const accounts = await db
    .select({
      providerId: account.providerId,
      accountId: account.accountId,
      createdAt: account.createdAt,
    })
    .from(account)
    .where(eq(account.userId, currentSession.user.id))

  return accounts.filter((a) => a.providerId !== 'credential')
})

export const getActiveSessions = createServerFn().handler(async () => {
  const request = getRequest()
  const currentSession = await auth.api.getSession({ headers: request.headers })
  if (!currentSession) throw new Error('Unauthorized')

  const sessions = await db
    .select({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    })
    .from(session)
    .where(eq(session.userId, currentSession.user.id))

  return sessions.map((s) => ({
    ...s,
    isCurrent: s.id === currentSession.session.id,
  }))
})

export const revokeSession = createServerFn({ method: 'POST' })
  .inputValidator((input: { sessionId: string }) => input)
  .handler(async ({ data }) => {
    const request = getRequest()
    const currentSession = await auth.api.getSession({ headers: request.headers })
    if (!currentSession) throw new Error('Unauthorized')

    await db
      .delete(session)
      .where(and(eq(session.id, data.sessionId), eq(session.userId, currentSession.user.id)))

    return { success: true }
  })

export const updateUserAvatar = createServerFn({ method: 'POST' })
  .inputValidator((input: { avatarUrl: string }) => input)
  .handler(async ({ data }) => {
    const request = getRequest()
    const currentSession = await auth.api.getSession({ headers: request.headers })
    if (!currentSession) throw new Error('Unauthorized')

    await db
      .update(user)
      .set({ image: data.avatarUrl, updatedAt: new Date() })
      .where(eq(user.id, currentSession.user.id))

    return { success: true, avatarUrl: data.avatarUrl }
  })
