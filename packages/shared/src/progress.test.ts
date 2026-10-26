import { describe, expect, it } from 'bun:test'
import {
  firstWatched,
  lostWatchedCount,
  markNext,
  nextEpisode,
  normalizeWatched,
  progressPercent,
  toggleEpisode,
  toggleSeason,
  totalEpisodes,
  type ProgressSubject,
} from './progress'

// Temporadas de tamanhos diferentes, como na maioria das séries e animes.
const series = (over: Partial<ProgressSubject> = {}): ProgressSubject => ({
  episodes: [3, 2],
  status: 'watching',
  watched: [[], []],
  ...over,
})

describe('progresso', () => {
  it('soma episódios de temporadas de tamanhos diferentes', () => {
    expect(totalEpisodes(series({ episodes: [12, 13, 10] }))).toBe(35)
    expect(progressPercent(series({ watched: [[1, 2, 3], [1]] }))).toBe(80)
  })

  it('acha o próximo pulando para a temporada seguinte', () => {
    expect(nextEpisode(series({ watched: [[1, 3], []] }))).toEqual({ season: 1, episode: 2 })
    expect(nextEpisode(series({ watched: [[1, 2, 3], []] }))).toEqual({ season: 2, episode: 1 })
    expect(nextEpisode(series({ watched: [[1, 2, 3], [1, 2]] }))).toBeNull()
  })

  it('normaliza o progresso ao formato das temporadas', () => {
    expect(normalizeWatched([[3, 1, 1, 9], [2]], [3, 1, 4])).toEqual([[1, 3], [], []])
  })

  it('conta quantos assistidos se perdem ao encolher ou remover temporadas', () => {
    const watched = [[1, 2, 3], [1, 2]]
    expect(lostWatchedCount(watched, [3, 2, 5])).toBe(0)
    expect(lostWatchedCount(watched, [2, 2])).toBe(1)
    expect(lostWatchedCount(watched, [3])).toBe(2)
  })

  it('gera os primeiros n assistidos atravessando temporadas', () => {
    expect(firstWatched([3, 2, 4], 4)).toEqual([[1, 2, 3], [1], []])
  })
})

describe('toggleEpisode', () => {
  it('marca e desmarca dentro da temporada certa', () => {
    const marked = toggleEpisode(series({ watched: [[3], []] }), { season: 1, episode: 1 })
    expect(marked.watched).toEqual([[1, 3], []])
    expect(marked.added).toBe(true)
    expect(toggleEpisode(series({ watched: [[], [1, 2]] }), { season: 2, episode: 2 }).watched).toEqual([[], [1]])
  })

  it('conclui quando o último episódio da última temporada é marcado', () => {
    expect(toggleEpisode(series({ watched: [[1, 2, 3], [1]] }), { season: 2, episode: 2 }).status).toBe('completed')
  })

  it('volta para assistindo ao desmarcar um título concluído', () => {
    const t = series({ status: 'completed', watched: [[1, 2, 3], [1, 2]] })
    expect(toggleEpisode(t, { season: 1, episode: 2 }).status).toBe('watching')
  })

  it('sai da fila quando começa a assistir', () => {
    expect(toggleEpisode(series({ status: 'planned' }), { season: 1, episode: 1 }).status).toBe('watching')
  })

  it('mantém pausado e abandonado ao marcar', () => {
    expect(toggleEpisode(series({ status: 'paused' }), { season: 1, episode: 1 }).status).toBe('paused')
    expect(toggleEpisode(series({ status: 'dropped' }), { season: 1, episode: 1 }).status).toBe('dropped')
  })

  it('recusa episódio que não existe naquela temporada', () => {
    expect(() => toggleEpisode(series(), { season: 2, episode: 3 })).toThrow(RangeError)
    expect(() => toggleEpisode(series(), { season: 3, episode: 1 })).toThrow(RangeError)
    expect(() => toggleEpisode(series(), { season: 1, episode: 0 })).toThrow(RangeError)
  })
})

describe('toggleSeason', () => {
  it('marca a temporada inteira', () => {
    const r = toggleSeason(series({ watched: [[1], []] }), 2)
    expect(r.watched).toEqual([[1], [1, 2]])
    expect(r.added).toBe(true)
  })

  it('desmarca quando a temporada já está completa', () => {
    const r = toggleSeason(series({ watched: [[1, 2, 3], [1]] }), 1)
    expect(r.watched).toEqual([[], [1]])
    expect(r.added).toBe(false)
  })

  it('recusa temporada inexistente', () => {
    expect(() => toggleSeason(series(), 3)).toThrow(RangeError)
  })
})

describe('markNext', () => {
  it('marca o primeiro episódio que falta, mesmo em outra temporada', () => {
    const r = markNext(series({ watched: [[1, 2, 3], []] }))
    expect(r).toMatchObject({ season: 2, episode: 1 })
    expect(r?.watched).toEqual([[1, 2, 3], [1]])
  })

  it('retorna null quando tudo foi assistido', () => {
    expect(markNext(series({ watched: [[1, 2, 3], [1, 2]] }))).toBeNull()
  })
})
