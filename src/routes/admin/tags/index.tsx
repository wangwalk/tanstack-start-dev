import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { getTags, createTag, updateTag, deleteTag, mergeTags } from '#/lib/tags'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/admin/tags/')({
  loader: () => getTags({}),
  component: AdminTagsPage,
})

function toSlug(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

type TagRow = Awaited<ReturnType<typeof getTags>>[number]

const inputClass =
  'w-full rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus-visible:ring-ring'

function AdminTagsPage() {
  const tags = Route.useLoaderData()
  const router = useRouter()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')

  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')

  const [mergeSourceId, setMergeSourceId] = useState('')
  const [mergeTargetId, setMergeTargetId] = useState('')
  const [showMerge, setShowMerge] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openEdit(tag: TagRow) {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditSlug(tag.slug)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setSaving(true)
    setError(null)
    try {
      await createTag({ data: { name: newName.trim(), slug: newSlug.trim() || toSlug(newName) } })
      setNewName('')
      setNewSlug('')
      await router.invalidate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create tag')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(tagId: string) {
    setSaving(true)
    setError(null)
    try {
      await updateTag({ data: { tagId, name: editName.trim(), slug: editSlug.trim() } })
      setEditingId(null)
      await router.invalidate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update tag')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(tagId: string) {
    if (!confirm('Delete this tag?')) return
    setError(null)
    try {
      await deleteTag({ data: { tagId } })
      await router.invalidate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete tag')
    }
  }

  async function handleMerge() {
    if (!mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId) return
    if (!confirm('Merge tags? The source tag will be deleted.')) return
    setSaving(true)
    setError(null)
    try {
      await mergeTags({ data: { sourceTagId: mergeSourceId, targetTagId: mergeTargetId } })
      setShowMerge(false)
      setMergeSourceId('')
      setMergeTargetId('')
      await router.invalidate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to merge tags')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          Tags
          <span className="ml-2 text-base font-normal text-muted-foreground">({tags.length})</span>
        </h1>
        <button
          type="button"
          onClick={() => setShowMerge(!showMerge)}
          className="text-sm text-primary hover:underline"
        >
          Merge tags
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20">{error}</p>}

      {/* Merge panel */}
      {showMerge && (
        <div className="border border-border bg-card shadow-sm rounded-2xl px-6 py-5 space-y-3">
          <p className="text-sm font-medium text-foreground">Merge tags</p>
          <p className="text-xs text-muted-foreground">All tools from the source tag will be reassigned to the target tag. The source tag will be deleted.</p>
          <div className="flex gap-3">
            <select value={mergeSourceId} onChange={(e) => setMergeSourceId(e.target.value)} className={cn(inputClass, 'flex-1')}>
              <option value="">Source tag...</option>
              {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <span className="self-center text-muted-foreground">→</span>
            <select value={mergeTargetId} onChange={(e) => setMergeTargetId(e.target.value)} className={cn(inputClass, 'flex-1')}>
              <option value="">Target tag...</option>
              {tags.filter((t) => t.id !== mergeSourceId).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button
              type="button"
              disabled={saving || !mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId}
              onClick={() => void handleMerge()}
              className={cn(
                'rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90',
                'disabled:pointer-events-none disabled:opacity-60',
              )}
            >
              Merge
            </button>
          </div>
        </div>
      )}

      {/* Add new tag */}
      <div className="border border-border bg-card shadow-sm rounded-2xl px-6 py-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Add tag</p>
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setNewSlug(toSlug(e.target.value)) }}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleCreate() }}
            className={cn(inputClass, 'flex-1')}
            aria-label="Tag name"
            placeholder="Tag name"
          />
          <input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            className={cn(inputClass, 'w-40')}
            aria-label="Slug"
            placeholder="slug"
          />
          <button
            type="button"
            disabled={saving || !newName.trim()}
            onClick={() => void handleCreate()}
            className={cn(
              'inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90',
              'disabled:pointer-events-none disabled:opacity-60',
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Tag list */}
      <div className="border border-border bg-card shadow-sm overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Tools</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {tags.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No tags yet.</td>
              </tr>
            )}
            {tags.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-accent">
                <td className="px-4 py-2">
                  {editingId === t.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={inputClass}
                      autoFocus
                    />
                  ) : (
                    <span className="text-foreground">{t.name}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === t.id ? (
                    <input
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">{t.slug}</span>
                  )}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{t.toolCount}</td>
                <td className="px-4 py-2 text-right">
                  {editingId === t.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void handleUpdate(t.id)}
                        className="text-xs font-medium text-primary hover:underline disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button type="button" onClick={cancelEdit} className="text-xs text-muted-foreground hover:text-foreground">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openEdit(t)} aria-label="Edit" className="text-muted-foreground hover:text-primary">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => void handleDelete(t.id)} aria-label="Delete" className="text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
