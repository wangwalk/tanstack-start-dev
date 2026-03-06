import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '#/lib/categories'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/admin/categories/')({
  loader: () => getCategories({}),
  component: AdminCategoriesPage,
})

function toSlug(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

type CategoryRow = Awaited<ReturnType<typeof getCategories>>[number]

interface FormState {
  name: string
  slug: string
  description: string
  icon: string
  parentId: string
  sortOrder: string
}

const emptyForm: FormState = { name: '', slug: '', description: '', icon: '', parentId: '', sortOrder: '0' }

const inputClass =
  'w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20'

function CategoryDialog({
  title,
  form,
  setForm,
  allCategories,
  excludeId,
  saving,
  onSave,
  onClose,
}: {
  title: string
  form: FormState
  setForm: (f: FormState) => void
  allCategories: CategoryRow[]
  excludeId?: string
  saving: boolean
  onSave: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--sea-ink)]/30 backdrop-blur-sm p-4">
      <div className="island-shell w-full max-w-md rounded-2xl px-6 py-6 space-y-4">
        <h2 className="font-semibold text-[var(--sea-ink)]">{title}</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: toSlug(e.target.value) })}
              className={inputClass}
              placeholder="e.g. AI Writing"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Slug *</label>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Icon (emoji)</label>
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className={inputClass}
                placeholder="✍️"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Sort order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Parent category</label>
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className={inputClass}
            >
              <option value="">None (top-level)</option>
              {allCategories
                .filter((c) => c.id !== excludeId && !c.parentId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ''}{c.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !form.name.trim() || !form.slug.trim()}
            onClick={onSave}
            className={cn(
              'rounded-full bg-[var(--lagoon)] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:opacity-90',
              'disabled:pointer-events-none disabled:opacity-60',
            )}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminCategoriesPage() {
  const categories = Route.useLoaderData()
  const router = useRouter()

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<CategoryRow | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const topLevel = categories.filter((c) => !c.parentId)
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id)

  function openCreate() {
    setForm(emptyForm)
    setShowCreate(true)
  }

  function openEdit(cat: CategoryRow) {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      icon: cat.icon ?? '',
      parentId: cat.parentId ?? '',
      sortOrder: String(cat.sortOrder),
    })
    setEditTarget(cat)
  }

  async function handleCreate() {
    setSaving(true)
    setError(null)
    try {
      await createCategory({
        data: {
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
          icon: form.icon.trim() || undefined,
          parentId: form.parentId || undefined,
          sortOrder: Number(form.sortOrder),
        },
      })
      setShowCreate(false)
      await router.invalidate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate() {
    if (!editTarget) return
    setSaving(true)
    setError(null)
    try {
      await updateCategory({
        data: {
          categoryId: editTarget.id,
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
          icon: form.icon.trim() || undefined,
          parentId: form.parentId || undefined,
          sortOrder: Number(form.sortOrder),
        },
      })
      setEditTarget(null)
      await router.invalidate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Child categories will be unparented.')) return
    setError(null)
    try {
      await deleteCategory({ data: { categoryId: id } })
      await router.invalidate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete category')
    }
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function CategoryRow({ cat, depth = 0 }: { cat: CategoryRow; depth?: number }) {
    const children = childrenOf(cat.id)
    const expanded = expandedIds.has(cat.id)

    return (
      <>
        <tr className="border-b border-[var(--line)] last:border-0 transition hover:bg-[var(--link-bg-hover)]">
          <td className="px-4 py-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
              {children.length > 0 && (
                <button type="button" onClick={() => toggleExpand(cat.id)} className="text-[var(--sea-ink-soft)]">
                  <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')} />
                </button>
              )}
              {children.length === 0 && <span className="w-3.5" />}
              <span>{cat.icon && `${cat.icon} `}{cat.name}</span>
            </div>
          </td>
          <td className="px-4 py-3 text-xs text-[var(--sea-ink-soft)]">{cat.slug}</td>
          <td className="px-4 py-3 text-[var(--sea-ink-soft)]">{cat.sortOrder}</td>
          <td className="px-4 py-3 text-[var(--sea-ink-soft)]">{cat.toolCount}</td>
          <td className="px-4 py-3 text-right">
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => openEdit(cat)} className="text-[var(--sea-ink-soft)] hover:text-[var(--lagoon)]">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => void handleDelete(cat.id)} className="text-[var(--sea-ink-soft)] hover:text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </td>
        </tr>
        {expanded && children.map((child) => <CategoryRow key={child.id} cat={child} depth={depth + 1} />)}
      </>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
          Categories
          <span className="ml-2 text-base font-normal text-[var(--sea-ink-soft)]">({categories.length})</span>
        </h1>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--lagoon)] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add category
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20">{error}</p>}

      <div className="island-shell overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wider text-[var(--sea-ink-soft)]">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Tools</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--sea-ink-soft)]">
                    No categories yet.
                  </td>
                </tr>
              )}
              {topLevel.map((cat) => (
                <CategoryRow key={cat.id} cat={cat} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <CategoryDialog
          title="Add category"
          form={form}
          setForm={setForm}
          allCategories={categories}
          saving={saving}
          onSave={() => void handleCreate()}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <CategoryDialog
          title="Edit category"
          form={form}
          setForm={setForm}
          allCategories={categories}
          excludeId={editTarget.id}
          saving={saving}
          onSave={() => void handleUpdate()}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
