import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ReelIcon } from '@/components/reel-logo'
import { useSession } from '@/lib/auth-client'

function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center" aria-busy="true" aria-label="Carregando">
      <ReelIcon size={40} />
    </div>
  )
}

export function RequireAuth() {
  const { data, isPending } = useSession()
  const location = useLocation()
  if (isPending) return <FullScreenLoader />
  if (!data) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function RedirectIfAuthenticated() {
  const { data, isPending } = useSession()
  if (isPending) return <FullScreenLoader />
  if (data) return <Navigate to="/" replace />
  return <Outlet />
}
