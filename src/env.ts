import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isString = z.string().min(1);
const isBoolean = z.string().transform((s) => s !== "false" && s !== "0");
const isNumber = z.coerce.number();

/**
 * Centralized environment variables for the application.
 */
export const env = createEnv({
  server: {
    // general
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    NEXT_MANUAL_SIG_HANDLE: isBoolean.default(true),
    NEXT_TELEMETRY_DISABLED: isBoolean.default(true),
    NEXT_RUNTIME: z.enum(["nodejs"]).default("nodejs"),
    PROTOCOL: z.enum(["http", "https"]).default("http"),
    HOSTNAME: isString.default("localhost"),
    APP_PORT: isNumber.default(3000),

    // logging
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),

    // rate limiting
    ENABLE_RATE_LIMIT: isBoolean.default(false),

    // authentication
    BETTER_AUTH_SECRET: isString,
    BETTER_AUTH_LOG_LEVEL: z
      .enum(["info", "warn", "error", "debug"])
      .default("info"),
    GOOGLE_CLIENT_ID: isString,
    GOOGLE_CLIENT_SECRET: isString,
    GOOGLE_OAUTH_REDIRECT_URI: isString.optional(),
    GITHUB_CLIENT_ID: isString,
    GITHUB_CLIENT_SECRET: isString,
    GITHUB_OAUTH_REDIRECT_URI: isString.optional(),

    // email
    ENABLE_EMAIL: isBoolean.default(false),
    AWS_REGION: isString.optional(),
    AWS_ACCESS_KEY_ID: isString.optional(),
    AWS_SECRET_ACCESS_KEY: isString.optional(),

    // analytics
    ENABLE_ANALYTICS: isBoolean.default(false),
    UMAMI_SCRIPT_URL: isString.optional(),
    UMAMI_ANALYTICS_ID: isString.optional(),

    // file storage
    S3_ENDPOINT: isString.default("localhost"),
    S3_PORT: isNumber.default(9000),
    S3_PUBLIC_ENDPOINT: isString,
    S3_PUBLIC_PORT: isNumber.default(443),
    S3_ACCESS_KEY: isString.default("minio"),
    S3_SECRET_KEY: isString.default("miniosecret"),
    S3_BUCKET_NAME: isString.default("mu2mi-assets"),
    S3_PRESIGNED_URL_EXPIRATION_S: isNumber.default(900),

    // database
    DATABASE_URL: z
      .url()
      .default("postgresql://postgres:awesomepassword@127.0.0.1:5432/postgres"),
    DATABASE_LOGGING: isBoolean.default(true),

    // replicate
    REPLICATE_API_TOKEN: isString,
    REPLICATE_WEBHOOK_SECRET: isString,
    MUSIC_GENERATION_MODEL_VERSION: isString.default(
      "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
    ),
    TRACK_SEPARATION_MODEL_VERSION: isString.default(
      "5a7041cc9b82e5a558fea6b3d7b12dea89625e89da33f0447bd727c2d0ab9e77",
    ),
    TRACK_ANALYSIS_MODEL_VERSION: isString.default(
      "001b4137be6ac67bdc28cb5cffacf128b874f530258d033de23121e785cb7290",
    ),
    MIDI_TRANSCRIPTION_MODEL_VERSION: isString.default(
      "a7cf33cf63fca9c71f2235332af5a9fdfb7d23c459a0dc429daa203ff8e80c78",
    ),
    LYRICS_TRANSCRIPTION_MODEL_VERSION: isString.default(
      "3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
    ),

    // captcha
    CAPTCHA_SECRET_KEY: isString.optional(),
  },
  client: {
    // captcha
    NEXT_PUBLIC_ENABLE_CAPTCHA: isBoolean.default(false),
    NEXT_PUBLIC_CAPTCHA_SITE_KEY: isString.optional(),
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ENABLE_CAPTCHA: process.env.NEXT_PUBLIC_ENABLE_CAPTCHA,
    NEXT_PUBLIC_CAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,
  },

  createFinalSchema: (shape) =>
    z.object(shape).transform((env, ctx) => {
      if (
        env.ENABLE_EMAIL &&
        (!env.AWS_REGION ||
          !env.AWS_ACCESS_KEY_ID ||
          !env.AWS_SECRET_ACCESS_KEY)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "AWS credentials are required if ENABLE_EMAIL is true",
        });
        return z.NEVER;
      }

      if (
        env.ENABLE_ANALYTICS &&
        (!env.UMAMI_SCRIPT_URL || !env.UMAMI_ANALYTICS_ID)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Umami configs are required if ENABLE_ANALYTICS is true",
        });
        return z.NEVER;
      }

      // TODO: not sure why validation is causing error on client-side
      // prolly because CAPTCHA_SECRET_KEY is server-only so it's stripped?
      // if (
      //   env.NEXT_PUBLIC_ENABLE_CAPTCHA &&
      //   (!env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || !env.CAPTCHA_SECRET_KEY)
      // ) {
      //   ctx.addIssue({
      //     code: "custom",
      //     message:
      //       "Captcha configs are required if NEXT_PUBLIC_ENABLE_CAPTCHA is true",
      //   });
      //   return z.NEVER;
      // }

      const baseUrl = `${env.PROTOCOL}://${env.HOSTNAME}:${env.APP_PORT}`;
      return {
        ...env,
        // derived properties
        BASE_URL: baseUrl,
        BETTER_AUTH_URL: baseUrl,
      };
    }),
});
