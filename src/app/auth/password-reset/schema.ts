import { z } from "zod";
import { userUpdateSchema } from "@/types/db/input";

export const passwordResetFormSchema = userUpdateSchema
  .pick({ email: true })
  .extend({
    email: z.email({ message: "Invalid email address." }),
  });

export type PasswordReset = z.infer<typeof passwordResetFormSchema>;
