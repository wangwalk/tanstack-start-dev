import { and, asc, count, desc, eq, like } from 'drizzle-orm'
import { db } from '#/db/index'
import { category, tag, tool, toolCategory, toolTag } from '#/db/schema'
import { adminFn } from '#/lib/server-fn'

const PAGE_SIZE = 20

export const getTools = adminFn().inputValidator(
  (input: { page?: number; search?: string; status?: string }) => input,
).handler(async ({ data }) => {
  const page = data.page ?? 1
  const offset = (page - 1) * PAGE_SIZE

  const conditions = []
  if (data.search) conditions.push(like(tool.name, `%${data.search}%`))
  if (data.status && data.status !== 'all') conditions.push(eq(tool.status, data.status))
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(tool).where(where).orderBy(desc(tool.createdAt)).limit(PAGE_SIZE).offset(offset),
    db.select({ total: count() }).from(tool).where(where),
  ])

  return { tools: rows, total, page, totalPages: Math.ceil(total / PAGE_SIZE) }
})

export const getTool = adminFn().inputValidator(
  (input: { toolId: string }) => input,
).handler(async ({ data }) => {
  const [row] = await db.select().from(tool).where(eq(tool.id, data.toolId)).limit(1)
  if (!row) throw new Error('Tool not found')

  const [categories, tags] = await Promise.all([
    db.select({ id: toolCategory.categoryId }).from(toolCategory).where(eq(toolCategory.toolId, data.toolId)),
    db.select({ id: toolTag.tagId }).from(toolTag).where(eq(toolTag.toolId, data.toolId)),
  ])

  return {
    ...row,
    categoryIds: categories.map((c) => c.id),
    tagIds: tags.map((t) => t.id),
  }
})

export const getAllCategories = adminFn().handler(async () => {
  return db.select({ id: category.id, name: category.name, slug: category.slug }).from(category).orderBy(asc(category.name))
})

export const getAllTags = adminFn().handler(async () => {
  return db.select({ id: tag.id, name: tag.name, slug: tag.slug }).from(tag).orderBy(asc(tag.name))
})

export const createTool = adminFn({ method: 'POST' }).inputValidator(
  (input: {
    name: string
    slug: string
    url: string
    description?: string
    content?: string
    logoUrl?: string
    screenshotUrl?: string
    pricingType: string
    status: string
    isFeatured: boolean
    categoryIds: string[]
    tagIds: string[]
  }) => input,
).handler(async ({ data, context }) => {
  const id = crypto.randomUUID()
  const now = new Date()

  await db.insert(tool).values({
    id,
    name: data.name,
    slug: data.slug,
    url: data.url,
    description: data.description ?? null,
    content: data.content ?? null,
    logoUrl: data.logoUrl ?? null,
    screenshotUrl: data.screenshotUrl ?? null,
    pricingType: data.pricingType,
    status: data.status,
    isFeatured: data.isFeatured,
    submittedBy: context.user.id,
    approvedBy: data.status === 'approved' ? context.user.id : null,
    approvedAt: data.status === 'approved' ? now : null,
    createdAt: now,
    updatedAt: now,
  })

  if (data.categoryIds.length > 0) {
    await db.insert(toolCategory).values(data.categoryIds.map((categoryId) => ({ toolId: id, categoryId })))
  }
  if (data.tagIds.length > 0) {
    await db.insert(toolTag).values(data.tagIds.map((tagId) => ({ toolId: id, tagId })))
  }

  return { id }
})

export const updateTool = adminFn({ method: 'POST' }).inputValidator(
  (input: {
    toolId: string
    name: string
    slug: string
    url: string
    description?: string
    content?: string
    logoUrl?: string
    screenshotUrl?: string
    pricingType: string
    status: string
    isFeatured: boolean
    categoryIds: string[]
    tagIds: string[]
  }) => input,
).handler(async ({ data, context }) => {
  const now = new Date()

  const [existing] = await db.select({ status: tool.status }).from(tool).where(eq(tool.id, data.toolId)).limit(1)
  if (!existing) throw new Error('Tool not found')

  const justApproved = existing.status !== 'approved' && data.status === 'approved'

  await db.update(tool).set({
    name: data.name,
    slug: data.slug,
    url: data.url,
    description: data.description ?? null,
    content: data.content ?? null,
    logoUrl: data.logoUrl ?? null,
    screenshotUrl: data.screenshotUrl ?? null,
    pricingType: data.pricingType,
    status: data.status,
    isFeatured: data.isFeatured,
    approvedBy: justApproved ? context.user.id : undefined,
    approvedAt: justApproved ? now : undefined,
    updatedAt: now,
  }).where(eq(tool.id, data.toolId))

  await db.delete(toolCategory).where(eq(toolCategory.toolId, data.toolId))
  await db.delete(toolTag).where(eq(toolTag.toolId, data.toolId))

  if (data.categoryIds.length > 0) {
    await db.insert(toolCategory).values(data.categoryIds.map((categoryId) => ({ toolId: data.toolId, categoryId })))
  }
  if (data.tagIds.length > 0) {
    await db.insert(toolTag).values(data.tagIds.map((tagId) => ({ toolId: data.toolId, tagId })))
  }

  return { success: true }
})

export const deleteTool = adminFn({ method: 'POST' }).inputValidator(
  (input: { toolId: string }) => input,
).handler(async ({ data }) => {
  await db.delete(toolCategory).where(eq(toolCategory.toolId, data.toolId))
  await db.delete(toolTag).where(eq(toolTag.toolId, data.toolId))
  await db.delete(tool).where(eq(tool.id, data.toolId))
  return { success: true }
})
