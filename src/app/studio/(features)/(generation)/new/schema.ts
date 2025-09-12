import type { z } from "zod";
import { generationAssetSchema } from "@/config";
import { generationSchema } from "@/types/replicate/input";

export const generationFormSchema = generationSchema
  .omit({ input_audio: true })
  .safeExtend({
    file: generationAssetSchema.describe(
      generationSchema.shape.input_audio.description || "File to upload",
    ),
  })
  .refine((data) => data.prompt.length !== 0, {
    message: "Please enter a prompt",
    path: ["prompt"],
  });

export type GenerationFormInput = z.input<typeof generationFormSchema>;
export type GenerationFormOutput = z.output<typeof generationFormSchema>;
export const generationFormDefaultValues = generationFormSchema.parse({
  prompt: "110bpm 64kbps 16khz lofi hiphop summer smooth",
  file: null,
});
