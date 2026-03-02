import { eq, and } from 'drizzle-orm'
import crypto from 'node:crypto'
import { db } from '#/db/index'
import { apiKey } from '#/db/schema'
import { userFn } from '#/lib/server-fn'

export const createApiKey = userFn({ method: 'POST' })
  .inputValidator((input: { name: string }) => input)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
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

export const listApiKeys = userFn().handler(async ({ context }) => {
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
    .where(eq(apiKey.userId, context.user.id))
    .orderBy(apiKey.createdAt)

  return keys
})

export const revokeApiKey = userFn({ method: 'POST' })
  .inputValidator((input: { keyId: string }) => input)
  .handler(async ({ data, context }) => {
    const deleted = await db
      .delete(apiKey)
      .where(and(eq(apiKey.id, data.keyId), eq(apiKey.userId, context.user.id)))
      .returning({ id: apiKey.id })

    if (deleted.length === 0) throw new Error('API key not found')

    return { success: true }
  })
