import { asc, count, eq } from 'drizzle-orm'
import { db } from '#/db/index'
import { category, toolCategory } from '#/db/schema'
import { adminFn } from '#/lib/server-fn'

export const getCategories = adminFn().handler(async () => {
  const rows = await db.select().from(category).orderBy(asc(category.sortOrder), asc(category.name))

  const usageCounts = await db
    .select({ categoryId: toolCategory.categoryId, count: count() })
    .from(toolCategory)
    .groupBy(toolCategory.categoryId)

  const countMap = new Map(usageCounts.map((r) => [r.categoryId, r.count]))

  return rows.map((r) => ({ ...r, toolCount: countMap.get(r.id) ?? 0 }))
})

export const createCategory = adminFn({ method: 'POST' }).inputValidator(
  (input: {
    name: string
    slug: string
    description?: string
    icon?: string
    parentId?: string
    sortOrder?: number
  }) => input,
).handler(async ({ data }) => {
  const id = crypto.randomUUID()
  const now = new Date()

  await db.insert(category).values({
    id,
    name: data.name,
    slug: data.slug,
    description: data.description ?? null,
    icon: data.icon ?? null,
    parentId: data.parentId ?? null,
    sortOrder: data.sortOrder ?? 0,
    createdAt: now,
  })

  return { id }
})

export const updateCategory = adminFn({ method: 'POST' }).inputValidator(
  (input: {
    categoryId: string
    name: string
    slug: string
    description?: string
    icon?: string
    parentId?: string
    sortOrder?: number
  }) => input,
).handler(async ({ data }) => {
  const [existing] = await db.select({ id: category.id }).from(category).where(eq(category.id, data.categoryId)).limit(1)
  if (!existing) throw new Error('Category not found')

  await db.update(category).set({
    name: data.name,
    slug: data.slug,
    description: data.description ?? null,
    icon: data.icon ?? null,
    parentId: data.parentId ?? null,
    sortOrder: data.sortOrder ?? 0,
  }).where(eq(category.id, data.categoryId))

  return { success: true }
})

export const deleteCategory = adminFn({ method: 'POST' }).inputValidator(
  (input: { categoryId: string }) => input,
).handler(async ({ data }) => {
  // Unparent children before deleting
  await db.update(category).set({ parentId: null }).where(eq(category.parentId, data.categoryId))
  await db.delete(toolCategory).where(eq(toolCategory.categoryId, data.categoryId))
  await db.delete(category).where(eq(category.id, data.categoryId))
  return { success: true }
})
