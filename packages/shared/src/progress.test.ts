import { describe, expect, it } from 'bun:test'
import {
  clampWatched,
  episodeLocation,
  markNext,
  nextEpisode,
  progressPercent,
  toggleEpisode,
  toggleSeason,
  type ProgressSubject,
} from './progress'

const series = (over: Partial<ProgressSubject> = {}): ProgressSubject => ({
  seasons: 2,
  episodesPerSeason: 3,
  status: 'watching',
  watched: [],
  ...over,
})

describe('progresso', () => {
  it('calcula percentual e próximo episódio', () => {
    const t = series({ watched: [1, 2, 4] })
    expect(progressPercent(t)).toBe(50)
    expect(nextEpisode(t)).toBe(3)
    expect(nextEpisode(series({ watched: [1, 2, 3, 4, 5, 6] }))).toBeNull()
  })

  it('localiza episódio absoluto na temporada', () => {
    expect(episodeLocation(series(), 4)).toEqual({ season: 2, episode: 1 })
    expect(episodeLocation(series(), 3)).toEqual({ season: 1, episode: 3 })
  })
})

describe('toggleEpisode', () => {
  it('marca e desmarca mantendo a lista ordenada', () => {
    const marked = toggleEpisode(series({ watched: [3] }), 1)
    expect(marked.watched).toEqual([1, 3])
    expect(marked.added).toBe(true)
    expect(toggleEpisode(series({ watched: [1, 3] }), 3).watched).toEqual([1])
  })

  it('conclui quando o último episódio é marcado', () => {
    expect(toggleEpisode(series({ watched: [1, 2, 3, 4, 5] }), 6).status).toBe('completed')
  })

  it('volta para assistindo ao desmarcar um título concluído', () => {
    const t = series({ status: 'completed', watched: [1, 2, 3, 4, 5, 6] })
    expect(toggleEpisode(t, 2).status).toBe('watching')
  })

  it('sai da fila quando começa a assistir', () => {
    expect(toggleEpisode(series({ status: 'planned' }), 1).status).toBe('watching')
  })

  it('mantém pausado e abandonado ao marcar', () => {
    expect(toggleEpisode(series({ status: 'paused' }), 1).status).toBe('paused')
    expect(toggleEpisode(series({ status: 'dropped' }), 1).status).toBe('dropped')
  })

  it('recusa episódio fora do intervalo', () => {
    expect(() => toggleEpisode(series(), 7)).toThrow(RangeError)
    expect(() => toggleEpisode(series(), 0)).toThrow(RangeError)
  })
})

describe('toggleSeason', () => {
  it('marca a temporada inteira', () => {
    const r = toggleSeason(series({ watched: [1] }), 2)
    expect(r.watched).toEqual([1, 4, 5, 6])
    expect(r.added).toBe(true)
  })

  it('desmarca quando a temporada já está completa', () => {
    const r = toggleSeason(series({ watched: [1, 2, 3, 4] }), 1)
    expect(r.watched).toEqual([4])
    expect(r.added).toBe(false)
  })

  it('recusa temporada inexistente', () => {
    expect(() => toggleSeason(series(), 3)).toThrow(RangeError)
  })
})

describe('markNext', () => {
  it('marca o primeiro episódio que falta', () => {
    expect(markNext(series({ watched: [1, 3] }))?.episode).toBe(2)
  })

  it('retorna null quando tudo foi assistido', () => {
    expect(markNext(series({ watched: [1, 2, 3, 4, 5, 6] }))).toBeNull()
  })
})

it('clampWatched remove duplicados e episódios fora do total', () => {
  expect(clampWatched([5, 1, 1, 9, 0], 6)).toEqual([1, 5])
})
