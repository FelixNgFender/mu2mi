import type { z } from "zod";
import { lyricsAssetSchema } from "@/config";
import { lyricsSchema } from "@/types/replicate/input";

export const lyricsFormSchema = lyricsSchema.omit({ audio: true }).extend({
  file: lyricsAssetSchema.describe(
    lyricsSchema.shape.audio.description || "File to upload",
  ),
});

export type LyricsFormInput = z.input<typeof lyricsFormSchema>;
export type LyricsFormOutput = z.output<typeof lyricsFormSchema>;
export const lyricsFormDefaultValues = lyricsFormSchema.parse({
  file: new File([], "example.mp3", { type: "audio/mp3" }), // PLACEHOLDER to be replaced in actual form with null
});
