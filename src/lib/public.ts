/**
 * Public server functions for the tool directory.
 * No auth required — these power public-facing pages.
 */
import { and, asc, count, desc, eq, inArray, like, or, sql, SQL } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'
import { db } from '#/db/index'
import { category, tag, tool, toolCategory, toolTag, userToolSave } from '#/db/schema'

const PUBLIC_PAGE_SIZE = 24

type PublicCategoryRef = { id: string; name: string; slug: string }
type PublicTagRef = { id: string; name: string; slug: string }
export type PublicToolCard = typeof tool.$inferSelect & {
  categories: PublicCategoryRef[]
  tags: PublicTagRef[]
  saveCount: number
  isSaved: boolean
}

function createSaveCountSubquery() {
  return db
    .select({
      toolId: userToolSave.toolId,
      saveCount: count(),
    })
    .from(userToolSave)
    .groupBy(userToolSave.toolId)
    .as('tool_save_count')
}

function getToolOrderBy(sort: string | undefined, saveCountOrder?: SQL<unknown>) {
  if (sort === 'name') return [asc(tool.name)]
  if (sort === 'saved' && saveCountOrder) return [desc(saveCountOrder), desc(tool.approvedAt)]
  return [desc(tool.approvedAt)]
}

export async function enrichToolsForCards(
  tools: Array<typeof tool.$inferSelect>,
  viewerUserId?: string,
): Promise<PublicToolCard[]> {
  if (tools.length === 0) return []

  const toolIds = tools.map((entry) => entry.id)

  const [categoryRows, tagRows, saveCountRows, savedRows] = await Promise.all([
    db
      .select({
        toolId: toolCategory.toolId,
        category: { id: category.id, name: category.name, slug: category.slug },
      })
      .from(toolCategory)
      .innerJoin(category, eq(toolCategory.categoryId, category.id))
      .where(inArray(toolCategory.toolId, toolIds))
      .orderBy(asc(category.sortOrder), asc(category.name)),
    db
      .select({
        toolId: toolTag.toolId,
        tag: { id: tag.id, name: tag.name, slug: tag.slug },
      })
      .from(toolTag)
      .innerJoin(tag, eq(toolTag.tagId, tag.id))
      .where(inArray(toolTag.toolId, toolIds))
      .orderBy(asc(tag.name)),
    db
      .select({ toolId: userToolSave.toolId, total: count() })
      .from(userToolSave)
      .where(inArray(userToolSave.toolId, toolIds))
      .groupBy(userToolSave.toolId),
    viewerUserId
      ? db
          .select({ toolId: userToolSave.toolId })
          .from(userToolSave)
          .where(and(eq(userToolSave.userId, viewerUserId), inArray(userToolSave.toolId, toolIds)))
      : Promise.resolve([] as Array<{ toolId: string }>),
  ])

  const categoryMap = new Map<string, PublicCategoryRef[]>()
  for (const row of categoryRows) {
    const entries = categoryMap.get(row.toolId) ?? []
    entries.push(row.category)
    categoryMap.set(row.toolId, entries)
  }

  const tagMap = new Map<string, PublicTagRef[]>()
  for (const row of tagRows) {
    const entries = tagMap.get(row.toolId) ?? []
    entries.push(row.tag)
    tagMap.set(row.toolId, entries)
  }

  const saveCountMap = new Map(saveCountRows.map((row) => [row.toolId, row.total]))
  const savedToolIds = new Set(savedRows.map((row) => row.toolId))

  return tools.map((entry) => ({
    ...entry,
    categories: categoryMap.get(entry.id) ?? [],
    tags: tagMap.get(entry.id) ?? [],
    saveCount: saveCountMap.get(entry.id) ?? 0,
    isSaved: savedToolIds.has(entry.id),
  }))
}

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------

export const getFeaturedTools = createServerFn()
  .inputValidator((input: { viewerUserId?: string } | undefined) => input)
  .handler(async ({ data }) => {
    const rows = await db
      .select()
      .from(tool)
      .where(and(eq(tool.status, 'approved'), eq(tool.isFeatured, true)))
      .orderBy(desc(tool.approvedAt))
      .limit(8)

    return enrichToolsForCards(rows, data?.viewerUserId)
  })

export const getNewTools = createServerFn()
  .inputValidator((input: { limit?: number; viewerUserId?: string }) => input)
  .handler(async ({ data }) => {
    const rows = await db
      .select()
      .from(tool)
      .where(eq(tool.status, 'approved'))
      .orderBy(desc(tool.approvedAt))
      .limit(data.limit ?? 12)

    return enrichToolsForCards(rows, data.viewerUserId)
  })

