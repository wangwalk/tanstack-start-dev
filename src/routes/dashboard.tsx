import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { getUserSubscription } from '#/lib/user'
import DashboardLayout from '#/components/dashboard/DashboardLayout'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context, location }) => {
    if (!context.session) {
      throw redirect({
        to: '/auth/sign-in',
        search: { redirect: location.pathname },
      })
    }

    const subscription = await getUserSubscription()

    return { subscription }
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
