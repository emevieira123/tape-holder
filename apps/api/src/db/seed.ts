import { firstWatched, totalEpisodes, type CreateTitle } from '@fita/shared'
import { eq } from 'drizzle-orm'
import { auth } from '../auth'
import { db, sql } from './client'
import { title, user } from './schema'

const DEMO = { name: 'Demo', email: 'demo@fita.dev', password: 'Senha1234' }

const cover = (seed: string) => `https://picsum.photos/seed/${seed}/300/450`

// `seen` é quantos episódios já foram vistos, em ordem; Infinity marca tudo.
const SEED: (Omit<CreateTitle, 'coverUrl'> & { cover: string; seen: number; rating: number | null })[] = [
  { title: 'Sombras de Kyoto', type: 'anime', status: 'watching', episodes: [12, 13], year: 2024, rating: 4.6, genres: 'Mistério, Sobrenatural', cover: 'kyoto-shadow', seen: 13, synopsis: 'Uma restauradora de templos descobre que as sombras das ruas antigas de Kyoto guardam memórias que alguém quer apagar.' },
  { title: 'A Última Estação', type: 'series', status: 'watching', episodes: [9, 10], year: 2023, rating: 4.3, genres: 'Drama, Suspense', cover: 'last-station', seen: 7, synopsis: 'Um trem noturno que nunca chega ao destino e os passageiros que decidem descobrir por quê.' },
  { title: 'Maré Alta', type: 'movie', status: 'completed', episodes: [1], year: 2022, rating: 4.1, genres: 'Drama', cover: 'high-tide-sea', seen: Infinity, synopsis: 'Duas irmãs voltam à vila de pescadores onde cresceram para vender a casa da família.' },
  { title: 'Protocolo Cinza', type: 'series', status: 'paused', episodes: [10, 10, 8], year: 2021, rating: 3.9, genres: 'Ficção científica', cover: 'grey-protocol', seen: 14, synopsis: 'Em uma cidade governada por algoritmos, uma auditora encontra um erro que não deveria existir.' },
  { title: 'Céu de Neon', type: 'anime', status: 'planned', episodes: [12], year: 2025, rating: null, genres: 'Ação, Cyberpunk', cover: 'neon-sky-city', seen: 0, synopsis: 'Corridas ilegais em motos voadoras sobre uma megacidade que nunca dorme.' },
  { title: 'Horizonte Vermelho', type: 'movie', status: 'planned', episodes: [1], year: 2024, rating: null, genres: 'Aventura', cover: 'red-horizon', seen: 0, synopsis: 'A primeira expedição tripulada a um planeta que já foi habitado.' },
  { title: 'O Jardim Mecânico', type: 'anime', status: 'completed', episodes: [13, 12], year: 2020, rating: 4.8, genres: 'Fantasia, Drama', cover: 'mech-garden', seen: Infinity, synopsis: 'Um jardineiro autômato cuida do último jardim do mundo e aprende o que é esperar.' },
  { title: 'Noite em Lisboa', type: 'movie', status: 'completed', episodes: [1], year: 2019, rating: 4.4, genres: 'Romance', cover: 'lisbon-night', seen: Infinity, synopsis: 'Dois estranhos dividem um táxi e uma noite inteira de conversa.' },
  { title: 'Fenda', type: 'series', status: 'dropped', episodes: [8, 6], year: 2022, rating: 2.8, genres: 'Terror', cover: 'crack-fenda', seen: 3, synopsis: 'Uma rachadura aparece no teto de um prédio e começa a crescer.' },
  { title: 'Kaze no Uta', type: 'anime', status: 'watching', episodes: [13], year: 2025, rating: 4.5, genres: 'Slice of life, Música', cover: 'wind-song', seen: 9, synopsis: 'Um clube de música de uma escola rural tenta chegar ao festival nacional.' },
  { title: 'Rota 9', type: 'series', status: 'completed', episodes: [10], year: 2023, rating: 4.0, genres: 'Policial', cover: 'route-nine', seen: Infinity, synopsis: 'Um delegado de interior investiga uma série de desaparecimentos ao longo de uma rodovia.' },
  { title: 'Vidro', type: 'series', status: 'paused', episodes: [8], year: 2024, rating: 3.7, genres: 'Drama, Família', cover: 'glass-vidro', seen: 2, synopsis: 'Três gerações sob o mesmo teto depois de uma herança inesperada.' },
]

const [existing] = await db.select().from(user).where(eq(user.email, DEMO.email))
const userId = existing?.id ?? (await auth.api.signUpEmail({ body: DEMO })).user.id

await db.delete(title).where(eq(title.userId, userId))
const base = Date.now()
await db.insert(title).values(
  SEED.map(({ cover: c, seen, ...t }, i) => ({
    ...t,
    userId,
    watched: firstWatched(t.episodes, Math.min(seen, totalEpisodes(t))),
    coverUrl: cover(c),
    // Mantém a ordem do design na listagem (mais recente primeiro).
    createdAt: new Date(base - i * 1000),
  })),
)

console.log(`Seed pronto: ${SEED.length} títulos para ${DEMO.email} (senha ${DEMO.password})`)
await sql.end()
