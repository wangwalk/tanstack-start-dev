import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ToolCard } from '#/components/tools/ToolCard'
import { Pagination } from '#/components/tools/Pagination'
import { SITE_TITLE } from '#/lib/site'
import { getSavedTools } from '#/lib/tool-saves'

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
})

export const Route = createFileRoute('/dashboard/saves')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  head: () => ({
    meta: [{ title: `My Saves | ${SITE_TITLE}` }],
  }),
  loader: async ({ deps }) => {
    return getSavedTools({ data: { page: deps.page } })
  },
  component: DashboardSavedToolsPage,
})

function DashboardSavedToolsPage() {
  const { tools, total, page, totalPages } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="island-kicker mb-2">Saved Tools</p>
        <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">My Saves</h1>
        <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
          Keep a short list of tools worth returning to, without rebuilding the directory every time.
        </p>
      </div>

      <p className="text-sm text-[var(--sea-ink-soft)]">{total} saved tools</p>

      {tools.length === 0 ? (
        <div className="island-shell rounded-[2rem] px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">No saved tools yet</h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Use the bookmark button on any tool card or detail page to build your shortlist.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(nextPage) => void navigate({ search: { ...search, page: nextPage } })}
      />
    </div>
  )
}
