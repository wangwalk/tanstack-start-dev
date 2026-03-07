import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { toast } from 'sonner'
import { getMySubmissions, withdrawSubmission } from '#/lib/submissions'
import { cn } from '#/lib/utils'
import { SITE_TITLE } from '#/lib/site'

const searchSchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
})

export const Route = createFileRoute('/dashboard/submissions/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  head: () => ({
    meta: [{ title: `我的提交 | ${SITE_TITLE}` }],
  }),
  loader: async ({ deps }) => {
    return getMySubmissions({ data: { status: deps.status, page: deps.page } })
  },
  component: DashboardSubmissionsPage,
})

const statusColors: Record<string, string> = {
  draft: 'bg-[var(--line)] text-[var(--sea-ink-soft)]',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  archived: 'bg-[var(--line)] text-[var(--sea-ink-soft)]',
}

const statusLabel: Record<string, string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  archived: '已归档',
}

const STATUS_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
]

function DashboardSubmissionsPage() {
  const { tools, page } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const [withdrawing, setWithdrawing] = useState<string | null>(null)

  async function handleWithdraw(toolId: string) {
    setWithdrawing(toolId)
    try {
      await withdrawSubmission({ data: { toolId } })
      toast.success('已撤回提交')
      void router.invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '撤回失败，请重试')
    } finally {
      setWithdrawing(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">我的提交</h1>
        <Link
          to="/tools/submit"
          className="btn-brand"
        >
          + 提交新工具
        </Link>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() =>
              void navigate({
                search: { ...search, status: f.value === 'all' ? undefined : f.value, page: 1 },
              })
            }
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              (search.status ?? 'all') === f.value
                ? 'border-[var(--lagoon)] bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]'
                : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="island-shell overflow-hidden rounded-2xl">
        {tools.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[var(--sea-ink-soft)]">暂无提交记录</p>
            <Link
              to="/tools/submit"
              className="btn-brand mt-4 inline-block no-underline"
            >
              提交第一个工具
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {tools.map((t) => (
              <div key={t.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--sea-ink)]">{t.name}</p>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        statusColors[t.status] ?? statusColors.draft,
                      )}
                    >
                      {statusLabel[t.status] ?? t.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-[var(--sea-ink-soft)]">{t.url}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-[var(--sea-ink-soft)]">
                    <span>提交于 {new Date(t.createdAt).toLocaleDateString('zh-CN')}</span>
                    {t.approvedAt && (
                      <span>审核于 {new Date(t.approvedAt).toLocaleDateString('zh-CN')}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {t.status === 'approved' && (
                    <Link
                      to="/tools/$slug"
                      params={{ slug: t.slug }}
                      className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--sea-ink-soft)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
                    >
                      查看详情
                    </Link>
                  )}
                  {t.status === 'pending' && (
                    <button
                      type="button"
                      disabled={withdrawing === t.id}
                      onClick={() => void handleWithdraw(t.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      {withdrawing === t.id ? '撤回中...' : '撤回'}
                    </button>
                  )}
                  {(t.status === 'rejected' || t.status === 'draft') && (
                    <Link
                      to="/tools/submit"
                      className="rounded-lg border border-[var(--lagoon)] px-3 py-1.5 text-xs font-medium text-[var(--lagoon-deep)] no-underline transition hover:bg-[var(--lagoon)]/10"
                    >
                      重新提交
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[var(--sea-ink-soft)]">
        <span>第 {page} 页</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => void navigate({ search: { ...search, page: page - 1 } })}
            className="rounded-lg border border-[var(--line)] px-3 py-1.5 transition hover:bg-[var(--link-bg-hover)] disabled:pointer-events-none disabled:opacity-40"
          >
            上一页
          </button>
          <button
            type="button"
            disabled={tools.length < 20}
            onClick={() => void navigate({ search: { ...search, page: page + 1 } })}
            className="rounded-lg border border-[var(--line)] px-3 py-1.5 transition hover:bg-[var(--link-bg-hover)] disabled:pointer-events-none disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  )
}