export const getCategoriesWithCount = createServerFn().handler(async () => {
  const rows = await db
    .select()
    .from(category)
    .orderBy(asc(category.sortOrder), asc(category.name))

  const usageCounts = await db
    .select({ categoryId: toolCategory.categoryId, count: count() })
    .from(toolCategory)
    .innerJoin(tool, and(eq(toolCategory.toolId, tool.id), eq(tool.status, 'approved')))
    .groupBy(toolCategory.categoryId)

  const countMap = new Map(usageCounts.map((r) => [r.categoryId, r.count]))
  return rows.map((r) => ({ ...r, toolCount: countMap.get(r.id) ?? 0 }))
})

// ---------------------------------------------------------------------------
// Category page
// ---------------------------------------------------------------------------

export const getCategoryBySlug = createServerFn()
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const [cat] = await db
      .select()
      .from(category)
      .where(eq(category.slug, data.slug))
      .limit(1)
    if (!cat) return null

    const children = await db
      .select()
      .from(category)
      .where(eq(category.parentId, cat.id))
      .orderBy(asc(category.sortOrder), asc(category.name))

    return { ...cat, children }
  })

export const getToolsByCategory = createServerFn()
  .inputValidator(
    (input: { slug: string; pricingType?: string; sort?: string; page?: number; viewerUserId?: string }) => input,
  )
  .handler(async ({ data }) => {
    const page = data.page ?? 1
    const offset = (page - 1) * PUBLIC_PAGE_SIZE
    const saveCountSubquery = createSaveCountSubquery()
    const saveCountOrder = sql<number>`coalesce(${saveCountSubquery.saveCount}, 0)`

    const [cat] = await db
      .select({ id: category.id })
      .from(category)
      .where(eq(category.slug, data.slug))
      .limit(1)
    if (!cat) return { tools: [], total: 0, page, totalPages: 0 }

    const conditions: SQL[] = [eq(tool.status, 'approved'), eq(toolCategory.categoryId, cat.id)]
    if (data.pricingType && data.pricingType !== 'all') {
      conditions.push(eq(tool.pricingType, data.pricingType))
    }

    const orderBy = getToolOrderBy(data.sort, saveCountOrder)

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({ tool: tool })
        .from(tool)
        .innerJoin(toolCategory, eq(toolCategory.toolId, tool.id))
        .leftJoin(saveCountSubquery, eq(saveCountSubquery.toolId, tool.id))
        .where(and(...conditions))
        .orderBy(...orderBy)
        .limit(PUBLIC_PAGE_SIZE)
        .offset(offset),
      db
        .select({ total: count() })
        .from(tool)
        .innerJoin(toolCategory, eq(toolCategory.toolId, tool.id))
        .where(and(...conditions)),
    ])

    const tools = await enrichToolsForCards(rows.map((r) => r.tool), data.viewerUserId)

    return {
      tools,
      total,
      page,
      totalPages: Math.ceil(total / PUBLIC_PAGE_SIZE),
    }
  })

// ---------------------------------------------------------------------------
// Tool detail page
// ---------------------------------------------------------------------------

export const getToolBySlug = createServerFn()
  .inputValidator((input: { slug: string; viewerUserId?: string }) => input)
  .handler(async ({ data }) => {
    const [row] = await db
      .select()
      .from(tool)
      .where(and(eq(tool.slug, data.slug), eq(tool.status, 'approved')))
      .limit(1)
    if (!row) return null

    const [categories, tags, saveCountRow, savedRow] = await Promise.all([
      db
        .select({ id: category.id, name: category.name, slug: category.slug })
        .from(category)
        .innerJoin(toolCategory, eq(toolCategory.categoryId, category.id))
        .where(eq(toolCategory.toolId, row.id)),
      db
        .select({ id: tag.id, name: tag.name, slug: tag.slug })
        .from(tag)
        .innerJoin(toolTag, eq(toolTag.tagId, tag.id))
        .where(eq(toolTag.toolId, row.id)),
      db
        .select({ total: count() })
        .from(userToolSave)
        .where(eq(userToolSave.toolId, row.id))
        .then((rows) => rows[0]),
      data.viewerUserId
        ? db
            .select({ toolId: userToolSave.toolId })
            .from(userToolSave)
            .where(and(eq(userToolSave.userId, data.viewerUserId), eq(userToolSave.toolId, row.id)))
            .limit(1)
            .then((rows) => rows[0] ?? null)
        : Promise.resolve(null),
    ])

    return {
      ...row,
      categories,
      tags,
      saveCount: saveCountRow?.total ?? 0,
      isSaved: Boolean(savedRow),
    }
  })

