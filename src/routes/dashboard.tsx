import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] px-6 py-12 sm:px-10">
        <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
          Dashboard
        </h1>
        <p className="mt-4 text-[var(--sea-ink-soft)]">
          Welcome back. Your subscription is being set up.
        </p>
      </section>
    </main>
  )
}
