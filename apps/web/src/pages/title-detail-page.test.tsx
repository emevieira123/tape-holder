import type { Preferences, Title } from '@fita/shared'
import { screen, waitFor, within } from '@testing-library/react'
import { titlesApi } from '@/features/titles/api'
import { api } from '@/lib/api'
import { makeTitle, renderWithProviders } from '@/test/utils'
import { TitleDetailPage } from './title-detail-page'

vi.mock('@/features/titles/api', () => ({ titlesApi: { get: vi.fn() } }))
vi.mock('@/lib/api', () => ({ api: { get: vi.fn() }, errorMessage: () => 'erro' }))

const scrollIntoView = vi.fn()
beforeAll(() => {
  Element.prototype.scrollIntoView = scrollIntoView
})

const prefs = (over: Partial<Preferences> = {}): Preferences => ({
  notifyNewEpisodes: true,
  hideSynopsis: false,
  jumpToNext: true,
  ...over,
})

function open(title: Title, preferences: Preferences) {
  vi.mocked(titlesApi.get).mockResolvedValue(title)
  vi.mocked(api.get).mockResolvedValue({ data: preferences })
  return renderWithProviders([{ path: '/titulos/:id', element: <TitleDetailPage /> }], `/titulos/${title.id}`)
}

describe('TitleDetailPage — temporadas', () => {
  it('mostra cada temporada com sua própria quantidade de episódios', async () => {
    open(makeTitle({ status: 'watching', episodes: [3, 5], watched: [[1, 2, 3], [2]] }), prefs({ jumpToNext: false }))
    const t1 = await screen.findByRole('region', { name: 'Temporada 1' })
    const t2 = screen.getByRole('region', { name: 'Temporada 2' })
    expect(within(t1).getAllByRole('checkbox')).toHaveLength(3)
    expect(within(t2).getAllByRole('checkbox')).toHaveLength(5)
    expect(within(t2).getByText('1/5')).toBeInTheDocument()
    expect(screen.getByText(/2 temporadas · 8 episódios/)).toBeInTheDocument()
    expect(screen.getByText('Próximo: T2 E01')).toBeInTheDocument()
  })

  it('leva para a edição', async () => {
    const title = makeTitle()
    open(title, prefs())
    expect(await screen.findByRole('link', { name: 'Editar' })).toHaveAttribute('href', `/titulos/${title.id}/editar`)
  })
})

describe('TitleDetailPage — ir direto ao próximo episódio', () => {
  beforeEach(() => scrollIntoView.mockClear())

  it('rola até o próximo episódio e o destaca, sem marcar nada', async () => {
    const title = makeTitle({ status: 'watching', episodes: [3, 4], watched: [[1, 2, 3], [1]] })
    open(title, prefs())
    await screen.findByText('Próximo')

    // Temporada 1 completa e o E01 da 2: o próximo é o T2 E02.
    const next = within(screen.getByRole('region', { name: 'Temporada 2' })).getByRole('checkbox', { name: /Episódio 2/ })
    expect(next).toHaveAttribute('aria-current', 'step')
    expect(next).toHaveAttribute('aria-checked', 'false')
    expect(within(next).getByText('Próximo')).toBeInTheDocument()
    expect(screen.getAllByText('Próximo')).toHaveLength(1)
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1))
    expect(scrollIntoView.mock.contexts[0]).toBe(next)
  })

  it('não faz nada com a preferência desligada', async () => {
    open(makeTitle({ status: 'watching', watched: [[1]] }), prefs({ jumpToNext: false }))
    await screen.findByText(/1 de 10 episódios/)
    expect(screen.queryByText('Próximo')).not.toBeInTheDocument()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('só vale para títulos com status Assistindo', async () => {
    open(makeTitle({ status: 'paused', watched: [[1]] }), prefs())
    await screen.findByText(/1 de 10 episódios/)
    await waitFor(() => expect(api.get).toHaveBeenCalled())
    expect(screen.queryByText('Próximo')).not.toBeInTheDocument()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
