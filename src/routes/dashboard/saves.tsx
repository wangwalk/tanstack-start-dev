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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Saves</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total > 0 ? `${total} saved tool${total === 1 ? '' : 's'}` : 'Keep a short list of tools worth returning to.'}
          </p>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="border border-border bg-card shadow-sm rounded-2xl px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-foreground">No saved tools yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
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
