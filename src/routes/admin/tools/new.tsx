import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getAllCategories, getAllTags, createTool } from '#/lib/tools'
import { ToolForm } from '#/components/admin/ToolForm'

export const Route = createFileRoute('/admin/tools/new')({
  loader: async () => {
    const [categories, tags] = await Promise.all([getAllCategories({}), getAllTags({})])
    return { categories, tags }
  },
  component: NewToolPage,
})

function NewToolPage() {
  const { categories, tags } = Route.useLoaderData()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(values: Parameters<typeof createTool>[0]['data']) {
    setSaving(true)
    setError(null)
    try {
      await createTool({ data: values })
      await router.navigate({ to: '/admin/tools' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create tool')
    } finally {
      setSaving(false)
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
      <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">Add tool</h1>
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20">{error}</p>}
      <ToolForm categories={categories} tags={tags} saving={saving} onSubmit={handleSubmit} />
    </div>
  )
}
