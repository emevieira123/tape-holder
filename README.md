# Fita

Biblioteca de filmes, séries e animes com progresso por episódio. Implementação do design "Fita" do Claude Design.

## Estrutura

```
apps/api         Bun + Elysia, better-auth, Drizzle (Postgres), OpenAPI em /docs
apps/web         React + Vite, Tailwind v4, shadcn/ui, React Router, React Query, RHF + Zod, Zustand
packages/shared  Schemas Zod, constantes e regras de progresso usadas pelos dois lados
```

## Rodando

```bash
bun install
bun run db:up                           # Postgres em 127.0.0.1:5436
cp apps/api/.env.example apps/api/.env  # e troque o BETTER_AUTH_SECRET
bun run db:migrate
bun run db:seed                         # opcional: conta demo@fita.dev / Senha1234 com 12 títulos
bun run dev                             # API em :3333, web em :5173
```

O Vite encaminha `/api` para a API, então front e API ficam na mesma origem e o cookie de sessão funciona sem configuração extra.

## Scripts

| Comando | O que faz |
| --- | --- |
| `bun run test` | Testes de todos os pacotes (bun test na API e no shared, Vitest no web) |
| `bun run typecheck` | `tsc --noEmit` em todos os pacotes |
| `bun --filter @fita/api db:generate` | Gera migration a partir do schema Drizzle |
| `bun --filter @fita/api db:studio` | Abre o Drizzle Studio |

## API

Todas as rotas abaixo exigem sessão. Documentação interativa em http://localhost:3333/docs.

| Método | Rota | |
| --- | --- | --- |
| GET | `/api/titles?status&type&q` | Lista a biblioteca |
| POST | `/api/titles` | Adiciona título |
| GET / PATCH / DELETE | `/api/titles/:id` | Detalhe, edição (status, nota etc.), remoção |
| POST | `/api/titles/:id/episodes/:n/toggle` | Marca ou desmarca episódio |
| POST | `/api/titles/:id/seasons/:n/toggle` | Marca ou desmarca temporada |
| POST | `/api/titles/:id/next` | Marca o próximo episódio |
| GET | `/api/stats` | Estatísticas |
| GET | `/api/export` | Biblioteca em JSON |
| GET / PATCH | `/api/preferences` | Preferências |

Autenticação em `/api/auth/*` (better-auth): e-mail e senha, e login de convidado pelo plugin `anonymous`.

## Regras de progresso

Ficam em `packages/shared/src/progress.ts`. Marcar o último episódio conclui o título; desmarcar algo de um título concluído volta para Assistindo; marcar um episódio de algo em Quero assistir também passa para Assistindo. Pausado e Abandonado não mudam sozinhos. Filme é tratado como uma temporada com um episódio.
