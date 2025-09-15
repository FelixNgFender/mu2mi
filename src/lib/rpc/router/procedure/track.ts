import { os } from "@orpc/server";
import { httpStatus } from "@/lib/http";
import assetModel from "@/model/asset";
import trackModel from "@/model/track";
import { assetSelectSchema, trackSelectSchema } from "@/types/db/input";
import {
  analysisSchema,
  generationSchema,
  lyricsSchema,
  midiSchema,
  separationSchema,
} from "@/types/replicate/input";
import { base } from "../context";
import {
  dbProvider,
  fileStorageProvider,
  publicFileStorageProvider,
  rateLimitProvider,
  rateLimitTrackProcessing,
  replicateProvider,
  requiresAuth,
} from "../middleware";

const find = os
  .use(dbProvider)
  .input(trackModel.findSchema)
  .handler(async ({ context, input }) => {
    return await trackModel.find(context.db, input);
  });

const findUserTracks = base
  .use(requiresAuth)
  .use(dbProvider)
  .handler(async ({ context }) => {
    return trackModel.findUserTracks(context.session.user.id);
  });

const generateMusicSchema = generationSchema
  .omit({
    input_audio: true,
  })
  .extend({
    name: trackSelectSchema.shape.name,
    assetId: assetSelectSchema.shape.id.optional(),
  });

export const generateMusic = base
  .use(requiresAuth)
  .use(dbProvider)
  .use(publicFileStorageProvider)
  .use(rateLimitProvider)
  .use(rateLimitTrackProcessing)
  .use(replicateProvider)
  .input(generateMusicSchema)
  .errors({
    INTERNAL_SERVER_ERROR: {
      message: httpStatus.serverError.internal.humanMessage,
    },
  })
  .handler(async ({ context, input, errors }) => {
    if (input.assetId) {
      const newTrack = await trackModel.createOneAndUpdateAsset(context.db, {
        userId: context.session.user.id,
        status: "processing",
        type: "generation",
        name: input.name,
        assetId: input.assetId,
      });

      if (!newTrack) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Failed to create track",
        });
      }

      const url = await context.publicFileStorage.presignedGetObject(
        context.env.S3_BUCKET_NAME,
        newTrack.assetName,
        context.env.S3_PRESIGNED_URL_EXPIRATION_S,
      );

      const prediction = await context.replicate.generateMusic({
        ...input,
        trackId: newTrack.trackId,
        userId: context.session.user.id,
        input_audio: url,
      });

      context.logger.info(
        { newTrack, url, prediction },
        "generate music with asset result",
      );
      return;
    }

    const newTrack = await trackModel.create(context.db, {
      userId: context.session.user.id,
      status: "processing",
      name: input.name,
      type: "generation",
    });

    if (!newTrack) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create track",
      });
    }

    const prediction = await context.replicate.generateMusic({
      ...input,
      trackId: newTrack.id,
      userId: context.session.user.id,
    });

    context.logger.info({ newTrack, prediction }, "generate music result");
  });

const analyzeTrackSchema = analysisSchema
  .omit({
    music_input: true,
  })
  .extend({
    name: trackSelectSchema.shape.name,
    assetId: assetSelectSchema.shape.id,
  });

export const analyzeTrack = base
  .use(requiresAuth)
  .use(dbProvider)
  .use(publicFileStorageProvider)
  .use(rateLimitProvider)
  .use(rateLimitTrackProcessing)
  .use(replicateProvider)
  .input(analyzeTrackSchema)
  .errors({
    INTERNAL_SERVER_ERROR: {
      message: httpStatus.serverError.internal.humanMessage,
    },
  })
  .handler(async ({ context, input, errors }) => {
    const newTrack = await trackModel.createOneAndUpdateAsset(context.db, {
      userId: context.session.user.id,
      status: "processing",
      type: "analysis",
      name: input.name,
      assetId: input.assetId,
    });

    if (!newTrack) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create track",
      });
    }

    const url = await context.publicFileStorage.presignedGetObject(
      context.env.S3_BUCKET_NAME,
      newTrack.assetName,
      context.env.S3_PRESIGNED_URL_EXPIRATION_S,
    );

    const prediction = await context.replicate.analyzeTrack({
      ...input,
      trackId: newTrack.trackId,
      userId: context.session.user.id,
      music_input: url,
    });

    context.logger.info({ url, newTrack, prediction }, "analyze track result");
  });

const transcribeLyricsSchema = lyricsSchema
  .omit({
    audio: true,
  })
  .extend({
    name: trackSelectSchema.shape.name,
    assetId: assetSelectSchema.shape.id,
  });

const transcribeLyrics = base
  .use(requiresAuth)
  .use(dbProvider)
  .use(publicFileStorageProvider)
  .use(rateLimitProvider)
  .use(rateLimitTrackProcessing)
  .use(replicateProvider)
  .errors({
    INTERNAL_SERVER_ERROR: {
      message: httpStatus.serverError.internal.humanMessage,
    },
  })
  .input(transcribeLyricsSchema)
  .handler(async ({ context, input, errors }) => {
    const newTrack = await trackModel.createOneAndUpdateAsset(context.db, {
      userId: context.session.user.id,
      status: "processing",
      type: "lyrics",
      name: input.name,
      assetId: input.assetId,
    });

    if (!newTrack) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create track",
      });
    }

    const url = await context.publicFileStorage.presignedGetObject(
      context.env.S3_BUCKET_NAME,
      newTrack.assetName,
      context.env.S3_PRESIGNED_URL_EXPIRATION_S,
    );

    const prediction = await context.replicate.transcribeLyrics({
      ...input,
      trackId: newTrack.trackId,
      userId: context.session.user.id,
      audio: url,
    });

    context.logger.info(
      { url, newTrack, prediction },
      "transcribe lyrics result",
    );
  });

