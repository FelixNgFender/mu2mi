import { z } from "zod";

export const editTrackFormSchema = z.object({
  name: z.string(),
  public: z.boolean().optional(),
});

export type EditTrackFormType = z.infer<typeof editTrackFormSchema>;
