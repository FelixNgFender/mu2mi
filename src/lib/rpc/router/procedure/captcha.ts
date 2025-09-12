import type { TurnstileServerValidationResponse } from "@marsidev/react-turnstile";
import z from "zod";
import { base } from "../context";

const VERIFY_ENDPOINT =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Secret key	Description
// 1x0000000000000000000000000000000AA	Always passes
// 2x0000000000000000000000000000000AA	Always fails
// 3x0000000000000000000000000000000AA	Yields a “token already spent” error

const verify = base
  .input(
    z.object({
      token: z.string().min(1).describe("The token to verify"),
    }),
  )
  .handler(async ({ context, input }) => {
    const secret =
      context.env.CAPTCHA_SECRET_KEY || "1x0000000000000000000000000000000AA";
    const res = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      body: `secret=${encodeURIComponent(
        secret,
      )}&response=${encodeURIComponent(input.token)}`,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    return (await res.json()) as TurnstileServerValidationResponse;
  });

export default {
  verify,
};
