import { updateTitleSchema } from '@fita/shared'
import { beforeEach, describe, expect, it } from 'bun:test'
import { BadRequestError, NotFoundError } from '../../lib/errors'
import { createMemoryTitleRepository } from '../../test/memory-repositories'
import { createTitleService, type TitleService } from './service'

const USER = 'user-1'
let service: TitleService

beforeEach(() => {
  service = createTitleService(createMemoryTitleRepository())
})

// Duas temporadas de tamanhos diferentes.
const base = {
  title: 'Rota 9',
  type: 'series' as const,
  status: 'planned' as const,
  episodes: [3, 2],
  year: 2023,
  genres: 'Policial',
  coverUrl: '',
  synopsis: '',
}

describe('TitleService', () => {
  it('força filmes a terem um único episódio', async () => {
    const t = await service.create(USER, { ...base, type: 'movie', episodes: [4, 9] })
    expect(t.episodes).toEqual([1])
    expect(t.watched).toEqual([[]])
  })

  it('cria título concluído com todos os episódios de cada temporada marcados', async () => {
    const t = await service.create(USER, { ...base, status: 'completed' })
    expect(t.watched).toEqual([[1, 2, 3], [1, 2]])
  })

  it('isola títulos por usuário', async () => {
    const t = await service.create(USER, base)
    expect(service.get('outro', t.id)).rejects.toBeInstanceOf(NotFoundError)
    expect(await service.list('outro')).toHaveLength(0)
  })

  it('marca episódio da temporada certa e tira o título da fila', async () => {
    const t = await service.create(USER, base)
    const r = await service.toggleEpisode(USER, t.id, { season: 2, episode: 2 })
    expect(r.added).toBe(true)
    expect(r.title.watched).toEqual([[], [2]])
    expect(r.title.status).toBe('watching')
  })

  it('converte episódio inexistente na temporada em BadRequest', async () => {
    const t = await service.create(USER, base)
    expect(service.toggleEpisode(USER, t.id, { season: 2, episode: 3 })).rejects.toBeInstanceOf(BadRequestError)
  })

  it('marca o próximo atravessando temporadas até concluir', async () => {
    const t = await service.create(USER, { ...base, episodes: [1, 1] })
    expect(await service.markNext(USER, t.id)).toMatchObject({ season: 1, episode: 1 })
    const last = await service.markNext(USER, t.id)
    expect(last).toMatchObject({ season: 2, episode: 1 })
    expect(last.title.status).toBe('completed')
    expect(service.markNext(USER, t.id)).rejects.toBeInstanceOf(BadRequestError)
  })

  it('soma estatísticas por tipo e status', async () => {
    const a = await service.create(USER, { ...base, status: 'watching' })
    await service.toggleSeason(USER, a.id, 1)
    const m = await service.create(USER, { ...base, title: 'Maré Alta', type: 'movie', status: 'completed' })
    await service.update(USER, m.id, { rating: 4 })
    await service.update(USER, a.id, { rating: 5 })

    const s = await service.stats(USER)
    expect(s.totalTitles).toBe(2)
    expect(s.completedTitles).toBe(1)
    expect(s.episodesWatched).toBe(4)
    expect(s.episodesByType).toEqual({ movie: 1, series: 3, anime: 0 })
    expect(s.minutesWatched).toBe(112 + 3 * 48)
    expect(s.averageRating).toBe(4.5)
  })
})

describe('TitleService.update — editar temporadas', () => {
  it('mantém o progresso das temporadas existentes ao adicionar uma nova', async () => {
    const t = await service.create(USER, { ...base, status: 'watching' })
    await service.toggleSeason(USER, t.id, 2)
    const updated = await service.update(USER, t.id, { episodes: [3, 2, 10] })
    expect(updated.episodes).toEqual([3, 2, 10])
    expect(updated.watched).toEqual([[], [1, 2], []])
  })

  it('aumentar uma temporada do meio não desloca o progresso das seguintes', async () => {
    const t = await service.create(USER, { ...base, status: 'watching' })
    await service.toggleSeason(USER, t.id, 2)
    const updated = await service.update(USER, t.id, { episodes: [5, 2] })
    expect(updated.watched).toEqual([[], [1, 2]])
  })

  it('descarta o progresso de episódios e temporadas removidos', async () => {
    const t = await service.create(USER, { ...base, status: 'completed' })
    const updated = await service.update(USER, t.id, { episodes: [2] })
    expect(updated.watched).toEqual([[1, 2]])
  })

  it('reabre um título concluído quando ganha temporada nova', async () => {
    const t = await service.create(USER, { ...base, status: 'completed' })
    const updated = await service.update(USER, t.id, { episodes: [3, 2, 8], status: 'completed' })
    expect(updated.status).toBe('watching')
  })

  it('conclui quando a edição remove justamente o que faltava', async () => {
    const t = await service.create(USER, { ...base, status: 'watching' })
    await service.toggleSeason(USER, t.id, 1)
    expect((await service.update(USER, t.id, { episodes: [3] })).status).toBe('completed')
  })

  it('respeita um status escolhido explicitamente', async () => {
    const t = await service.create(USER, { ...base, status: 'completed' })
    const updated = await service.update(USER, t.id, { episodes: [3, 2, 8], status: 'paused' })
    expect(updated.status).toBe('paused')
  })

  it('dar nota não apaga gêneros, capa nem sinopse', async () => {
    const t = await service.create(USER, { ...base, coverUrl: 'https://x.dev/c.jpg', synopsis: 'Uma rodovia.' })
    const updated = await service.update(USER, t.id, updateTitleSchema.parse({ rating: 4 }))
    expect(updated).toMatchObject({ rating: 4, genres: 'Policial', coverUrl: 'https://x.dev/c.jpg', synopsis: 'Uma rodovia.' })
  })

  it('atualiza título, gêneros e capa', async () => {
    const t = await service.create(USER, base)
    const updated = await service.update(USER, t.id, { title: 'Rota 9: Desvio', genres: 'Policial, Drama', coverUrl: 'https://x.dev/c.jpg' })
    expect(updated).toMatchObject({ title: 'Rota 9: Desvio', genres: 'Policial, Drama', coverUrl: 'https://x.dev/c.jpg' })
  })
})
