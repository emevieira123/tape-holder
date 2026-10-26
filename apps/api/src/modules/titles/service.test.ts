import { beforeEach, describe, expect, it } from 'bun:test'
import { BadRequestError, NotFoundError } from '../../lib/errors'
import { createMemoryTitleRepository } from '../../test/memory-repositories'
import { createTitleService, type TitleService } from './service'

const USER = 'user-1'
let service: TitleService

beforeEach(() => {
  service = createTitleService(createMemoryTitleRepository())
})

const base = {
  title: 'Rota 9',
  type: 'series' as const,
  status: 'planned' as const,
  seasons: 2,
  episodesPerSeason: 3,
  year: 2023,
  genres: 'Policial',
  coverUrl: '',
  synopsis: '',
}

describe('TitleService', () => {
  it('força filmes a terem um único episódio', async () => {
    const t = await service.create(USER, { ...base, type: 'movie', seasons: 4, episodesPerSeason: 9 })
    expect(t.seasons).toBe(1)
    expect(t.episodesPerSeason).toBe(1)
  })

  it('cria título concluído com todos os episódios marcados', async () => {
    const t = await service.create(USER, { ...base, status: 'completed' })
    expect(t.watched).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('isola títulos por usuário', async () => {
    const t = await service.create(USER, base)
    expect(service.get('outro', t.id)).rejects.toBeInstanceOf(NotFoundError)
    expect(await service.list('outro')).toHaveLength(0)
  })

  it('marca episódio e tira o título da fila', async () => {
    const t = await service.create(USER, base)
    const r = await service.toggleEpisode(USER, t.id, 2)
    expect(r.added).toBe(true)
    expect(r.title.watched).toEqual([2])
    expect(r.title.status).toBe('watching')
  })

  it('converte episódio inválido em BadRequest', async () => {
    const t = await service.create(USER, base)
    expect(service.toggleEpisode(USER, t.id, 99)).rejects.toBeInstanceOf(BadRequestError)
  })

  it('marca o próximo até concluir', async () => {
    const t = await service.create(USER, { ...base, seasons: 1, episodesPerSeason: 2 })
    expect((await service.markNext(USER, t.id)).episode).toBe(1)
    const last = await service.markNext(USER, t.id)
    expect(last.episode).toBe(2)
    expect(last.title.status).toBe('completed')
    expect(service.markNext(USER, t.id)).rejects.toBeInstanceOf(BadRequestError)
  })

  it('descarta episódios assistidos que deixam de existir ao reduzir temporadas', async () => {
    const t = await service.create(USER, base)
    await service.toggleSeason(USER, t.id, 2)
    const updated = await service.update(USER, t.id, { seasons: 1 })
    expect(updated.watched).toEqual([])
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
