import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { titlesApi } from '@/features/titles/api'
import { makeTitle, renderRoute } from '@/test/utils'
import { filterTitles, LibraryPage } from './library-page'

vi.mock('@/features/titles/api', () => ({ titlesApi: { list: vi.fn() } }))

const titles = [
  makeTitle({ title: 'Sombras de Kyoto', type: 'anime', status: 'watching', episodes: [6, 4], watched: [[1, 2], []] }),
  makeTitle({ title: 'Maré Alta', type: 'movie', status: 'completed', episodes: [1], watched: [[1]] }),
  makeTitle({ title: 'Rota 9', type: 'series', status: 'planned' }),
]

describe('filterTitles', () => {
  it('combina status, tipo e busca sem diferenciar maiúsculas', () => {
    expect(filterTitles(titles, { q: 'KYOTO' }).map((t) => t.title)).toEqual(['Sombras de Kyoto'])
    expect(filterTitles(titles, { type: 'movie', status: 'completed' })).toHaveLength(1)
    expect(filterTitles(titles, { type: 'movie', status: 'planned' })).toHaveLength(0)
  })
})

describe('LibraryPage', () => {
  beforeEach(() => vi.mocked(titlesApi.list).mockResolvedValue(titles))

  it('lista os títulos com progresso', async () => {
    renderRoute(<LibraryPage />)
    expect(await screen.findByText('3 títulos')).toBeInTheDocument()
    expect(screen.getByText('2/10 ep')).toBeInTheDocument()
    expect(screen.getByText('Assistido')).toBeInTheDocument()
  })

  it('filtra por status pelo chip, com contagem', async () => {
    const user = userEvent.setup()
    renderRoute(<LibraryPage />)
    await screen.findByText('3 títulos')
    const statusGroup = screen.getByLabelText('Filtrar por status')
    await user.click(within(statusGroup).getByRole('button', { name: /Concluído/ }))
    expect(screen.getByText('1 título')).toBeInTheDocument()
    expect(screen.getByText('Maré Alta')).toBeInTheDocument()
    expect(screen.queryByText('Rota 9')).not.toBeInTheDocument()
  })

  it('mostra o estado vazio e limpa os filtros', async () => {
    const user = userEvent.setup()
    renderRoute(<LibraryPage />)
    await screen.findByText('3 títulos')
    await user.type(screen.getByLabelText('Buscar título'), 'xyz')
    expect(screen.getByText('Nada por aqui')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(screen.getByText('3 títulos')).toBeInTheDocument()
  })
})
