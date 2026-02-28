import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import AdminLayout from '#/components/admin/AdminLayout'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context, location }) => {
    if (!context.session) {
      throw redirect({
        to: '/auth/sign-in',
        search: { redirect: location.pathname },
      })
    }

    if (context.session.user.role !== 'admin') {
      throw redirect({ to: '/' })
    }
  },
  component: AdminLayoutRoute,
})

function AdminLayoutRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
