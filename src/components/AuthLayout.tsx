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
      <Card className="w-full max-w-md rounded-2xl border-border bg-card">
        <CardHeader className="pb-0 text-center">
          <div className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground no-underline"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              Stockholm
            </Link>
          </div>
          <CardTitle>
            <h1 className="font-bold text-2xl text-foreground sm:text-3xl">
              {title}
            </h1>
          </CardTitle>
          {subtitle && (
            <CardDescription className="text-muted-foreground">
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
