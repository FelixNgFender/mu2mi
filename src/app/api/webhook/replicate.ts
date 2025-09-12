import path from "node:path";
import type { NextRequest } from "next/server";
import { validateWebhook } from "replicate";
import z from "zod";
import { env } from "@/env";
import { logger } from "@/lib/logger";
import { badRequest, success, unauthorized } from "@/lib/response";
import { client } from "@/lib/rpc";
import { generateObjectKey } from "@/lib/utils";
import type { AssetType, MimeType } from "@/types/db/schema";
import { webhookMetadataSchema } from "@/types/replicate/input";
import type { ReplicateWebhookBodyTypes } from "@/types/replicate/output";

const log = logger.child({ module: "app/api/webhook/replicate" });

export const replicateWebhookHandler = async <
  T extends ReplicateWebhookBodyTypes,
>(
  request: NextRequest,
  trackType?: AssetType,
) => {
  // https://replicate.com/docs/webhooks#verifying-webhooks
  const webhookIsValid = await validateWebhook(
    request.clone(),
    env.REPLICATE_WEBHOOK_SECRET,
  );
  if (!webhookIsValid) {
    log.warn({}, "invalid webhook signature");
    return unauthorized();
  }

  const body = await request.json();
  const searchParams = request.nextUrl.searchParams;
  const parsedParams = webhookMetadataSchema.safeParse(
    Object.fromEntries(searchParams),
  );

  if (!parsedParams.success) {
    log.warn({ searchParams }, "invalid webhook metadata");
    return badRequest(z.treeifyError(parsedParams.error));
  }

  const { trackId, userId } = parsedParams.data;
  // TODO: zod
  const { status, output, error } = body as T;

  if (error) {
    const { error: updateTrackError } = await client.track.update({
      trackId,
      status: "failed",
    });
    if (updateTrackError) {
      log.error(updateTrackError, "unknown error while updating track");
    }
    log.error({ error }, "track processing failed with error");
    return success();
  }

  const { error: findTrackError, data: track } = await client.track.find({
    id: trackId,
  });
  if (findTrackError) {
    log.error(findTrackError, "failed to find track with unknown error");
    return success();
  }

  if (!track) {
    log.error({}, "failed to find track");
    return success();
  }

  if (track.status === "succeeded" || status === "starting") {
    return success();
  }

  if (
    track.status === "processing" &&
    (status === "failed" || status === "canceled")
  ) {
    const { error: updateTrackError } = await client.track.update({
      trackId,
      status,
    });
    if (updateTrackError) {
      log.error(updateTrackError, "unknown error while updating track");
    }
    log.error({ status }, "error while processing track");
    return success();
  }

  if (track.status === "processing" && status === "succeeded" && output) {
    if (typeof output === "string") {
      await saveAssetAndMetadata(trackId, userId, output, trackType);
    } else if (Array.isArray(output)) {
      await Promise.all(
        output.map(async (url) => {
          if (url) {
            const extension = path.extname(url);
            switch (extension) {
              case ".json": {
                await saveAssetAndMetadata(trackId, userId, url, "analysis");
                break;
              }
              case ".png": {
                await saveAssetAndMetadata(
                  trackId,
                  userId,
                  url,
                  "analysis_viz",
                );
                break;
              }
              case ".mp3": {
                await saveAssetAndMetadata(
                  trackId,
                  userId,
                  url,
                  "analysis_sonic",
                );
                break;
              }
            }
          }
        }),
      );
    } else if (typeof output === "object" && "other" in output) {
      await Promise.all(
        Object.entries(output).map(async ([stem, url]) => {
          if (url && typeof url === "string") {
            await saveAssetAndMetadata(trackId, userId, url, stem as AssetType);
          }
        }),
      );
    } else {
      await saveAssetAndMetadata(trackId, userId, output, "lyrics");
    }
    const { error: updateTrackError } = await client.track.update({
      trackId,
      status,
    });
    if (updateTrackError) {
      log.error(updateTrackError, "unknown error while updating track");
    }
  }
  log.info({ trackId, status }, "track processing update");
  return success();
};

const saveAssetAndMetadata = async (
  trackId: number,
  userId: string,
  data: string | Record<string, unknown>,
  trackType?: AssetType,
) => {
  let objectName: string;
  let mimeType: string;
  let fileData: Buffer;

  if (typeof data === "string") {
    const blob = await fetch(data).then((res) => res.blob());
    objectName = generateObjectKey(path.extname(data));
    mimeType = blob.type === "" ? "application/octet-stream" : blob.type;
    fileData = Buffer.from(await blob.arrayBuffer());
  } else {
    objectName = generateObjectKey(".json");
    mimeType = "application/json";
    fileData = Buffer.from(JSON.stringify(data));
  }

  const { error } = await client.asset.uploadToFileStorage({
    objectName,
    fileData,
    length: fileData.length,
    mimeType,
  });
  if (error) {
    log.error(error, "failed to upload file to file storage");
  }

  const { error: createAssetError } = await client.asset.create({
    userId,
    name: objectName,
    mimeType: mimeType as MimeType,
    trackId,
    type: trackType,
  });
  if (createAssetError) {
    log.error(createAssetError, "failed to create asset in database");
  }
};
