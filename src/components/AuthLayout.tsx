import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <main className="page-wrap flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-2xl border-[var(--line)] bg-[var(--surface)]">
        <CardHeader className="pb-0 text-center">
          <div className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
              Stockholm
            </Link>
          </div>
          <CardTitle>
            <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
              {title}
            </h1>
          </CardTitle>
          {subtitle && (
            <CardDescription className="text-[var(--sea-ink-soft)]">
              {subtitle}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </main>
  )
}
