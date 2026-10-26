import { EPISODE_MINUTES, type Title, type TitleStatus, type TitleType } from '@fita/shared'

/** Cor de cada status, como variável CSS do tema. */
export const STATUS_COLOR: Record<TitleStatus, string> = {
  watching: 'var(--accent)',
  completed: 'var(--gold)',
  paused: 'var(--muted)',
  planned: 'var(--blue)',
  dropped: 'var(--muted)',
}

export const picsum = (seed: string, w = 300, h = 450) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`

export const coverOf = (t: Pick<Title, 'coverUrl' | 'id'>) => t.coverUrl || picsum(`fita-${t.id}`)

export const formatMinutes = (min: number) => {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

export const episodeDuration = (type: TitleType) => formatMinutes(EPISODE_MINUTES[type])

export const formatDecimal = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
