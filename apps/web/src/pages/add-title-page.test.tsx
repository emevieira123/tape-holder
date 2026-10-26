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

const seasonInput = (n: number) => screen.getByLabelText(`Episódios da temporada ${n}`)

describe('AddTitlePage', () => {
  beforeEach(() => vi.mocked(titlesApi.create).mockReset())

  it('cadastra temporadas com quantidades diferentes de episódios', async () => {
    vi.mocked(titlesApi.create).mockResolvedValue(makeTitle({ title: 'Kaze no Uta' }))
    const user = userEvent.setup()
    const { router } = setup()
    await user.type(screen.getByPlaceholderText('Nome do filme, série ou anime'), 'Kaze no Uta')
    await user.click(screen.getByRole('radio', { name: 'Anime' }))
    await user.click(screen.getByRole('button', { name: /Assistindo/ }))

    await user.click(screen.getByRole('button', { name: 'Adicionar temporada' }))
    expect(seasonInput(2)).toHaveValue(12) // nova temporada copia a anterior
    await user.clear(seasonInput(2))
    await user.type(seasonInput(2), '24')
    expect(screen.getByText('2 temporadas · 36 episódios')).toBeInTheDocument()
    expect(screen.getByText('0/36 ep')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Salvar título' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(titlesApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Kaze no Uta', type: 'anime', status: 'watching', episodes: [12, 24] }),
    )
  })

  it('remove temporada, mas nunca a última', async () => {
    const user = userEvent.setup()
    setup()
    expect(screen.getByRole('button', { name: 'Remover temporada 1' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Adicionar temporada' }))
    await user.click(screen.getByRole('button', { name: 'Remover temporada 1' }))
    expect(screen.queryByLabelText('Episódios da temporada 2')).not.toBeInTheDocument()
    expect(screen.getByText('1 temporada · 12 episódios')).toBeInTheDocument()
  })

  it('não envia temporada sem episódios', async () => {
    const user = userEvent.setup()
    setup()
    await user.type(screen.getByPlaceholderText('Nome do filme, série ou anime'), 'Vidro')
    await user.clear(seasonInput(1))
    await user.type(seasonInput(1), '0')
    await user.click(screen.getByRole('button', { name: 'Salvar título' }))
    expect(await screen.findByText('Mínimo 1')).toBeInTheDocument()
    expect(titlesApi.create).not.toHaveBeenCalled()
  })

  it('filme não tem temporadas', async () => {
    vi.mocked(titlesApi.create).mockResolvedValue(makeTitle())
    const user = userEvent.setup()
    setup()
    await user.type(screen.getByPlaceholderText('Nome do filme, série ou anime'), 'Maré Alta')
    await user.click(screen.getByRole('radio', { name: 'Filme' }))
    expect(screen.queryByText('Adicionar temporada')).not.toBeInTheDocument()
    expect(screen.getByText('Não assistido')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Salvar título' }))
    await waitFor(() => expect(titlesApi.create).toHaveBeenCalledWith(expect.objectContaining({ type: 'movie', episodes: [1] })))
  })

  it('não envia sem título', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'Salvar título' }))
    expect(await screen.findByText('Dê um nome ao título')).toBeInTheDocument()
    expect(titlesApi.create).not.toHaveBeenCalled()
  })
})
