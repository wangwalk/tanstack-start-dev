import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import AuthLayout from '#/components/AuthLayout'
import { SITE_TITLE } from '#/lib/site'

export const Route = createFileRoute('/auth/banned')({
  head: () => ({
    meta: [{ title: `Account Banned | ${SITE_TITLE}` }],
  }),
  component: BannedPage,
})

function BannedPage() {
  const { data: session } = authClient.useSession()
  const banReason = (session?.user as { banReason?: string } | undefined)
    ?.banReason

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
          <p className="mb-4 text-sm text-[var(--sea-ink-soft)]">
            Reason: <span className="font-medium text-[var(--sea-ink)]">{banReason}</span>
          </p>
        )}
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
          If you believe this is a mistake, please contact support.
        </p>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="inline-block rounded-full border border-[var(--line)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--sea-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--link-bg-hover)]"
        >
          Sign out
        </button>
      </div>
    </AuthLayout>
  )
}
