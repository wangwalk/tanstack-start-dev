import { useState } from 'react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'

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
  'w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus-visible:ring-ring'

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
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleNameChange(val: string) {
    setName(val)
    if (!defaultValues?.slug) setSlug(toSlug(val))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError(null)
    if (!name.trim()) return setValidationError('Name is required')
    if (!slug.trim()) return setValidationError('Slug is required')
    if (!url.trim()) return setValidationError('URL is required')
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
      {validationError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400" role="alert">
          {validationError}
        </div>
      )}
      {/* Basic info */}
      <section className="border border-border bg-card shadow-sm rounded-2xl px-6 py-6 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Basic info</p>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Name *</label>
          <input required value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} placeholder="e.g. ChatGPT" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Slug *</label>
          <input required value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} placeholder="e.g. chatgpt" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">URL *</label>
          <input required type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="Short 1-2 sentence description" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Content (Markdown)</label>
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
      <section className="border border-border bg-card shadow-sm rounded-2xl px-6 py-6 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Media</p>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Logo URL</label>
          <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Screenshot URL</label>
          <input type="url" value={screenshotUrl} onChange={(e) => setScreenshotUrl(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
      </section>

      {/* Metadata */}
      <section className="border border-border bg-card shadow-sm rounded-2xl px-6 py-6 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Metadata</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Pricing</label>
            <select value={pricingType} onChange={(e) => setPricingType(e.target.value)} className={inputClass}>
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
              <option value="open_source">Open Source</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Featured on homepage
        </label>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border border-border bg-card shadow-sm rounded-2xl px-6 py-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleId(categoryIds, setCategoryIds, c.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition',
                  categoryIds.includes(c.id)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50',
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
        <section className="border border-border bg-card shadow-sm rounded-2xl px-6 py-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleId(tagIds, setTagIds, t.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition',
                  tagIds.includes(t.id)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50',
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save tool'}
      </Button>
    </form>
  )
}
