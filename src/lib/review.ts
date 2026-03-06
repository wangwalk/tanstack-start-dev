/**
 * Admin server functions for the tool review queue.
 */
import { asc, count, eq } from 'drizzle-orm'
import { db } from '#/db/index'
import { tool } from '#/db/schema'
import { adminFn } from '#/lib/server-fn'

const PAGE_SIZE = 20

export const getPendingTools = adminFn()
  .inputValidator((input: { page?: number }) => input)
  .handler(async ({ data }) => {
    const page = data.page ?? 1
    const offset = (page - 1) * PAGE_SIZE

    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(tool)
        .where(eq(tool.status, 'pending'))
        .orderBy(asc(tool.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      db.select({ total: count() }).from(tool).where(eq(tool.status, 'pending')),
    ])

    return { tools: rows, total, page, totalPages: Math.ceil(total / PAGE_SIZE) }
  })

export const approveTool = adminFn({ method: 'POST' })
  .inputValidator((input: { toolId: string }) => input)
  .handler(async ({ data, context }) => {
    const now = new Date()
    await db
      .update(tool)
      .set({
        status: 'approved',
        approvedBy: context.user.id,
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(tool.id, data.toolId))
    return { success: true }
  })

export const rejectTool = adminFn({ method: 'POST' })
  .inputValidator((input: { toolId: string; reason?: string }) => input)
  .handler(async ({ data }) => {
    await db
      .update(tool)
      .set({
        status: 'rejected',
        updatedAt: new Date(),
      })
      .where(eq(tool.id, data.toolId))
    return { success: true }
  })

export const approveToolsBatch = adminFn({ method: 'POST' })
  .inputValidator((input: { toolIds: string[] }) => input)
  .handler(async ({ data, context }) => {
    const now = new Date()
    await Promise.all(
      data.toolIds.map((id) =>
        db
          .update(tool)
          .set({ status: 'approved', approvedBy: context.user.id, approvedAt: now, updatedAt: now })
          .where(eq(tool.id, id)),
      ),
    )
    return { success: true }
  })

export const rejectToolsBatch = adminFn({ method: 'POST' })
  .inputValidator((input: { toolIds: string[] }) => input)
  .handler(async ({ data }) => {
    const now = new Date()
    await Promise.all(
      data.toolIds.map((id) =>
        db
          .update(tool)
          .set({ status: 'rejected', updatedAt: now })
          .where(eq(tool.id, id)),
      ),
    )
    return { success: true }
  })
