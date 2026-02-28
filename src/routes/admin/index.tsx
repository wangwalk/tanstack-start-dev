import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  component: AdminOverviewPage,
})

function AdminOverviewPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
        Admin
      </h1>
      <p className="mt-2 text-[var(--sea-ink-soft)]">
        Manage users and platform settings.
      </p>
    </div>
  )
}
