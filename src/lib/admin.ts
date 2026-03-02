import { eq, ilike, and, count, desc } from 'drizzle-orm'
import { db } from '#/db/index'
import { user } from '#/db/schema'
import { adminFn } from '#/lib/server-fn'

const PAGE_SIZE = 20

export const listUsers = adminFn({ method: 'GET' })
  .inputValidator(
    (input: { page: number; search?: string; status?: string }) => input,
  )
  .handler(async ({ data }) => {
    const { page, search, status } = data
    const offset = (page - 1) * PAGE_SIZE

    const conditions = []
    if (search) {
      conditions.push(ilike(user.email, `%${search}%`))
    }
    if (status && status !== 'all') {
      conditions.push(eq(user.subscriptionStatus, status))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          createdAt: user.createdAt,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionPlan: user.subscriptionPlan,
          role: user.role,
        })
        .from(user)
        .where(where)
        .orderBy(desc(user.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      db.select({ total: count() }).from(user).where(where),
    ])

    return {
      users: rows,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    }
  })

export const getUserById = adminFn({ method: 'GET' })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const [row] = await db
      .select()
      .from(user)
      .where(eq(user.id, data.userId))
      .limit(1)

    if (!row) throw new Error('User not found')
    return row
  })

export const updateUserRole = adminFn({ method: 'POST' })
  .inputValidator((input: { userId: string; role: 'user' | 'admin' }) => input)
  .handler(async ({ data }) => {
    await db
      .update(user)
      .set({ role: data.role, updatedAt: new Date() })
      .where(eq(user.id, data.userId))

    return { success: true }
  })
