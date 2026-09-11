import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { FullPageLoader } from '@/components/ui/Spinner'

export function ProtectedRoute() {
  const { isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <FullPageLoader label="Checking permissions…" />
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}