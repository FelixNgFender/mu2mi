import { eq } from "drizzle-orm";
import type z from "zod";
import type { DB } from "@/infra";
import { assetInsertSchema, trackSelectSchema } from "@/types/db/input";
import { asset } from "@/types/db/schema";

const findTrackAssetsSchema = trackSelectSchema.pick({ id: true });

type FindTrackAssetsInput = z.infer<typeof findTrackAssetsSchema>;

async function findTrackAssets(db: DB, input: FindTrackAssetsInput) {
  return await db.query.asset.findMany({
    where: eq(asset.trackId, input.id),
    columns: {
      id: true,
      name: true,
      type: true,
      userId: true,
    },
  });
}

async function findUserAssets(db: DB, userId: string) {
  return await db.query.asset.findMany({
    where: eq(asset.userId, userId),
    columns: {
      name: true,
    },
  });
}

const createSchema = assetInsertSchema.omit({
  createdAt: true,
  updatedAt: true,
});

type Create = z.infer<typeof createSchema>;

async function create(db: DB, input: Create) {
  return await db
    .insert(asset)
    .values(input)
    .returning({ id: asset.id })
    .then((assetIds) => assetIds.at(0));
}

export default {
  findTrackAssetsSchema,
  findTrackAssets,
  findUserAssets,
  createSchema,
  create,
};
