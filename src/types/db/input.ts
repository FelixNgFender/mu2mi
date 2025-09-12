import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { account, asset, track, user } from "./schema";

export const userSelectSchema = createSelectSchema(user);
export const userInsertSchema = createInsertSchema(user);
export const userUpdateSchema = createUpdateSchema(user);
export const accountUpdateSchema = createUpdateSchema(account);
export const trackSelectSchema = createSelectSchema(track);
export const trackInsertSchema = createInsertSchema(track);
export const trackUpdateSchema = createUpdateSchema(track);
export const assetSelectSchema = createSelectSchema(asset);
export const assetInsertSchema = createInsertSchema(asset);
