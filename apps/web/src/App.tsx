import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { Toaster } from '@/components/toaster'
import { RedirectIfAuthenticated, RequireAuth } from '@/features/auth/route-guards'
import { AddTitlePage } from '@/pages/add-title-page'
import { LibraryPage } from '@/pages/library-page'
import { LoginPage } from '@/pages/login-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { ProfilePage } from '@/pages/profile-page'
import { StatsPage } from '@/pages/stats-page'
import { TitleDetailPage } from '@/pages/title-detail-page'
import { useUiStore } from '@/stores/ui-store'

export const routes = [
  {
    element: <RedirectIfAuthenticated />,
    children: [{ path: '/entrar', element: <LoginPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <LibraryPage /> },
          { path: 'titulos/:id', element: <TitleDetailPage /> },
          { path: 'adicionar', element: <AddTitlePage /> },
          { path: 'estatisticas', element: <StatsPage /> },
          { path: 'perfil', element: <ProfilePage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

const router = createBrowserRouter(routes)

/** Aplica o tema salvo no <html>, para que o fundo do body acompanhe. */
function useThemeAttribute() {
  const theme = useUiStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}

export function App() {
  useThemeAttribute()
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}
