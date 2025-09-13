import type { InferRouterOutputs } from "@orpc/server";
import z from "zod";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/config/asset";
import { httpStatus } from "@/lib/http";
import { generateObjectKey } from "@/lib/utils";
import assetModel from "@/model/asset";
import trackModel from "@/model/track";
import { base } from "../context";
import { dbProvider, fileStorageProvider, requiresAuth } from "../middleware";

const create = base
  .use(dbProvider)
  .input(assetModel.createSchema)
  .handler(async ({ input, context }) => {
    const createdAsset = await assetModel.create(context.db, input);
    context.logger.info({ createdAsset }, "created asset");
    return createdAsset;
  });

const uploadToFileStorageSchema = z.object({
  objectName: z.string(),
  fileData: z.instanceof(Buffer),
  length: z.number(),
  mimeType: z.string(),
});

const uploadToFileStorage = base
  .use(requiresAuth)
  .use(fileStorageProvider)
  .input(uploadToFileStorageSchema)
  .handler(async ({ context, input }) => {
    const uploadedObjectInfo = await context.fileStorage.putObject(
      context.env.S3_BUCKET_NAME,
      input.objectName,
      input.fileData,
      input.fileData.length,
      {
        "Content-Type": input.mimeType,
      },
    );

    context.logger.info({ uploadedObjectInfo }, "uploaded to file storage");
  });

const downloadUserTrackAssets = base
  .use(requiresAuth)
  .use(dbProvider)
  .use(fileStorageProvider)
  .input(trackModel.findSchema)
  .errors({
    INTERNAL_SERVER_ERROR: {
      message: httpStatus.serverError.internal.humanMessage,
    },
    NOT_FOUND: { message: httpStatus.clientError.notFound.humanMessage },
    UNAUTHORIZED: {
      message: "Sorry, you are not allowed to view this track" as const,
    },
  })
  .handler(async ({ context, input, errors }) => {
    const [track, trackAssets] = await Promise.all([
      trackModel.find(context.db, input),
      assetModel.findTrackAssets(context.db, input),
    ]);
    if (!track) {
      throw errors.NOT_FOUND();
    }

    if (
      !track.public &&
      trackAssets.some((asset) => asset.userId !== context.session.user.id)
    ) {
      throw errors.UNAUTHORIZED();
    }

    const promises = trackAssets.map(async (asset) => {
      const url = await context.fileStorage
        .presignedGetObject(
          context.env.S3_BUCKET_NAME,
          asset.name,
          context.env.S3_PRESIGNED_URL_EXPIRATION_S,
        )
        .catch((error) => {
          throw errors.INTERNAL_SERVER_ERROR({ data: { error } });
        });
      return { id: asset.id, url, type: asset.type };
    });
    const assets = await Promise.all(promises);
    context.logger.info({ assets }, "downloaded user track assets");
    return assets;
  });

export type AssetsWithPresignedUrl = InferRouterOutputs<
  typeof downloadUserTrackAssets
>;

const downloadPublicTrackAssets = base
  .use(dbProvider)
  .use(fileStorageProvider)
  .input(trackModel.findSchema)
  .errors({
    INTERNAL_SERVER_ERROR: {
      message: httpStatus.serverError.internal.humanMessage,
    },
    NOT_FOUND: { message: httpStatus.clientError.notFound.humanMessage },
    UNAUTHORIZED: {
      message: "Sorry, you are not allowed to view this track" as const,
    },
  })
  .handler(async ({ context, input, errors }) => {
    const [track, trackAssets] = await Promise.all([
      trackModel.find(context.db, input),
      assetModel.findTrackAssets(context.db, input),
    ]);
    if (!track) {
      throw errors.NOT_FOUND();
    }
    if (!track.public) {
      throw errors.UNAUTHORIZED();
    }
    const promises = trackAssets.map(async (asset) => {
      const url = await context.fileStorage
        .presignedGetObject(
          context.env.S3_BUCKET_NAME,
          asset.name,
          context.env.S3_PRESIGNED_URL_EXPIRATION_S,
        )
        .catch((error) => {
          throw errors.INTERNAL_SERVER_ERROR({ data: { error } });
        });
      return { id: asset.id, url, type: asset.type };
    });
    const assets = await Promise.all(promises);
    context.logger.info({ assets }, "downloaded public track assets");
    return assets;
  });

const getPresignedUrlSchema = z.object({
  type: z.enum(ALLOWED_MIME_TYPES),
  size: z.number().max(MAX_FILE_SIZE_BYTES),
  extension: z.string(),
  checksum: z.string(),
});

const generatePresignedUrl = base
  .use(requiresAuth)
  .use(dbProvider)
  .use(fileStorageProvider)
  .input(getPresignedUrlSchema)
  .errors({
    INTERNAL_SERVER_ERROR: {
      message: "Failed to create asset",
    },
  })
  .handler(async ({ context, input, errors }) => {
    const objectName = generateObjectKey(input.extension);
    const url = await context.fileStorage.presignedPutObject(
      context.env.S3_BUCKET_NAME,
      objectName,
      context.env.S3_PRESIGNED_URL_EXPIRATION_S,
    );

    const newAsset = await assetModel.create(context.db, {
      userId: context.session.user.id,
      // NOTE: we put faith in the client to actually upload the file to S3
      // better solution would be set up a trigger on the S3 bucket to create the asset
      name: objectName,
      mimeType: input.type,
      type: "original",
    });

    if (!newAsset) {
      throw errors.INTERNAL_SERVER_ERROR();
    }

    context.logger.info(
      { newAsset, url },
      "created presigned url for new asset",
    );
    return {
      url,
      assetId: newAsset.id,
    };
  });

export default {
  create,
  uploadToFileStorage,
  downloadUserTrackAssets,
  downloadPublicTrackAssets,
  generatePresignedUrl,
};
