import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { db } from '#/db/index'
import { user, account, session } from '#/db/schema'
import { auth } from '#/lib/auth'

export const getUserSubscription = createServerFn()
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const [row] = await db
      .select({
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
      })
      .from(user)
      .where(eq(user.id, data.userId))
      .limit(1)

    return {
      subscriptionStatus: row?.subscriptionStatus ?? null,
      subscriptionPlan: row?.subscriptionPlan ?? null,
    }
  })

export const updateUserName = createServerFn({ method: 'POST' })
  .inputValidator((input: { userId: string; name: string }) => input)
  .handler(async ({ data }) => {
    const trimmed = data.name.trim()
    if (!trimmed) {
      throw new Error('Name is required')
    }

    await db
      .update(user)
      .set({ name: trimmed, updatedAt: new Date() })
      .where(eq(user.id, data.userId))

    return { success: true, name: trimmed }
  })

export const getLinkedAccounts = createServerFn()
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const accounts = await db
      .select({
        providerId: account.providerId,
        accountId: account.accountId,
        createdAt: account.createdAt,
      })
      .from(account)
      .where(eq(account.userId, data.userId))

    return accounts.filter((a) => a.providerId !== 'credential')
  })

export const getActiveSessions = createServerFn()
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const request = getRequest()
    const currentSession = await auth.api.getSession({
      headers: request.headers,
    })

    const sessions = await db
      .select({
        id: session.id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      })
      .from(session)
      .where(eq(session.userId, data.userId))

    return sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSession?.session?.id,
    }))
  })

export const revokeSession = createServerFn({ method: 'POST' })
  .inputValidator((input: { sessionId: string }) => input)
  .handler(async ({ data }) => {
    await db.delete(session).where(eq(session.id, data.sessionId))
    return { success: true }
  })
