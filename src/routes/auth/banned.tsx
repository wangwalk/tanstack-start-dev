import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import AuthLayout from '#/components/AuthLayout'
import { SITE_TITLE } from '#/lib/site'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/auth/banned')({
  head: () => ({
    meta: [{ title: `Account Banned | ${SITE_TITLE}` }],
  }),
  component: BannedPage,
})

function BannedPage() {
  const { data: session } = authClient.useSession()
  const banReason = session?.user.banReason

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = '/'
  }

  return (
    <AuthLayout
      title="Account suspended"
      subtitle="Your account has been suspended and you cannot sign in."
    >
      <div className="mt-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-8 w-8 text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
        {banReason && (
          <p className="mb-4 text-sm text-muted-foreground">
            Reason: <span className="font-medium text-foreground">{banReason}</span>
          </p>
        )}
        <p className="mb-6 text-sm text-muted-foreground">
          If you believe this is a mistake, please contact support.
        </p>
        <Button
          variant="outline"
          type="button"
          onClick={() => void handleSignOut()}
          className="rounded-full transition hover:-translate-y-0.5"
        >
          Sign out
        </Button>
      </div>
    </AuthLayout>
  )
}
