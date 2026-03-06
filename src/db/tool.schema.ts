import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const tool = sqliteTable('tool', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  url: text('url').notNull(),
  description: text('description'),
  content: text('content'),
  logoUrl: text('logo_url'),
  screenshotUrl: text('screenshot_url'),
  pricingType: text('pricing_type').notNull().default('free'), // free | freemium | paid | open_source
  status: text('status').notNull().default('draft'), // draft | pending | approved | rejected | archived
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  submittedBy: text('submitted_by'),
  approvedBy: text('approved_by'),
  approvedAt: integer('approved_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const category = sqliteTable('category', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  icon: text('icon'),
  parentId: text('parent_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export const tag = sqliteTable('tag', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export const toolCategory = sqliteTable(
  'tool_category',
  {
    toolId: text('tool_id').notNull(),
    categoryId: text('category_id').notNull(),
  },
  (t) => [primaryKey({ columns: [t.toolId, t.categoryId] })],
)

export const toolTag = sqliteTable(
  'tool_tag',
  {
    toolId: text('tool_id').notNull(),
    tagId: text('tag_id').notNull(),
  },
  (t) => [primaryKey({ columns: [t.toolId, t.tagId] })],
)
