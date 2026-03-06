import { asc, count, eq } from 'drizzle-orm'
import { db } from '#/db/index'
import { tag, toolTag } from '#/db/schema'
import { adminFn } from '#/lib/server-fn'

export const getTags = adminFn().handler(async () => {
  const rows = await db.select().from(tag).orderBy(asc(tag.name))

  const usageCounts = await db
    .select({ tagId: toolTag.tagId, count: count() })
    .from(toolTag)
    .groupBy(toolTag.tagId)

  const countMap = new Map(usageCounts.map((r) => [r.tagId, r.count]))

  return rows.map((r) => ({ ...r, toolCount: countMap.get(r.id) ?? 0 }))
})

export const createTag = adminFn({ method: 'POST' }).inputValidator(
  (input: { name: string; slug: string }) => input,
).handler(async ({ data }) => {
  const id = crypto.randomUUID()

  await db.insert(tag).values({ id, name: data.name, slug: data.slug, createdAt: new Date() })

  return { id }
})

export const updateTag = adminFn({ method: 'POST' }).inputValidator(
  (input: { tagId: string; name: string; slug: string }) => input,
).handler(async ({ data }) => {
  const [existing] = await db.select({ id: tag.id }).from(tag).where(eq(tag.id, data.tagId)).limit(1)
  if (!existing) throw new Error('Tag not found')

  await db.update(tag).set({ name: data.name, slug: data.slug }).where(eq(tag.id, data.tagId))

  return { success: true }
})

export const deleteTag = adminFn({ method: 'POST' }).inputValidator(
  (input: { tagId: string }) => input,
).handler(async ({ data }) => {
  await db.delete(toolTag).where(eq(toolTag.tagId, data.tagId))
  await db.delete(tag).where(eq(tag.id, data.tagId))
  return { success: true }
})

export const mergeTags = adminFn({ method: 'POST' }).inputValidator(
  (input: { sourceTagId: string; targetTagId: string }) => input,
).handler(async ({ data }) => {
  // Move all toolTag entries from source to target, ignoring conflicts
  const sourceEntries = await db
    .select({ toolId: toolTag.toolId })
    .from(toolTag)
    .where(eq(toolTag.tagId, data.sourceTagId))

  const targetEntries = await db
    .select({ toolId: toolTag.toolId })
    .from(toolTag)
    .where(eq(toolTag.tagId, data.targetTagId))

  const targetToolIds = new Set(targetEntries.map((e) => e.toolId))
  const toInsert = sourceEntries.filter((e) => !targetToolIds.has(e.toolId))

  if (toInsert.length > 0) {
    await db.insert(toolTag).values(toInsert.map((e) => ({ toolId: e.toolId, tagId: data.targetTagId })))
  }

  await db.delete(toolTag).where(eq(toolTag.tagId, data.sourceTagId))
  await db.delete(tag).where(eq(tag.id, data.sourceTagId))

  return { success: true }
})
