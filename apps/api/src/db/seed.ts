import { range, type CreateTitle } from '@fita/shared'
import { eq } from 'drizzle-orm'
import { auth } from '../auth'
import { db, sql } from './client'
import { title, user } from './schema'

const DEMO = { name: 'Demo', email: 'demo@fita.dev', password: 'Senha1234' }

const cover = (seed: string) => `https://picsum.photos/seed/${seed}/300/450`

const SEED: (Omit<CreateTitle, 'coverUrl'> & { cover: string; watched: number[]; rating: number | null })[] = [
  { title: 'Sombras de Kyoto', type: 'anime', status: 'watching', seasons: 2, episodesPerSeason: 12, year: 2024, rating: 4.6, genres: 'Mistério, Sobrenatural', cover: 'kyoto-shadow', watched: range(1, 13), synopsis: 'Uma restauradora de templos descobre que as sombras das ruas antigas de Kyoto guardam memórias que alguém quer apagar.' },
  { title: 'A Última Estação', type: 'series', status: 'watching', seasons: 2, episodesPerSeason: 9, year: 2023, rating: 4.3, genres: 'Drama, Suspense', cover: 'last-station', watched: range(1, 7), synopsis: 'Um trem noturno que nunca chega ao destino e os passageiros que decidem descobrir por quê.' },
  { title: 'Maré Alta', type: 'movie', status: 'completed', seasons: 1, episodesPerSeason: 1, year: 2022, rating: 4.1, genres: 'Drama', cover: 'high-tide-sea', watched: [1], synopsis: 'Duas irmãs voltam à vila de pescadores onde cresceram para vender a casa da família.' },
  { title: 'Protocolo Cinza', type: 'series', status: 'paused', seasons: 3, episodesPerSeason: 10, year: 2021, rating: 3.9, genres: 'Ficção científica', cover: 'grey-protocol', watched: range(1, 14), synopsis: 'Em uma cidade governada por algoritmos, uma auditora encontra um erro que não deveria existir.' },
  { title: 'Céu de Neon', type: 'anime', status: 'planned', seasons: 1, episodesPerSeason: 12, year: 2025, rating: null, genres: 'Ação, Cyberpunk', cover: 'neon-sky-city', watched: [], synopsis: 'Corridas ilegais em motos voadoras sobre uma megacidade que nunca dorme.' },
  { title: 'Horizonte Vermelho', type: 'movie', status: 'planned', seasons: 1, episodesPerSeason: 1, year: 2024, rating: null, genres: 'Aventura', cover: 'red-horizon', watched: [], synopsis: 'A primeira expedição tripulada a um planeta que já foi habitado.' },
  { title: 'O Jardim Mecânico', type: 'anime', status: 'completed', seasons: 2, episodesPerSeason: 13, year: 2020, rating: 4.8, genres: 'Fantasia, Drama', cover: 'mech-garden', watched: range(1, 26), synopsis: 'Um jardineiro autômato cuida do último jardim do mundo e aprende o que é esperar.' },
  { title: 'Noite em Lisboa', type: 'movie', status: 'completed', seasons: 1, episodesPerSeason: 1, year: 2019, rating: 4.4, genres: 'Romance', cover: 'lisbon-night', watched: [1], synopsis: 'Dois estranhos dividem um táxi e uma noite inteira de conversa.' },
  { title: 'Fenda', type: 'series', status: 'dropped', seasons: 2, episodesPerSeason: 8, year: 2022, rating: 2.8, genres: 'Terror', cover: 'crack-fenda', watched: range(1, 3), synopsis: 'Uma rachadura aparece no teto de um prédio e começa a crescer.' },
  { title: 'Kaze no Uta', type: 'anime', status: 'watching', seasons: 1, episodesPerSeason: 13, year: 2025, rating: 4.5, genres: 'Slice of life, Música', cover: 'wind-song', watched: range(1, 9), synopsis: 'Um clube de música de uma escola rural tenta chegar ao festival nacional.' },
  { title: 'Rota 9', type: 'series', status: 'completed', seasons: 1, episodesPerSeason: 10, year: 2023, rating: 4.0, genres: 'Policial', cover: 'route-nine', watched: range(1, 10), synopsis: 'Um delegado de interior investiga uma série de desaparecimentos ao longo de uma rodovia.' },
  { title: 'Vidro', type: 'series', status: 'paused', seasons: 1, episodesPerSeason: 8, year: 2024, rating: 3.7, genres: 'Drama, Família', cover: 'glass-vidro', watched: range(1, 2), synopsis: 'Três gerações sob o mesmo teto depois de uma herança inesperada.' },
]

const [existing] = await db.select().from(user).where(eq(user.email, DEMO.email))
const userId = existing?.id ?? (await auth.api.signUpEmail({ body: DEMO })).user.id

await db.delete(title).where(eq(title.userId, userId))
const base = Date.now()
await db.insert(title).values(
  SEED.map(({ cover: c, ...t }, i) => ({
    ...t,
    userId,
    coverUrl: cover(c),
    // Mantém a ordem do design na listagem (mais recente primeiro).
    createdAt: new Date(base - i * 1000),
  })),
)

console.log(`Seed pronto: ${SEED.length} títulos para ${DEMO.email} (senha ${DEMO.password})`)
await sql.end()
