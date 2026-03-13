import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { toast } from 'sonner'
import { getPendingTools, approveTool, rejectTool, approveToolsBatch, rejectToolsBatch } from '#/lib/review'
import { cn } from '#/lib/utils'

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
})

export const Route = createFileRoute('/admin/review/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    return getPendingTools({ data: { page: deps.page } })
  },
  component: AdminReviewPage,
})

function AdminReviewPage() {
  const { tools, total, page, totalPages } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === tools.length ? new Set() : new Set(tools.map((t) => t.id)),
    )
  }

  async function handleApprove(toolId: string) {
    setLoading(toolId)
    try {
      await approveTool({ data: { toolId } })
      toast.success('工具已通过审核')
      void router.invalidate()
    } catch {
      toast.error('操作失败，请重试')
    } finally {
      setLoading(null)
    }
  }

  async function handleReject(toolId: string) {
    setLoading(toolId)
    try {
      await rejectTool({ data: { toolId } })
      toast.success('工具已拒绝')
      void router.invalidate()
    } catch {
      toast.error('操作失败，请重试')
    } finally {
      setLoading(null)
    }
  }

  async function handleBatchApprove() {
    if (selected.size === 0) return
    setLoading('batch')
    try {
      await approveToolsBatch({ data: { toolIds: Array.from(selected) } })
      toast.success(`${selected.size} 个工具已批量通过`)
      setSelected(new Set())
      void router.invalidate()
    } catch {
      toast.error('批量操作失败，请重试')
    } finally {
      setLoading(null)
    }
  }

  async function handleBatchReject() {
    if (selected.size === 0) return
    setLoading('batch')
    try {
      await rejectToolsBatch({ data: { toolIds: Array.from(selected) } })
      toast.success(`${selected.size} 个工具已批量拒绝`)
      setSelected(new Set())
      void router.invalidate()
    } catch {
      toast.error('批量操作失败，请重试')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          审核队列
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({total} 待审核)
          </span>
        </h1>
      </div>

      {/* Batch actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">已选 {selected.size} 个</span>
          <button
            type="button"
            disabled={loading === 'batch'}
            onClick={() => void handleBatchApprove()}
            className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            批量通过
          </button>
          <button
            type="button"
            disabled={loading === 'batch'}
            onClick={() => void handleBatchReject()}
            className="rounded-lg bg-red-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            批量拒绝
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            取消选择
          </button>
        </div>
      )}

      {/* Table */}
      <div className="border border-border bg-card shadow-sm overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">
                  <input
                    type="checkbox"
                    checked={selected.size === tools.length && tools.length > 0}
                    onChange={toggleAll}
                    className="cursor-pointer rounded border-border"
                  />
                </th>
                <th className="px-4 py-3 font-medium">工具</th>
                <th className="px-4 py-3 font-medium">定价</th>
                <th className="px-4 py-3 font-medium">提交时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {tools.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    暂无待审核工具 🎉
                  </td>
                </tr>
              )}
              {tools.map((t) => (
                <tr
                  key={t.id}
                  className={cn(
                    'border-b border-border last:border-0 transition hover:bg-accent',
                    selected.has(t.id) && 'bg-primary/5',
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(t.id)}
                      onChange={() => toggleSelect(t.id)}
                      className="cursor-pointer rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{t.name}</p>
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      {t.url}
                    </a>
                    {t.description && (
                      <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                        {t.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.pricingType}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to="/tools/$slug"
                        params={{ slug: t.slug }}
                        target="_blank"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        预览
                      </Link>
                      <Link
                        to="/admin/tools/$toolId"
                        params={{ toolId: t.id }}
                        className="text-xs text-primary hover:underline"
                      >
                        编辑
                      </Link>
                      <button
                        type="button"
                        disabled={loading === t.id}
                        onClick={() => void handleApprove(t.id)}
                        className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                      >
                        通过
                      </button>
                      <button
                        type="button"
                        disabled={loading === t.id}
                        onClick={() => void handleReject(t.id)}
                        className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                      >
                        拒绝
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>第 {page} / {totalPages} 页</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => void navigate({ search: { ...search, page: page - 1 } })}
              className="rounded-lg border border-border px-3 py-1.5 transition hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
            >
              上一页
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => void navigate({ search: { ...search, page: page + 1 } })}
              className="rounded-lg border border-border px-3 py-1.5 transition hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
