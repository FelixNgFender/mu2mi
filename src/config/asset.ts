import { z } from "zod";
import { mimeType } from "@/types/db/schema";

export const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 50; // 50 MB
export const ALLOWED_MIME_TYPES = mimeType.enumValues;

interface AssetConfig {
  maxFileSizeBytes: Readonly<number>;
  allowedMimeTypes: ReadonlyArray<string>;
}

interface TrackAssetConfig extends AssetConfig {
  allowedFileTypes: ReadonlyArray<string>;
}

function buildOptionalTrackAssetSchema({
  maxFileSizeBytes,
  allowedMimeTypes,
  allowedFileTypes,
}: TrackAssetConfig) {
  return z
    .instanceof(File)
    .nullable()
    .refine(
      (file) => {
        if (!file) return true;
        return file.size <= maxFileSizeBytes;
      },
      `Max file size is ${maxFileSizeBytes / 1024 / 1024} MB.`,
    )
    .refine(
      (file) => {
        if (!file) return true;
        return allowedMimeTypes.includes(file.type);
      },
      `Only ${allowedFileTypes
        .map((type) => type.toUpperCase())
        .join(", ")} files are allowed.`,
    )
    .describe("File to upload");
}

function buildRequiredTrackAssetSchema({
  maxFileSizeBytes,
  allowedMimeTypes,
  allowedFileTypes,
}: TrackAssetConfig) {
  return z
    .instanceof(File)
    .nullable()
    .transform((val, ctx) => {
      if (val === null) {
        ctx.addIssue({
          code: "custom",
          message: "Select a file",
          fatal: true, // abort early on this error in order not to fall down to the next refine with a null value
        });
        return z.NEVER;
      }
      return val;
    })
    .refine(
      (file) => file.size <= maxFileSizeBytes,
      `Max file size is ${maxFileSizeBytes / 1024 / 1024} MB.`,
    )
    .refine(
      (file) => {
        return allowedMimeTypes.includes(file.type);
      },
      `Only ${allowedFileTypes
        .map((type) => type.toUpperCase())
        .join(", ")} files are allowed.`,
    )
    .describe("File to upload");
}

export const GENERATION_ALLOWED_MIME_TYPES = [
  "audio/mp3",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/flac",
  "audio/m4a",
] as const;

export const GENERATION_ALLOWED_FILE_TYPES = [
  "mp3",
  "ogg",
  "wav",
  "flac",
  "m4a",
] as const;

export const GENERATION_ASSET_CONFIG: Readonly<TrackAssetConfig> = {
  maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
  allowedMimeTypes: GENERATION_ALLOWED_MIME_TYPES,
  allowedFileTypes: GENERATION_ALLOWED_FILE_TYPES,
};

export const generationAssetSchema = buildOptionalTrackAssetSchema(
  GENERATION_ASSET_CONFIG,
);

export const SEPARATION_ALLOWED_MIME_TYPES = [
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
  "audio/flac",
  "audio/mp4",
  "audio/mov",
  "audio/wma",
] as const;

export const SEPARATION_ALLOWED_FILE_TYPES = [
  "mp3",
  "wav",
  "flac",
  "mp4",
  "mov",
  "wma",
];

export const SEPARATION_ASSET_CONFIG: Readonly<TrackAssetConfig> = {
  maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
  allowedMimeTypes: SEPARATION_ALLOWED_MIME_TYPES,
  allowedFileTypes: SEPARATION_ALLOWED_FILE_TYPES,
};

export const separationAssetSchema = buildRequiredTrackAssetSchema(
  SEPARATION_ASSET_CONFIG,
);

export const ANALYSIS_ALLOWED_MIME_TYPES = [
  "audio/mp3",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/flac",
  "audio/m4a",
] as const;

export const ANALYSIS_ALLOWED_FILE_TYPES = [
  "mp3",
  "ogg",
  "wav",
  "flac",
  "m4a",
] as const;

export const ANALYSIS_ASSET_CONFIG: Readonly<TrackAssetConfig> = {
  maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
  allowedMimeTypes: ANALYSIS_ALLOWED_MIME_TYPES,
  allowedFileTypes: ANALYSIS_ALLOWED_FILE_TYPES,
};

export const analysisAssetSchema = buildRequiredTrackAssetSchema(
  ANALYSIS_ASSET_CONFIG,
);

interface MidiAssetConfig extends TrackAssetConfig {
  maxNumFiles: number;
}
export const MIDI_ALLOWED_MIME_TYPES = [
  "audio/mp3",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/flac",
  "audio/m4a",
] as const;

export const MIDI_ALLOWED_FILE_TYPES = [
  "mp3",
  "ogg",
  "wav",
  "flac",
  "m4a",
] as const;

export const MIDI_MAX_NUM_FILES = 5;

export const MIDI_ASSET_CONFIG: Readonly<MidiAssetConfig> = {
  maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
  allowedMimeTypes: MIDI_ALLOWED_MIME_TYPES,
  allowedFileTypes: MIDI_ALLOWED_FILE_TYPES,
  maxNumFiles: MIDI_MAX_NUM_FILES,
};

export const LYRICS_ALLOWED_MIME_TYPES = [
  "audio/mp3",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/flac",
  "audio/m4a",
] as const;

export const LYRICS_ALLOWED_FILE_TYPES = [
  "mp3",
  "ogg",
  "wav",
  "flac",
  "m4a",
] as const;

export const LYRICS_ASSET_CONFIG: Readonly<TrackAssetConfig> = {
  maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
  allowedMimeTypes: LYRICS_ALLOWED_MIME_TYPES,
  allowedFileTypes: LYRICS_ALLOWED_FILE_TYPES,
};

export const lyricsAssetSchema =
  buildRequiredTrackAssetSchema(LYRICS_ASSET_CONFIG);
