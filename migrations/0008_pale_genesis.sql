CREATE TYPE "public"."track_type" AS ENUM('generation', 'separation', 'analysis', 'midi', 'lyrics');--> statement-breakpoint
ALTER TYPE "public"."track_asset_type" RENAME TO "asset_type";--> statement-breakpoint
ALTER TABLE "track" ADD COLUMN "type" "track_type" NOT NULL;