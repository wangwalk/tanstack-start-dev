import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { getTools } from '#/lib/tools'
import { cn } from '#/lib/utils'

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  search: z.string().optional(),
  status: z.string().optional(),
})

export const Route = createFileRoute('/admin/tools/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    return getTools({ data: { page: deps.page, search: deps.search, status: deps.status } })
  },
  component: AdminToolsPage,
})

const statusColors: Record<string, string> = {
  draft: 'bg-[var(--line)] text-[var(--sea-ink-soft)]',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  archived: 'bg-[var(--line)] text-[var(--sea-ink-soft)]',
}

function AdminToolsPage() {
  const { tools, total, page, totalPages } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
          Tools
          <span className="ml-2 text-base font-normal text-[var(--sea-ink-soft)]">
            ({total})
          </span>
        </h1>
        <Link
          to="/admin/tools/new"
          className="btn-brand"
        >
          Add tool
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search by name..."
          defaultValue={search.search ?? ''}
          onChange={(e) => {
            void navigate({ search: { ...search, search: e.target.value || undefined, page: 1 } })
          }}
          className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 sm:w-72"
        />
        <select
          value={search.status ?? 'all'}
          onChange={(e) => {
            void navigate({
              search: { ...search, status: e.target.value === 'all' ? undefined : e.target.value, page: 1 },
            })
          }}
          className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="island-shell overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wider text-[var(--sea-ink-soft)]">
                <th className="px-4 py-3 font-medium">Tool</th>
                <th className="px-4 py-3 font-medium">Pricing</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {tools.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--sea-ink-soft)]">
                    No tools found.
                  </td>
                </tr>
              )}
              {tools.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-[var(--line)] last:border-0 transition hover:bg-[var(--link-bg-hover)]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--sea-ink)]">{t.name}</p>
                    <p className="text-xs text-[var(--sea-ink-soft)]">{t.url}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--sea-ink-soft)]">{t.pricingType}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', statusColors[t.status] ?? statusColors.draft)}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                    {t.isFeatured ? '★' : '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/tools/$toolId"
                      params={{ toolId: t.id }}
                      className="text-xs font-medium text-[var(--lagoon)] hover:underline"
                    >
                      Edit
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
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => void navigate({ search: { ...search, page: page - 1 } })}
              className="rounded-lg border border-[var(--line)] px-3 py-1.5 transition hover:bg-[var(--link-bg-hover)] disabled:pointer-events-none disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => void navigate({ search: { ...search, page: page + 1 } })}
              className="rounded-lg border border-[var(--line)] px-3 py-1.5 transition hover:bg-[var(--link-bg-hover)] disabled:pointer-events-none disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
