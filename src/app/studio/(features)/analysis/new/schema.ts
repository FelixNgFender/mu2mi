import type { z } from "zod";
import { analysisAssetSchema } from "@/config";
import { analysisSchema } from "@/types/replicate/input";

export const analysisFormSchema = analysisSchema
  .omit({ music_input: true })
  .extend({
    file: analysisAssetSchema.describe(
      analysisSchema.shape.music_input.description || "File to upload",
    ),
  });

export type AnalysisFormInput = z.input<typeof analysisFormSchema>;
export type AnalysisFormOutput = z.output<typeof analysisFormSchema>;
export const analysisFormDefaultValues = analysisFormSchema.parse({
  file: new File([], "example.mp3", { type: "audio/mp3" }), // PLACEHOLDER to be replaced in actual form with null
});