const transcribeMidiSchema = midiSchema
  .omit({
    audio_file: true,
  })
  .extend({
    name: trackSelectSchema.shape.name,
    assetId: assetSelectSchema.shape.id,
  });

const transcribeMidi = base
  .use(requiresAuth)
  .use(dbProvider)
  .use(publicFileStorageProvider)
  .use(rateLimitProvider)
  .use(rateLimitTrackProcessing)
  .use(replicateProvider)
  .errors({
    INTERNAL_SERVER_ERROR: {
      message: httpStatus.serverError.internal.humanMessage,
    },
  })
  .input(transcribeMidiSchema)
  .handler(async ({ context, input, errors }) => {
    const newTrack = await trackModel.createOneAndUpdateAsset(context.db, {
      userId: context.session.user.id,
      status: "processing",
      type: "midi",
      name: input.name,
      assetId: input.assetId,
    });

    if (!newTrack) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create track",
      });
    }

    const url = await context.publicFileStorage.presignedGetObject(
      context.env.S3_BUCKET_NAME,
      newTrack.assetName,
      context.env.S3_PRESIGNED_URL_EXPIRATION_S,
    );

    const prediction = await context.replicate.transcribeMidi({
      ...input,
      trackId: newTrack.trackId,
      userId: context.session.user.id,
      audio_file: url,
    });

    context.logger.info(
      { url, newTrack, prediction },
      "transcribe midi result",
    );
  });

const separateTrackSchema = separationSchema
  .omit({
    audio: true,
  })
  .extend({
    name: trackSelectSchema.shape.name,
    assetId: assetSelectSchema.shape.id,
  });

const separateTrack = base
  .use(requiresAuth)
  .use(dbProvider)
  .use(publicFileStorageProvider)
  .use(rateLimitProvider)
  .use(rateLimitTrackProcessing)
  .use(replicateProvider)
  .errors({
    INTERNAL_SERVER_ERROR: {
      message: httpStatus.serverError.internal.humanMessage,
    },
  })
  .input(separateTrackSchema)
  .handler(async ({ context, input, errors }) => {
    const newTrack = await trackModel.createOneAndUpdateAsset(context.db, {
      userId: context.session.user.id,
      status: "processing",
      type: "separation",
      name: input.name,
      assetId: input.assetId,
    });

    if (!newTrack) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create track",
      });
    }

    const url = await context.publicFileStorage.presignedGetObject(
      context.env.S3_BUCKET_NAME,
      newTrack.assetName,
      context.env.S3_PRESIGNED_URL_EXPIRATION_S,
    );

    const prediction = await context.replicate.separateTrack({
      ...input,
      trackId: newTrack.trackId,
      userId: context.session.user.id,
      audio: url,
    });

    context.logger.info({ url, newTrack, prediction }, "separate track result");
  });

const update = base
  .use(dbProvider)
  .input(trackModel.updateSchema)
  .handler(async ({ context, input }) => {
    context.logger.info({ input }, "updating track");
    await trackModel.update(context.db, input);
  });

const updateUserTrack = base
  .use(requiresAuth)
  .use(dbProvider)
  .input(trackModel.updateSchema)
  .errors({
    NOT_FOUND: { message: httpStatus.clientError.notFound.humanMessage },
    UNAUTHORIZED: {
      message: "Sorry, you are not allowed to edit this track",
    },
  })
  .handler(async ({ context, input, errors }) => {
    const track = await trackModel.find(context.db, { id: input.trackId });
    if (!track) {
      throw errors.NOT_FOUND();
    }
    if (track.userId !== context.session.user.id) {
      throw errors.UNAUTHORIZED();
    }
    context.logger.info({ input }, "updating user track");
    await trackModel.update(context.db, input);
  });

const deleteUserTrack = base
  .use(requiresAuth)
  .use(dbProvider)
  .use(fileStorageProvider)
  .input(trackModel.removeSchema)
  .errors({
    NOT_FOUND: { message: httpStatus.clientError.notFound.humanMessage },
    UNAUTHORIZED: {
      message: "Sorry, you are not allowed to delete this track",
    },
  })
  .handler(async ({ context, input, errors }) => {
    const assets = await assetModel.findTrackAssets(context.db, input);
    if (assets.some((asset) => asset.userId !== context.session.user.id)) {
      throw errors.UNAUTHORIZED();
    }

    const [removeObjectsResponse] = await Promise.all([
      context.fileStorage.removeObjects(
        context.env.S3_BUCKET_NAME,
        assets.map((asset) => asset.name),
      ),
      trackModel.remove(context.db, input), // cascades to asset table
    ]);

    context.logger.info(
      { trackId: input.id, removeObjectsResponse },
      "deleted track and related assets",
    );
  });

export default {
  find,
  findUserTracks,
  generateMusic,
  analyzeTrack,
  transcribeLyrics,
  transcribeMidi,
  separateTrack,
  update,
  updateUserTrack,
  deleteUserTrack,
};
