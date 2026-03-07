import { useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { getPublicCategories, getPublicTags } from '#/lib/public'
import { submitTool } from '#/lib/submissions'
import { SITE_TITLE } from '#/lib/site'

export const Route = createFileRoute('/tools/submit')({
  head: () => ({
    meta: [
      { title: `提交工具 | ${SITE_TITLE}` },
      { name: 'description', content: '向 AI 工具目录提交新工具，审核通过后即可上线。' },
    ],
  }),
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: '/auth/sign-in', search: { redirect: '/tools/submit' } })
    }
  },
  loader: async () => {
    const [categories, tags] = await Promise.all([getPublicCategories(), getPublicTags()])
    return { categories, tags }
  },
  component: SubmitToolPage,
})

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function SubmitToolPage() {
  const { categories, tags } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const [form, setForm] = useState({
    name: '',
    slug: '',
    url: '',
    description: '',
    pricingType: 'free',
    categoryIds: [] as string[],
    tagIds: [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setForm((f) => ({ ...f, name, slug: slugify(name) }))
  }

  function toggleCategory(id: string) {
    setForm((f) => {
      const next = f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : f.categoryIds.length < 3
          ? [...f.categoryIds, id]
          : f.categoryIds
      return { ...f, categoryIds: next }
    })
  }

  function toggleTag(id: string) {
    setForm((f) => {
      const next = f.tagIds.includes(id)
        ? f.tagIds.filter((t) => t !== id)
        : f.tagIds.length < 5
          ? [...f.tagIds, id]
          : f.tagIds
      return { ...f, tagIds: next }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) return setError('请填写工具名称')
    if (!form.url.trim()) return setError('请填写官网 URL')
    if (form.categoryIds.length === 0) return setError('请至少选择一个分类')

    setIsSubmitting(true)
    try {
      await submitTool({
        data: {
          name: form.name.trim(),
          slug: form.slug || slugify(form.name),
          url: form.url.trim(),
          description: form.description.trim() || undefined,
          pricingType: form.pricingType,
          categoryIds: form.categoryIds,
          tagIds: form.tagIds,
        },
      })
      void navigate({ to: '/tools/submit/success' })
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
        <Link to="/tools" className="hover:text-[var(--lagoon)]">首页</Link>
        <span>/</span>
        <span className="text-[var(--sea-ink)]">提交工具</span>
      </nav>

      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="island-kicker mb-1">提交工具</p>
          <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">提交新工具</h1>
          <p className="mt-2 text-[var(--sea-ink-soft)]">
            填写工具信息后提交，管理员审核通过后即可在目录中展示。
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
              工具名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={handleNameChange}
              placeholder="例如：ChatGPT"
              maxLength={100}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20"
            />
          </div>

          {/* URL */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
              官网 URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
              简短描述{' '}
              <span className="text-xs font-normal text-[var(--sea-ink-soft)]">（最多 200 字）</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value.slice(0, 200) }))}
              rows={3}
              placeholder="一两句话介绍这个工具的核心功能..."
              className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20"
            />
            <p className="mt-1 text-right text-xs text-[var(--sea-ink-soft)]">
              {form.description.length}/200
            </p>
          </div>

          {/* Pricing type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
              定价类型 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'free', label: '免费' },
                { value: 'freemium', label: '免费增值' },
                { value: 'paid', label: '付费' },
                { value: 'open_source', label: '开源' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, pricingType: opt.value }))}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    form.pricingType === opt.value
                      ? 'border-[var(--lagoon)] bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]'
                      : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
              分类 <span className="text-red-500">*</span>{' '}
              <span className="text-xs font-normal text-[var(--sea-ink-soft)]">（最多 3 个）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    form.categoryIds.includes(cat.id)
                      ? 'border-[var(--lagoon)] bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]'
                      : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
                标签{' '}
                <span className="text-xs font-normal text-[var(--sea-ink-soft)]">（可选，最多 5 个）</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      form.tagIds.includes(t.id)
                        ? 'border-[var(--lagoon)] bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]'
                        : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]'
                    }`}
                  >
                    #{t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[var(--lagoon)] px-8 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)] disabled:pointer-events-none disabled:opacity-60"
            >
              {isSubmitting ? '提交中...' : '提交工具'}
            </button>
            <Link to="/tools" className="text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]">
              取消
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
