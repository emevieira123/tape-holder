import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { titlesApi } from '@/features/titles/api'
import { makeTitle, renderWithProviders } from '@/test/utils'
import { AddTitlePage } from './add-title-page'

vi.mock('@/features/titles/api', () => ({ titlesApi: { create: vi.fn() } }))

const setup = () =>
  renderWithProviders(
    [
      { path: '/adicionar', element: <AddTitlePage /> },
      { path: '/', element: <div>biblioteca</div> },
    ],
    '/adicionar',
  )

describe('AddTitlePage', () => {
  beforeEach(() => vi.mocked(titlesApi.create).mockReset())

  it('atualiza a prévia com tipo e total de episódios', async () => {
    const user = userEvent.setup()
    setup()
    await user.type(screen.getByPlaceholderText('Nome do filme, série ou anime'), 'Vidro')
    const seasons = screen.getByLabelText('Temporadas')
    await user.clear(seasons)
    await user.type(seasons, '2')
    expect(screen.getByText('0/24 ep')).toBeInTheDocument()
    expect(screen.getAllByText('Vidro').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('radio', { name: 'Filme' }))
    expect(screen.queryByLabelText('Temporadas')).not.toBeInTheDocument()
    expect(screen.getByText('Não assistido')).toBeInTheDocument()
  })

  it('não envia sem título', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'Salvar título' }))
    expect(await screen.findByText('Dê um nome ao título')).toBeInTheDocument()
    expect(titlesApi.create).not.toHaveBeenCalled()
  })

  it('envia números convertidos e volta para a biblioteca', async () => {
    vi.mocked(titlesApi.create).mockResolvedValue(makeTitle({ title: 'Kaze no Uta' }))
    const user = userEvent.setup()
    const { router } = setup()
    await user.type(screen.getByPlaceholderText('Nome do filme, série ou anime'), 'Kaze no Uta')
    await user.click(screen.getByRole('radio', { name: 'Anime' }))
    await user.click(screen.getByRole('button', { name: /Assistindo/ }))
    await user.click(screen.getByRole('button', { name: 'Salvar título' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(titlesApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Kaze no Uta', type: 'anime', status: 'watching', seasons: 1, episodesPerSeason: 12 }),
    )
  })
})
