import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getAllCategories, getAllTags, getTool, updateTool, deleteTool } from '#/lib/tools'
import { ToolForm } from '#/components/admin/ToolForm'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/admin/tools/$toolId')({
  loader: async ({ params }) => {
    const [tool, categories, tags] = await Promise.all([
      getTool({ data: { toolId: params.toolId } }),
      getAllCategories({}),
      getAllTags({}),
    ])
    return { tool, categories, tags }
  },
  component: EditToolPage,
})

function EditToolPage() {
  const { tool, categories, tags } = Route.useLoaderData()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSubmit(values: Parameters<typeof updateTool>[0]['data']) {
    setSaving(true)
    setError(null)
    try {
      await updateTool({ data: { ...values, toolId: tool.id } })
      await router.invalidate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save tool')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await deleteTool({ data: { toolId: tool.id } })
      await router.navigate({ to: '/admin/tools' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete tool')
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/admin/tools"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)] transition hover:text-[var(--sea-ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tools
      </Link>
      <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">{tool.name}</h1>
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20">{error}</p>}

      <ToolForm
        categories={categories}
        tags={tags}
        saving={saving}
        defaultValues={tool}
        onSubmit={(values) => handleSubmit({ ...values, toolId: tool.id })}
      />

      {/* Danger zone */}
      <section className="island-shell rounded-2xl px-6 py-6">
        <p className="island-kicker mb-4">Danger zone</p>
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-[var(--sea-ink-soft)]">Are you sure?</p>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void handleDelete()}
              className={cn(
                'rounded-full border border-red-400/30 bg-red-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:opacity-90',
                'disabled:pointer-events-none disabled:opacity-60',
              )}
            >
              {deleting ? 'Deleting...' : 'Yes, delete'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-full border border-red-400/30 px-4 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete tool
          </button>
        )}
      </section>
    </div>
  )
}
