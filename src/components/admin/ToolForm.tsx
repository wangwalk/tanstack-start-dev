import { useState } from 'react'
import { cn } from '#/lib/utils'

function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface ToolFormValues {
  name: string
  slug: string
  url: string
  description?: string
  content?: string
  logoUrl?: string
  screenshotUrl?: string
  pricingType: string
  status: string
  isFeatured: boolean
  categoryIds: string[]
  tagIds: string[]
  toolId?: string
}

interface Props {
  categories: { id: string; name: string; slug: string }[]
  tags: { id: string; name: string; slug: string }[]
  saving: boolean
  defaultValues?: Partial<ToolFormValues>
  onSubmit: (values: Omit<ToolFormValues, 'toolId'>) => void
}

const inputClass =
  'w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20'

export function ToolForm({ categories, tags, saving, defaultValues, onSubmit }: Props) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [url, setUrl] = useState(defaultValues?.url ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [content, setContent] = useState(defaultValues?.content ?? '')
  const [logoUrl, setLogoUrl] = useState(defaultValues?.logoUrl ?? '')
  const [screenshotUrl, setScreenshotUrl] = useState(defaultValues?.screenshotUrl ?? '')
  const [pricingType, setPricingType] = useState(defaultValues?.pricingType ?? 'free')
  const [status, setStatus] = useState(defaultValues?.status ?? 'draft')
  const [isFeatured, setIsFeatured] = useState(defaultValues?.isFeatured ?? false)
  const [categoryIds, setCategoryIds] = useState<string[]>(defaultValues?.categoryIds ?? [])
  const [tagIds, setTagIds] = useState<string[]>(defaultValues?.tagIds ?? [])

  function handleNameChange(val: string) {
    setName(val)
    if (!defaultValues?.slug) setSlug(toSlug(val))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      url: url.trim(),
      description: description.trim() || undefined,
      content: content.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      screenshotUrl: screenshotUrl.trim() || undefined,
      pricingType,
      status,
      isFeatured,
      categoryIds,
      tagIds,
    })
  }

  function toggleId(ids: string[], setIds: (v: string[]) => void, id: string) {
    setIds(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <section className="island-shell rounded-2xl px-6 py-6 space-y-4">
        <p className="island-kicker">Basic info</p>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Name *</label>
          <input required value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} placeholder="e.g. ChatGPT" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Slug *</label>
          <input required value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} placeholder="e.g. chatgpt" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">URL *</label>
          <input required type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="Short 1-2 sentence description" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Content (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className={cn(inputClass, 'resize-y')}
            placeholder="Detailed markdown description..."
          />
        </div>
      </section>

      {/* Media */}
      <section className="island-shell rounded-2xl px-6 py-6 space-y-4">
        <p className="island-kicker">Media</p>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Logo URL</label>
          <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Screenshot URL</label>
          <input type="url" value={screenshotUrl} onChange={(e) => setScreenshotUrl(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
      </section>

      {/* Metadata */}
      <section className="island-shell rounded-2xl px-6 py-6 space-y-4">
        <p className="island-kicker">Metadata</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Pricing</label>
            <select value={pricingType} onChange={(e) => setPricingType(e.target.value)} className={inputClass}>
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
              <option value="open_source">Open Source</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--sea-ink-soft)]">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--sea-ink)]">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--line)] accent-[var(--lagoon)]"
          />
          Featured on homepage
        </label>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="island-shell rounded-2xl px-6 py-6 space-y-3">
          <p className="island-kicker">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleId(categoryIds, setCategoryIds, c.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition',
                  categoryIds.includes(c.id)
                    ? 'border-[var(--lagoon)] bg-[rgba(79,184,178,0.12)] text-[var(--lagoon-deep)]'
                    : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]/50',
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <section className="island-shell rounded-2xl px-6 py-6 space-y-3">
          <p className="island-kicker">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleId(tagIds, setTagIds, t.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition',
                  tagIds.includes(t.id)
                    ? 'border-[var(--lagoon)] bg-[rgba(79,184,178,0.12)] text-[var(--lagoon-deep)]'
                    : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]/50',
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <button
        type="submit"
        disabled={saving}
        className={cn(
          'rounded-full bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:opacity-90',
          'disabled:pointer-events-none disabled:opacity-60',
        )}
      >
        {saving ? 'Saving...' : 'Save tool'}
      </button>
    </form>
  )
}
