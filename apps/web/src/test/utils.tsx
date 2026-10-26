import type { Title } from '@fita/shared'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom'

export function renderWithProviders(routes: RouteObject[], initialPath = '/') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] })
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { ...utils, router, queryClient }
}

export const renderRoute = (element: ReactElement, path = '/') => renderWithProviders([{ path, element }], path)

let seq = 0
export const makeTitle = (over: Partial<Title> = {}): Title => ({
  id: `t${++seq}`,
  title: 'Título',
  type: 'series',
  status: 'watching',
  episodes: [10],
  year: 2024,
  rating: null,
  genres: '',
  coverUrl: '',
  synopsis: '',
  watched: [[]],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...over,
})