export const getRelatedTools = createServerFn()
  .inputValidator(
    (input: { toolId: string; categoryIds: string[]; limit?: number; viewerUserId?: string }) => input,
  )
  .handler(async ({ data }) => {
    if (data.categoryIds.length === 0) return []
    const limit = data.limit ?? 6

    const rows = await db
      .selectDistinct({ tool: tool })
      .from(tool)
      .innerJoin(toolCategory, eq(toolCategory.toolId, tool.id))
      .where(
        and(
          eq(tool.status, 'approved'),
          or(...data.categoryIds.map((id) => eq(toolCategory.categoryId, id))),
        ),
      )
      .orderBy(desc(tool.approvedAt))
      .limit(limit + 1)

    const tools = rows
      .map((r) => r.tool)
      .filter((entry) => entry.id !== data.toolId)
      .slice(0, limit)

    return enrichToolsForCards(tools, data.viewerUserId)
  })

// ---------------------------------------------------------------------------
// Tag pages
// ---------------------------------------------------------------------------

export const getTagsWithCount = createServerFn().handler(async () => {
  const rows = await db.select().from(tag).orderBy(asc(tag.name))

  const usageCounts = await db
    .select({ tagId: toolTag.tagId, count: count() })
    .from(toolTag)
    .innerJoin(tool, and(eq(toolTag.toolId, tool.id), eq(tool.status, 'approved')))
    .groupBy(toolTag.tagId)

  const countMap = new Map(usageCounts.map((r) => [r.tagId, r.count]))
  return rows
    .map((r) => ({ ...r, toolCount: countMap.get(r.id) ?? 0 }))
    .filter((r) => r.toolCount > 0)
    .sort((a, b) => b.toolCount - a.toolCount)
})

export const getTagBySlug = createServerFn()
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const [row] = await db.select().from(tag).where(eq(tag.slug, data.slug)).limit(1)
    return row ?? null
  })

export const getToolsByTag = createServerFn()
  .inputValidator(
    (input: { slug: string; pricingType?: string; sort?: string; page?: number; viewerUserId?: string }) => input,
  )
  .handler(async ({ data }) => {
    const page = data.page ?? 1
    const offset = (page - 1) * PUBLIC_PAGE_SIZE
    const saveCountSubquery = createSaveCountSubquery()
    const saveCountOrder = sql<number>`coalesce(${saveCountSubquery.saveCount}, 0)`

    const [t] = await db
      .select({ id: tag.id })
      .from(tag)
      .where(eq(tag.slug, data.slug))
      .limit(1)
    if (!t) return { tools: [], total: 0, page, totalPages: 0 }

    const conditions: SQL[] = [eq(tool.status, 'approved'), eq(toolTag.tagId, t.id)]
    if (data.pricingType && data.pricingType !== 'all') {
      conditions.push(eq(tool.pricingType, data.pricingType))
    }

    const orderBy = getToolOrderBy(data.sort, saveCountOrder)

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({ tool: tool })
        .from(tool)
        .innerJoin(toolTag, eq(toolTag.toolId, tool.id))
        .leftJoin(saveCountSubquery, eq(saveCountSubquery.toolId, tool.id))
        .where(and(...conditions))
        .orderBy(...orderBy)
        .limit(PUBLIC_PAGE_SIZE)
        .offset(offset),
      db
        .select({ total: count() })
        .from(tool)
        .innerJoin(toolTag, eq(toolTag.toolId, tool.id))
        .where(and(...conditions)),
    ])

    const tools = await enrichToolsForCards(rows.map((r) => r.tool), data.viewerUserId)

    return {
      tools,
      total,
      page,
      totalPages: Math.ceil(total / PUBLIC_PAGE_SIZE),
    }
  })

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export const searchTools = createServerFn()
  .inputValidator(
    (input: {
      query?: string
      categorySlug?: string
      tagSlug?: string
      pricingType?: string
      sort?: string
      page?: number
      viewerUserId?: string
    }) => input,
  )
  .handler(async ({ data }) => {
    const page = data.page ?? 1
    const offset = (page - 1) * PUBLIC_PAGE_SIZE
    const saveCountSubquery = createSaveCountSubquery()
    const saveCountOrder = sql<number>`coalesce(${saveCountSubquery.saveCount}, 0)`

    const baseConditions: SQL[] = [eq(tool.status, 'approved')]

    if (data.query) {
      const q = `%${data.query}%`
      baseConditions.push(or(like(tool.name, q), like(tool.description, q)) as SQL)
    }
    if (data.pricingType && data.pricingType !== 'all') {
      baseConditions.push(eq(tool.pricingType, data.pricingType))
    }

    const orderBy = getToolOrderBy(data.sort, saveCountOrder)

    if (data.categorySlug) {
      const [cat] = await db
        .select({ id: category.id })
        .from(category)
        .where(eq(category.slug, data.categorySlug))
        .limit(1)

      const conditions: SQL[] = [...baseConditions]
      if (cat) conditions.push(eq(toolCategory.categoryId, cat.id))

      const [rows, [{ total }]] = await Promise.all([
        db
          .selectDistinct({ tool: tool })
          .from(tool)
          .innerJoin(toolCategory, eq(toolCategory.toolId, tool.id))
          .leftJoin(saveCountSubquery, eq(saveCountSubquery.toolId, tool.id))
          .where(and(...conditions))
          .orderBy(...orderBy)
          .limit(PUBLIC_PAGE_SIZE)
          .offset(offset),
        db
          .select({ total: count() })
          .from(tool)
          .innerJoin(toolCategory, eq(toolCategory.toolId, tool.id))
          .where(and(...conditions)),
      ])
      const tools = await enrichToolsForCards(rows.map((r) => r.tool), data.viewerUserId)
      return { tools, total, page, totalPages: Math.ceil(total / PUBLIC_PAGE_SIZE) }
    }

    if (data.tagSlug) {
      const [t] = await db
        .select({ id: tag.id })
        .from(tag)
        .where(eq(tag.slug, data.tagSlug))
        .limit(1)

      const conditions: SQL[] = [...baseConditions]
      if (t) conditions.push(eq(toolTag.tagId, t.id))

      const [rows, [{ total }]] = await Promise.all([
        db
          .selectDistinct({ tool: tool })
          .from(tool)
          .innerJoin(toolTag, eq(toolTag.toolId, tool.id))
          .leftJoin(saveCountSubquery, eq(saveCountSubquery.toolId, tool.id))
          .where(and(...conditions))
          .orderBy(...orderBy)
          .limit(PUBLIC_PAGE_SIZE)
          .offset(offset),
        db
          .select({ total: count() })
          .from(tool)
          .innerJoin(toolTag, eq(toolTag.toolId, tool.id))
          .where(and(...conditions))
          .limit(1),
      ])
      const tools = await enrichToolsForCards(rows.map((r) => r.tool), data.viewerUserId)
      return { tools, total, page, totalPages: Math.ceil(total / PUBLIC_PAGE_SIZE) }
    }

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({ tool })
        .from(tool)
        .leftJoin(saveCountSubquery, eq(saveCountSubquery.toolId, tool.id))
        .where(and(...baseConditions))
        .orderBy(...orderBy)
        .limit(PUBLIC_PAGE_SIZE)
        .offset(offset),
      db.select({ total: count() }).from(tool).where(and(...baseConditions)),
    ])

    const tools = await enrichToolsForCards(rows.map((row) => row.tool), data.viewerUserId)
    return { tools, total, page, totalPages: Math.ceil(total / PUBLIC_PAGE_SIZE) }
  })

