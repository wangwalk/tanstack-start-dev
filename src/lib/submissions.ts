/**
 * Server functions for user tool submissions.
 */
import { and, desc, eq } from 'drizzle-orm'
import { db } from '#/db/index'
import { tool, toolCategory, toolTag } from '#/db/schema'
import { userFn } from '#/lib/server-fn'

export const submitTool = userFn({ method: 'POST' })
  .inputValidator(
    (input: {
      name: string
      slug: string
      url: string
      description?: string
      content?: string
      logoUrl?: string
      screenshotUrl?: string
      pricingType: string
      categoryIds: string[]
      tagIds: string[]
    }) => input,
  )
  .handler(async ({ data, context }) => {
    // Enforce URL uniqueness
    const [existing] = await db
      .select({ id: tool.id })
      .from(tool)
      .where(eq(tool.url, data.url))
      .limit(1)
    if (existing) throw new Error('该 URL 的工具已存在，请勿重复提交。')

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
      status: 'pending',
      isFeatured: false,
      submittedBy: context.user.id,
      approvedBy: null,
      approvedAt: null,
      createdAt: now,
      updatedAt: now,
    })

    if (data.categoryIds.length > 0) {
      await db
        .insert(toolCategory)
        .values(data.categoryIds.map((categoryId) => ({ toolId: id, categoryId })))
    }
    if (data.tagIds.length > 0) {
      await db
        .insert(toolTag)
        .values(data.tagIds.map((tagId) => ({ toolId: id, tagId })))
    }

    return { id }
  })

export const getMySubmissions = userFn()
  .inputValidator(
    (input: {
      status?: string
      page?: number
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const PAGE_SIZE = 20
    const page = data.page ?? 1
    const offset = (page - 1) * PAGE_SIZE

    const conditions = [eq(tool.submittedBy, context.user.id)]
    if (data.status && data.status !== 'all') {
      conditions.push(eq(tool.status, data.status))
    }

    const rows = await db
      .select()
      .from(tool)
      .where(and(...conditions))
      .orderBy(desc(tool.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset)

    return { tools: rows, page }
  })

export const withdrawSubmission = userFn({ method: 'POST' })
  .inputValidator((input: { toolId: string }) => input)
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({ id: tool.id, status: tool.status, submittedBy: tool.submittedBy })
      .from(tool)
      .where(eq(tool.id, data.toolId))
      .limit(1)
    if (!row) throw new Error('Tool not found')
    if (row.submittedBy !== context.user.id) throw new Error('Forbidden')
    if (row.status !== 'pending') throw new Error('只有待审核的工具才能撤回。')

    await db.update(tool).set({ status: 'draft', updatedAt: new Date() }).where(eq(tool.id, data.toolId))
    return { success: true }
  })

export const resubmitTool = userFn({ method: 'POST' })
  .inputValidator(
    (input: {
      toolId: string
      name: string
      slug: string
      url: string
      description?: string
      pricingType: string
      categoryIds: string[]
      tagIds: string[]
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({ id: tool.id, status: tool.status, submittedBy: tool.submittedBy })
      .from(tool)
      .where(eq(tool.id, data.toolId))
      .limit(1)
    if (!row) throw new Error('Tool not found')
    if (row.submittedBy !== context.user.id) throw new Error('Forbidden')
    if (row.status !== 'rejected' && row.status !== 'draft') {
      throw new Error('只有被拒绝或草稿状态的工具才能重新提交。')
    }

    const now = new Date()
    await db
      .update(tool)
      .set({
        name: data.name,
        slug: data.slug,
        url: data.url,
        description: data.description ?? null,
        pricingType: data.pricingType,
        status: 'pending',
        updatedAt: now,
      })
      .where(eq(tool.id, data.toolId))

    await db.delete(toolCategory).where(eq(toolCategory.toolId, data.toolId))
    await db.delete(toolTag).where(eq(toolTag.toolId, data.toolId))

    if (data.categoryIds.length > 0) {
      await db
        .insert(toolCategory)
        .values(data.categoryIds.map((categoryId) => ({ toolId: data.toolId, categoryId })))
    }
    if (data.tagIds.length > 0) {
      await db
        .insert(toolTag)
        .values(data.tagIds.map((tagId) => ({ toolId: data.toolId, tagId })))
    }

    return { success: true }
  })
