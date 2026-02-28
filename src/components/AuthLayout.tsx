import { Link } from '@tanstack/react-router'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <main className="page-wrap flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <div className="island-shell w-full max-w-md rounded-2xl p-6 sm:p-8">
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
            Stockholm
          </Link>
        </div>
        <h1 className="display-title mb-1 text-center text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mb-6 text-center text-sm text-[var(--sea-ink-soft)]">{subtitle}</p>
        )}
        {children}
      </div>
    </main>
  )
}
