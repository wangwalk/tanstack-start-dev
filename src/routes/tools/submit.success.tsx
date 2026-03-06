import { createFileRoute, Link } from '@tanstack/react-router'
import { SITE_TITLE } from '#/lib/site'

export const Route = createFileRoute('/tools/submit/success')({
  head: () => ({
    meta: [{ title: `提交成功 | ${SITE_TITLE}` }],
  }),
  component: SubmitSuccessPage,
})

function SubmitSuccessPage() {
  return (
    <main className="page-wrap flex min-h-[60vh] items-center justify-center px-4">
      <div className="island-shell max-w-md rounded-[2rem] px-8 py-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl dark:bg-emerald-900/30">
          ✓
        </div>
        <h1 className="display-title mb-3 text-2xl font-bold text-[var(--sea-ink)]">提交成功！</h1>
        <p className="text-[var(--sea-ink-soft)]">
          感谢你的提交。管理员将在审核后将工具上线，你可以在「我的提交」中追踪审核状态。
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/dashboard/submissions"
            className="rounded-full bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
          >
            查看我的提交
          </Link>
          <Link
            to="/tools"
            className="rounded-full border border-[var(--line)] px-6 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)]"
          >
            返回工具目录
          </Link>
        </div>
      </div>
    </main>
  )
}
