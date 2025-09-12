ALTER TYPE "public"."track_type" RENAME TO "track_asset_type";--> statement-breakpoint
ALTER TABLE "asset" ADD COLUMN "type" "track_asset_type";--> statement-breakpoint
ALTER TABLE "track" DROP COLUMN "type";