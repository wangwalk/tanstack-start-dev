import { useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { getPublicCategories, getPublicTags } from '#/lib/public'
import { submitTool } from '#/lib/submissions'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
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
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/tools" className="hover:text-primary">首页</Link>
        <span>/</span>
        <span className="text-foreground">提交工具</span>
      </nav>

      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">提交工具</p>
          <h1 className="text-3xl font-bold text-foreground">提交新工具</h1>
          <p className="mt-2 text-muted-foreground">
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
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              工具名称 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={form.name}
              onChange={handleNameChange}
              placeholder="例如：ChatGPT"
              maxLength={100}
            />
          </div>

          {/* URL */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              官网 URL <span className="text-red-500">*</span>
            </label>
            <Input
              type="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              简短描述{' '}
              <span className="text-xs font-normal text-muted-foreground">（最多 200 字）</span>
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value.slice(0, 200) }))}
              rows={3}
              placeholder="一两句话介绍这个工具的核心功能..."
              className="resize-none"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {form.description.length}/200
            </p>
          </div>

          {/* Pricing type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
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
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              分类 <span className="text-red-500">*</span>{' '}
              <span className="text-xs font-normal text-muted-foreground">（最多 3 个）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    form.categoryIds.includes(cat.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary'
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
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                标签{' '}
                <span className="text-xs font-normal text-muted-foreground">（可选，最多 5 个）</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      form.tagIds.includes(t.id)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary'
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
            <Button type="submit" disabled={isSubmitting} className="px-8 py-3">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  提交中…
                </span>
              ) : '提交工具'}
            </Button>
            <Link to="/tools" className="text-sm text-muted-foreground hover:text-foreground">
              取消
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
