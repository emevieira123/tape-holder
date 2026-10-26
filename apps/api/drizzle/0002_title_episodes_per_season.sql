-- Temporadas passam a ter quantidades próprias de episódios, e o progresso fica por temporada.
-- Escrita à mão: converte os dados de (seasons × episodes_per_season, watched absoluto)
-- para (episodes[], watched por temporada) sem perder progresso.
ALTER TABLE "title" ADD COLUMN "episodes" integer[] DEFAULT '{1}' NOT NULL;--> statement-breakpoint
ALTER TABLE "title" ADD COLUMN "watched_by_season" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "title" AS t SET
  "episodes" = array_fill(t."episodes_per_season", ARRAY[t."seasons"]),
  "watched_by_season" = (
    SELECT jsonb_agg(
      COALESCE(
        (
          SELECT jsonb_agg(w - (s - 1) * t."episodes_per_season" ORDER BY w)
          FROM unnest(t."watched") AS w
          WHERE w > (s - 1) * t."episodes_per_season" AND w <= s * t."episodes_per_season"
        ),
        '[]'::jsonb
      )
      ORDER BY s
    )
    FROM generate_series(1, t."seasons") AS s
  );--> statement-breakpoint
ALTER TABLE "title" DROP COLUMN "watched";--> statement-breakpoint
ALTER TABLE "title" RENAME COLUMN "watched_by_season" TO "watched";--> statement-breakpoint
ALTER TABLE "title" DROP COLUMN "seasons";--> statement-breakpoint
ALTER TABLE "title" DROP COLUMN "episodes_per_season";
