import { z } from "zod";
import { userSelectSchema } from "@/types/db/input";

export const signInFormSchema = userSelectSchema
  .pick({ email: true })
  .extend({
    email: z.email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters long",
      })
      .max(128, {
        message: "Password must be at most 128 characters long",
      }),
    rememberMe: z.boolean(),
  })
  .superRefine(({ password }, ctx) => {
    const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
    const containsLowercase = (ch: string) => /[a-z]/.test(ch);
    const containsSpecialChar = (ch: string) =>
      /[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~ ]/.test(ch);
    let countOfUpperCase = 0,
      countOfLowerCase = 0,
      countOfNumbers = 0,
      countOfSpecialChar = 0;

    for (let i = 0; i < password.length; i++) {
      const ch = password.charAt(i);
      if (!Number.isNaN(+ch)) countOfNumbers++;
      else if (containsUppercase(ch)) countOfUpperCase++;
      else if (containsLowercase(ch)) countOfLowerCase++;
      else if (containsSpecialChar(ch)) countOfSpecialChar++;
    }

    let errObj = {
      upperCase: {
        pass: true,
        message: "Password must contain at least one uppercase character.",
      },
      lowerCase: {
        pass: true,
        message: "Password must contain at least one lowercase character.",
      },
      specialCh: {
        pass: true,
        message: "Password must contain at least one special character.",
      },
      totalNumber: {
        pass: true,
        message: "Password must contain at least one numeric character.",
      },
    };

    if (countOfLowerCase < 1) {
      errObj = {
        ...errObj,
        lowerCase: { ...errObj.lowerCase, pass: false },
      };
    }
    if (countOfNumbers < 1) {
      errObj = {
        ...errObj,
        totalNumber: { ...errObj.totalNumber, pass: false },
      };
    }
    if (countOfUpperCase < 1) {
      errObj = {
        ...errObj,
        upperCase: { ...errObj.upperCase, pass: false },
      };
    }
    if (countOfSpecialChar < 1) {
      errObj = {
        ...errObj,
        specialCh: { ...errObj.specialCh, pass: false },
      };
    }

    if (
      countOfLowerCase < 1 ||
      countOfUpperCase < 1 ||
      countOfSpecialChar < 1 ||
      countOfNumbers < 1
    ) {
      for (const key in errObj) {
        if (!errObj[key as keyof typeof errObj].pass) {
          ctx.addIssue({
            code: "custom",
            path: ["password"],
            message: errObj[key as keyof typeof errObj].message,
          });
        }
      }
    }
  });

export type SignIn = z.infer<typeof signInFormSchema>;
