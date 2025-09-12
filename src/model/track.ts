import { desc, eq, sql } from "drizzle-orm";
import type { z } from "zod";
import { type DB, db } from "@/infra";
import {
  assetSelectSchema,
  trackInsertSchema,
  trackSelectSchema,
  trackUpdateSchema,
} from "@/types/db/input";
import { asset, track } from "@/types/db/schema";

const findSchema = trackSelectSchema.pick({ id: true });

type Find = z.infer<typeof findSchema>;

async function find(db: DB, input: Find) {
  return await db.query.track.findFirst({
    where: eq(track.id, input.id),
    columns: {
      userId: true,
      public: true,
      status: true,
      type: true,
    },
  });
}

const preparedFindUserTracks = db.query.track
  .findMany({
    where: (tracks, { eq }) => eq(tracks.userId, sql.placeholder("userId")),
    columns: {
      id: true,
      name: true,
      public: true,
      status: true,
      type: true,
    },
    orderBy: [desc(track.createdAt)],
  })
  .prepare("find_user_tracks");

// use prepared statemnt for this one because it's called often
async function findUserTracks(userId: string) {
  return await preparedFindUserTracks.execute({ userId });
}

export type UserTrack = Awaited<ReturnType<typeof findUserTracks>>[number];

const createSchema = trackInsertSchema.omit({
  createdAt: true,
  updatedAt: true,
});

type Create = z.infer<typeof createSchema>;

async function create(db: DB, input: Create) {
  return await db
    .insert(track)
    .values(input)
    .returning({
      id: track.id,
    })
    .then((trackIds) => trackIds.at(0));
}

export const createAndUpdateAssetSchema = trackInsertSchema
  .omit({ createdAt: true, updatedAt: true })
  .extend({ assetId: assetSelectSchema.shape.id });

type CreateOneAndUpdateAsset = z.infer<typeof createAndUpdateAssetSchema>;

async function createOneAndUpdateAsset(db: DB, input: CreateOneAndUpdateAsset) {
  return await db.transaction(async (tx) => {
    const newTrack = await tx
      .insert(track)
      .values(input)
      .returning({
        id: track.id,
      })
      .then((trackIds) => trackIds.at(0));

    if (!newTrack) {
      return;
    }

    const newAsset = await tx
      .update(asset)
      .set({ trackId: newTrack.id })
      .where(eq(asset.id, input.assetId))
      .returning({ name: asset.name })
      .then((assetNames) => assetNames.at(0));

    if (!newAsset) {
      return;
    }

    return {
      trackId: newTrack.id,
      assetName: newAsset.name,
    };
  });
}

const updateSchema = trackUpdateSchema
  .omit({ updatedAt: true })
  .extend({ trackId: trackSelectSchema.shape.id });

type Update = z.infer<typeof updateSchema>;

async function update(db: DB, input: Update) {
  await db
    .update(track)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(track.id, input.trackId));
}

const removeSchema = trackSelectSchema.pick({ id: true });

type Remove = z.infer<typeof removeSchema>;

async function remove(db: DB, input: Remove) {
  await db.delete(track).where(eq(track.id, input.id));
}

export default {
  findSchema,
  find,
  findUserTracks,
  createAndUpdateAssetSchema,
  createOneAndUpdateAsset,
  createSchema,
  create,
  updateSchema,
  update,
  removeSchema,
  remove,
};
