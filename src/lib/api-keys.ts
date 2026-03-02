import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { eq, and } from 'drizzle-orm'
import crypto from 'node:crypto'
import { db } from '#/db/index'
import { apiKey } from '#/db/schema'
import { auth } from '#/lib/auth'

export const createApiKey = createServerFn({ method: 'POST' })
  .inputValidator((input: { name: string }) => input)
  .handler(async ({ data }) => {
    const request = getRequest()
    const currentSession = await auth.api.getSession({ headers: request.headers })
    if (!currentSession) throw new Error('Unauthorized')
    const userId = currentSession.user.id

    const { name } = data
    const rawKey = `nwa_${crypto.randomBytes(36).toString('base64url')}`
    const keyPrefix = rawKey.slice(0, 12)
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
    const id = crypto.randomUUID()

    await db.insert(apiKey).values({
      id,
      userId,
      name,
      keyPrefix,
      keyHash,
      createdAt: new Date(),
    })

    return { id, name, keyPrefix, key: rawKey, createdAt: new Date().toISOString() }
  })

export const listApiKeys = createServerFn().handler(async () => {
  const request = getRequest()
  const currentSession = await auth.api.getSession({ headers: request.headers })
  if (!currentSession) throw new Error('Unauthorized')

  const keys = await db
    .select({
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      createdAt: apiKey.createdAt,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
    })
    .from(apiKey)
    .where(eq(apiKey.userId, currentSession.user.id))
    .orderBy(apiKey.createdAt)

  return keys
})

export const revokeApiKey = createServerFn({ method: 'POST' })
  .inputValidator((input: { keyId: string }) => input)
  .handler(async ({ data }) => {
    const request = getRequest()
    const currentSession = await auth.api.getSession({ headers: request.headers })
    if (!currentSession) throw new Error('Unauthorized')

    const deleted = await db
      .delete(apiKey)
      .where(and(eq(apiKey.id, data.keyId), eq(apiKey.userId, currentSession.user.id)))
      .returning({ id: apiKey.id })

    if (deleted.length === 0) throw new Error('API key not found')

    return { success: true }
  })
