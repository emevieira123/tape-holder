import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { titlesApi } from '@/features/titles/api'
import { makeTitle, renderWithProviders } from '@/test/utils'
import { EditTitlePage } from './edit-title-page'

vi.mock('@/features/titles/api', () => ({ titlesApi: { get: vi.fn(), update: vi.fn() } }))

const title = makeTitle({
  id: 'kyoto',
  title: 'Sombras de Kyoto',
  type: 'anime',
  status: 'watching',
  episodes: [12, 12],
  watched: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 2]],
  genres: 'Mistério',
})

const setup = () => {
  vi.mocked(titlesApi.get).mockResolvedValue(title)
  return renderWithProviders(
    [
      { path: '/titulos/:id/editar', element: <EditTitlePage /> },
      { path: '/titulos/:id', element: <div>detalhe</div> },
    ],
    '/titulos/kyoto/editar',
  )
}

const seasonInput = (n: number) => screen.getByLabelText(`Episódios da temporada ${n}`)

describe('EditTitlePage', () => {
  beforeEach(() => vi.mocked(titlesApi.update).mockReset())

  it('abre preenchido com o título e as temporadas', async () => {
    setup()
    expect(await screen.findByDisplayValue('Sombras de Kyoto')).toBeInTheDocument()
    expect(seasonInput(1)).toHaveValue(12)
    expect(seasonInput(2)).toHaveValue(12)
    expect(screen.getByDisplayValue('Mistério')).toBeInTheDocument()
    expect(screen.getByText('14/24 ep')).toBeInTheDocument()
  })

  it('adiciona temporada e salva mantendo o resto', async () => {
    vi.mocked(titlesApi.update).mockResolvedValue({ ...title, episodes: [12, 12, 13] })
    const user = userEvent.setup()
    const { router } = setup()
    await screen.findByDisplayValue('Sombras de Kyoto')
    await user.click(screen.getByRole('button', { name: 'Adicionar temporada' }))
    await user.clear(seasonInput(3))
    await user.type(seasonInput(3), '13')
    await user.clear(screen.getByDisplayValue('Sombras de Kyoto'))
    await user.type(screen.getByPlaceholderText('Nome do filme, série ou anime'), 'Sombras de Kyoto II')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/titulos/kyoto'))
    expect(titlesApi.update).toHaveBeenCalledWith(
      'kyoto',
      expect.objectContaining({ title: 'Sombras de Kyoto II', episodes: [12, 12, 13], genres: 'Mistério', status: 'watching' }),
    )
  })

  it('avisa quantos assistidos serão desmarcados antes de salvar', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByDisplayValue('Sombras de Kyoto')
    await user.clear(seasonInput(1))
    await user.type(seasonInput(1), '10')
    expect(screen.getByRole('alert')).toHaveTextContent('2 episódios assistidos vão ser desmarcados ao salvar.')
    await user.click(screen.getByRole('button', { name: 'Remover temporada 2' }))
    expect(screen.getByRole('alert')).toHaveTextContent('4 episódios assistidos vão ser desmarcados ao salvar.')
  })
})
