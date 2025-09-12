import type { z } from "zod";
import { separationAssetSchema } from "@/config";
import { separationSchema } from "@/types/replicate/input";

export const separationFormSchema = separationSchema
  .omit({ audio: true })
  .extend({
    file: separationAssetSchema.describe(
      separationSchema.shape.audio.description || "File to upload",
    ),
  });

export type SeparationFormInput = z.input<typeof separationFormSchema>;
export type SeparationFormOutput = z.output<typeof separationFormSchema>;
export const separationDefaultValues = separationFormSchema.parse({
  file: new File([], "example.mp3", { type: "audio/mp3" }), // PLACEHOLDER to be replaced in actual form with null
});
