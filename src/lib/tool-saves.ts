import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '#/db/index'
import { tool, userToolSave } from '#/db/schema'
import { enrichToolsForCards } from '#/lib/public'
import { userFn } from '#/lib/server-fn'

const SAVED_PAGE_SIZE = 20

export const toggleToolSave = userFn({ method: 'POST' })
  .inputValidator((input: { toolId: string }) => input)
  .handler(async ({ data, context }) => {
    const [existingTool] = await db
      .select({ id: tool.id })
      .from(tool)
      .where(and(eq(tool.id, data.toolId), eq(tool.status, 'approved')))
      .limit(1)

    if (!existingTool) {
      throw new Error('Tool not found')
    }

    const [existingSave] = await db
      .select({ toolId: userToolSave.toolId })
      .from(userToolSave)
      .where(and(eq(userToolSave.userId, context.user.id), eq(userToolSave.toolId, data.toolId)))
      .limit(1)

    if (existingSave) {
      await db
        .delete(userToolSave)
        .where(and(eq(userToolSave.userId, context.user.id), eq(userToolSave.toolId, data.toolId)))
    } else {
      await db.insert(userToolSave).values({
        userId: context.user.id,
        toolId: data.toolId,
        createdAt: new Date(),
      })
    }

    const [{ total }] = await db
      .select({ total: count() })
      .from(userToolSave)
      .where(eq(userToolSave.toolId, data.toolId))

    return {
      isSaved: !existingSave,
      saveCount: total,
    }
  })

export const getToolSaveState = userFn()
  .inputValidator((input: { toolId: string }) => input)
  .handler(async ({ data, context }) => {
    const [savedRow, countRow] = await Promise.all([
      db
        .select({ toolId: userToolSave.toolId })
        .from(userToolSave)
        .where(and(eq(userToolSave.userId, context.user.id), eq(userToolSave.toolId, data.toolId)))
        .limit(1),
      db
        .select({ total: count() })
        .from(userToolSave)
        .where(eq(userToolSave.toolId, data.toolId))
        .then((rows) => rows[0]),
    ])

    return {
      isSaved: Boolean(savedRow),
      saveCount: countRow?.total ?? 0,
    }
  })

export const getSavedTools = userFn()
  .inputValidator((input: { page?: number }) => input)
  .handler(async ({ data, context }) => {
    const page = data.page ?? 1
    const offset = (page - 1) * SAVED_PAGE_SIZE

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({ tool })
        .from(userToolSave)
        .innerJoin(tool, eq(userToolSave.toolId, tool.id))
        .where(and(eq(userToolSave.userId, context.user.id), eq(tool.status, 'approved')))
        .orderBy(desc(userToolSave.createdAt))
        .limit(SAVED_PAGE_SIZE)
        .offset(offset),
      db
        .select({ total: count() })
        .from(userToolSave)
        .innerJoin(tool, eq(userToolSave.toolId, tool.id))
        .where(and(eq(userToolSave.userId, context.user.id), eq(tool.status, 'approved'))),
    ])

    return {
      tools: await enrichToolsForCards(
        rows.map((row) => row.tool),
        context.user.id,
      ),
      total,
      page,
      totalPages: Math.ceil(total / SAVED_PAGE_SIZE),
    }
  })
