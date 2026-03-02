import { eq, and } from 'drizzle-orm'
import { db } from '#/db/index'
import { user, account, session } from '#/db/schema'
import { userFn } from '#/lib/server-fn'

export const updateUserName = userFn({ method: 'POST' })
  .inputValidator((input: { name: string }) => input)
  .handler(async ({ data, context }) => {
    const trimmed = data.name.trim()
    if (!trimmed) {
      throw new Error('Name is required')
    }

    await db
      .update(user)
      .set({ name: trimmed, updatedAt: new Date() })
      .where(eq(user.id, context.user.id))

    return { success: true, name: trimmed }
  })

export const getLinkedAccounts = userFn().handler(async ({ context }) => {
  const accounts = await db
    .select({
      providerId: account.providerId,
      accountId: account.accountId,
      createdAt: account.createdAt,
    })
    .from(account)
    .where(eq(account.userId, context.user.id))

  return accounts.filter((a) => a.providerId !== 'credential')
})

export const getActiveSessions = userFn().handler(async ({ context }) => {
  const sessions = await db
    .select({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    })
    .from(session)
    .where(eq(session.userId, context.user.id))

  return sessions.map((s) => ({
    ...s,
    isCurrent: s.id === context.session.id,
  }))
})

export const revokeSession = userFn({ method: 'POST' })
  .inputValidator((input: { sessionId: string }) => input)
  .handler(async ({ data, context }) => {
    const deleted = await db
      .delete(session)
      .where(and(eq(session.id, data.sessionId), eq(session.userId, context.user.id)))
      .returning({ id: session.id })

    if (deleted.length === 0) throw new Error('Session not found')

    return { success: true }
  })

export const updateUserAvatar = userFn({ method: 'POST' })
  .inputValidator((input: { avatarUrl: string }) => input)
  .handler(async ({ data, context }) => {
    await db
      .update(user)
      .set({ image: data.avatarUrl, updatedAt: new Date() })
      .where(eq(user.id, context.user.id))

    return { success: true, avatarUrl: data.avatarUrl }
  })
