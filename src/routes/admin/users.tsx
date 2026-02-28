import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { listUsers } from '#/lib/admin'
import { cn } from '#/lib/utils'

const searchSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  search: z.string().optional(),
  status: z.string().optional(),
})

export const Route = createFileRoute('/admin/users')({
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    const userList = await listUsers({
      data: {
        page: search.page,
        search: search.search,
        status: search.status,
      },
    })
    return { userList }
  },
  component: AdminUsersPage,
})

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  canceled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  past_due: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  trialing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

function AdminUsersPage() {
  const { userList } = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = useNavigate()

  const { users, total, page, totalPages } = userList

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
          Users
          <span className="ml-2 text-base font-normal text-[var(--sea-ink-soft)]">
            ({total})
          </span>
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search by email..."
          defaultValue={search.search ?? ''}
          onChange={(e) => {
            void navigate({
              search: { ...search, search: e.target.value || undefined, page: 1 },
            })
          }}
          className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 sm:w-72"
        />
        <select
          value={search.status ?? 'all'}
          onChange={(e) => {
            void navigate({
              search: {
                ...search,
                status: e.target.value === 'all' ? undefined : e.target.value,
                page: 1,
              },
            })
          }}
          className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="canceled">Canceled</option>
          <option value="past_due">Past due</option>
          <option value="trialing">Trialing</option>
        </select>
      </div>

      {/* Table */}
      <div className="island-shell overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wider text-[var(--sea-ink-soft)]">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-[var(--sea-ink-soft)]"
                  >
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[var(--line)] last:border-0 transition hover:bg-[var(--link-bg-hover)]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--sea-ink)]">{u.name}</p>
                    <p className="text-xs text-[var(--sea-ink-soft)]">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                        statusColors[u.subscriptionStatus ?? ''] ??
                          'bg-[var(--line)] text-[var(--sea-ink-soft)]',
                      )}
                    >
                      {u.subscriptionStatus ?? 'free'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                        u.role === 'admin'
                          ? 'bg-[rgba(79,184,178,0.15)] text-[var(--lagoon-deep)]'
                          : 'bg-[var(--line)] text-[var(--sea-ink-soft)]',
                      )}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/users/$userId"
                      params={{ userId: u.id }}
                      className="text-xs font-medium text-[var(--lagoon)] hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--sea-ink-soft)]">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                void navigate({ search: { ...search, page: page - 1 } })
              }}
              className="rounded-lg border border-[var(--line)] px-3 py-1.5 transition hover:bg-[var(--link-bg-hover)] disabled:opacity-40 disabled:pointer-events-none"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                void navigate({ search: { ...search, page: page + 1 } })
              }}
              className="rounded-lg border border-[var(--line)] px-3 py-1.5 transition hover:bg-[var(--link-bg-hover)] disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
