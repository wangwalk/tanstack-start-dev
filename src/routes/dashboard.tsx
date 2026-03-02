import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { getUserSubscription } from '#/lib/billing'
import { getCreditBalance } from '#/lib/credits'
import DashboardLayout from '#/components/dashboard/DashboardLayout'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context, location }) => {
    if (!context.session) {
      throw redirect({
        to: '/auth/sign-in',
        search: { redirect: location.pathname },
      })
    }

    const [subscription, creditBalance] = await Promise.all([
      getUserSubscription(),
      getCreditBalance(),
    ])

    return { subscription, creditBalance }
  },
  component: DashboardLayoutRoute,
})

function DashboardLayoutRoute() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
