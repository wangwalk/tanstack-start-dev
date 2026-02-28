import { createServerFn } from '@tanstack/react-start'
import { eq, and } from 'drizzle-orm'
import crypto from 'node:crypto'
import { db } from '#/db/index'
import { apiKey } from '#/db/schema'

export const createApiKey = createServerFn({ method: 'POST' })
  .inputValidator((input: { userId: string; name: string }) => input)
  .handler(async ({ data }) => {
    const { userId, name } = data

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

export const listApiKeys = createServerFn()
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
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
      .where(eq(apiKey.userId, data.userId))
      .orderBy(apiKey.createdAt)

    return keys
  })

export const revokeApiKey = createServerFn({ method: 'POST' })
  .inputValidator((input: { userId: string; keyId: string }) => input)
  .handler(async ({ data }) => {
    const { userId, keyId } = data

    await db
      .delete(apiKey)
      .where(and(eq(apiKey.id, keyId), eq(apiKey.userId, userId)))

    return { success: true }
  })
