// This file should not contain any runtime logic besides defining the schema.
// See https://orm.drizzle.team/docs/migrations#quick-start
import {
  bigint,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const cascadingUpdateAndDelete = {
  onUpdate: "cascade",
  onDelete: "cascade",
} as const;

const updateAndCreatedAt = {
  updatedAt: timestamp().notNull().defaultNow(),
  createdAt: timestamp().notNull().defaultNow(),
};

export const user = pgTable(
  "user",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean().notNull().default(false),
    image: text(),
    ...updateAndCreatedAt,
  },
  (table) => [index().on(table.email)],
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    expiresAt: timestamp().notNull(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, cascadingUpdateAndDelete),
    ...updateAndCreatedAt,
  },
  (table) => [index().on(table.userId), index().on(table.token)],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp(),
    refreshTokenExpiresAt: timestamp(),
    scope: text(),
    password: text(),
    userId: text()
      .notNull()
      .references(() => user.id, cascadingUpdateAndDelete),
    ...updateAndCreatedAt,
  },
  (table) => [index().on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp().notNull(),
    ...updateAndCreatedAt,
  },
  (table) => [index().on(table.identifier)],
);

export const mimeType = pgEnum("mime_type", [
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
  "audio/flac",
  "audio/mp4",
  "audio/mov",
  "audio/wma",
  "audio/ogg",
  "audio/m4a",
  "application/json",
  "image/png",
  "audio/sp-midi",
  "audio/x-wav",
]);

export type MimeType = (typeof mimeType.enumValues)[number];

export const assetType = pgEnum("asset_type", [
  "original",
  "generation",
  "vocals",
  "accompaniment",
  "bass",
  "drums",
  "guitar",
  "piano",
  "analysis",
  "analysis_sonic",
  "analysis_viz",
  "midi",
  "lyrics",
]);

export type AssetType = (typeof assetType.enumValues)[number];

export const asset = pgTable(
  "asset",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text()
      .notNull()
      .references(() => user.id, cascadingUpdateAndDelete),
    trackId: integer()
      .notNull()
      .references(() => track.id, cascadingUpdateAndDelete),
    name: text().unique().notNull(), // FK to S3 object name, cannot guarantee that users will actually upload files with their presigned URLs
    type: assetType(),
    mimeType: mimeType(),
    ...updateAndCreatedAt,
  },
  (table) => [index().on(table.userId), index().on(table.trackId)],
);

// our 'processing' -> received webhook of 'completed' event -> our 'succeeded' or 'failed' or 'canceled'
export const trackStatus = pgEnum("replicate_task_status", [
  "processing",
  "succeeded",
  "failed",
  "canceled",
]);

export type TrackStatus = (typeof trackStatus.enumValues)[number];

export const trackType = pgEnum("track_type", [
  "generation",
  "separation",
  "analysis",
  "midi",
  "lyrics",
]);

export type TrackType = (typeof trackType.enumValues)[number];

// Replicate's definitions:
// 'starting', // the prediction is starting up. If this status lasts longer than a few seconds, then it’s typically because a new worker is being started to run the prediction.
// 'processing', // the predict() method of the model is currently running.
// 'succeeded', // the prediction completed successfully.
// 'failed', // the prediction encountered an error during processing.
// 'canceled', // the prediction was canceled by its creator.

export const track = pgTable(
  "track",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text()
      .notNull()
      .references(() => user.id, cascadingUpdateAndDelete),
    name: text().notNull(),
    public: boolean().notNull().default(false),
    status: trackStatus(),
    type: trackType().notNull(),
    ...updateAndCreatedAt,
  },
  (table) => [index().on(table.userId)],
);

export const rate_limit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key"),
  count: integer("count"),
  lastRequest: bigint("last_request", { mode: "number" }),
});