// ---------------------------------------------------------------------------
// Public lists (for dropdowns)
// ---------------------------------------------------------------------------

export const getPublicCategories = createServerFn().handler(async () => {
  return db
    .select({ id: category.id, name: category.name, slug: category.slug })
    .from(category)
    .orderBy(asc(category.sortOrder), asc(category.name))
})

export const getPublicTags = createServerFn().handler(async () => {
  return db
    .select({ id: tag.id, name: tag.name, slug: tag.slug })
    .from(tag)
    .orderBy(asc(tag.name))
})

// ---------------------------------------------------------------------------
// Landing page stats
// ---------------------------------------------------------------------------

export const getDirectoryStats = createServerFn().handler(async () => {
  const [toolResult, categoryResult, tagResult] = await Promise.all([
    db.select({ total: count() }).from(tool).where(eq(tool.status, 'approved')),
    db.select({ total: count() }).from(category),
    db.select({ total: count() }).from(tag),
  ])
  return {
    toolCount: toolResult[0]?.total ?? 0,
    categoryCount: categoryResult[0]?.total ?? 0,
    tagCount: tagResult[0]?.total ?? 0,
  }
})

// ---------------------------------------------------------------------------
// Sitemap bulk queries (no pagination — only slug + updatedAt needed)
// ---------------------------------------------------------------------------

export const getAllApprovedToolsForSitemap = createServerFn().handler(async () => {
  return db
    .select({ slug: tool.slug, updatedAt: tool.updatedAt })
    .from(tool)
    .where(eq(tool.status, 'approved'))
    .orderBy(desc(tool.updatedAt))
})

export const getAllCategoriesForSitemap = createServerFn().handler(async () => {
  return db
    .select({ slug: category.slug })
    .from(category)
    .orderBy(asc(category.sortOrder), asc(category.name))
})

export const getAllTagsForSitemap = createServerFn().handler(async () => {
  return db
    .select({ slug: tag.slug })
    .from(tag)
    .orderBy(asc(tag.name))
})
