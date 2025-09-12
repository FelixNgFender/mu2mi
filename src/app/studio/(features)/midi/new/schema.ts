import { z } from "zod";
import { MIDI_ASSET_CONFIG } from "@/config";
import { midiSchema } from "@/types/replicate/input";

export const midiFormSchema = midiSchema.omit({ audio_file: true }).extend({
  files: z
    .unknown()
    .nullable()
    .transform((value) => {
      return value as FileList | null; // trick to get FileList (only available in browser env)
    })
    .transform((files, ctx) => {
      if (files === null) {
        ctx.addIssue({
          code: "custom",
          message: "Select at least one file",
          fatal: true,
        });
        return z.NEVER;
      }
      return Array.from(files);
    })
    .refine((files) => {
      return files.length <= MIDI_ASSET_CONFIG.maxNumFiles;
    }, `Max number of files is ${MIDI_ASSET_CONFIG.maxNumFiles}.`)
    .refine((files) => {
      return files.every(
        (file) => file.size <= MIDI_ASSET_CONFIG.maxFileSizeBytes,
        `Max file size is ${MIDI_ASSET_CONFIG.maxFileSizeBytes / 1024 / 1024} MB.`,
      );
    })
    .refine(
      (files) => {
        return files.every((file) =>
          MIDI_ASSET_CONFIG.allowedMimeTypes.includes(
            file.type as (typeof MIDI_ASSET_CONFIG.allowedMimeTypes)[number],
          ),
        );
      },
      `Only ${MIDI_ASSET_CONFIG.allowedFileTypes
        .map((type) => type.toUpperCase())
        .join(", ")} files are allowed.`,
    ),
});

export type MidiFormInput = z.input<typeof midiFormSchema>;
export type MidiFormOutput = z.output<typeof midiFormSchema>;
export const midiFormDefaultValues = midiFormSchema.parse({
  files: [new File([], "example.mp3", { type: "audio/mp3" })], // PLACEHOLDER to be replaced in actual form with null
});
