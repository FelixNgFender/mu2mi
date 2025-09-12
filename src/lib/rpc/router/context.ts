import { os } from "@orpc/server";
import { headers } from "next/headers";
import type { Logger } from "pino";
import type { RateLimiterPostgres } from "rate-limiter-flexible";
import { z } from "zod";
import { env } from "@/env";
import type { DB } from "@/infra";
import type { Session } from "@/lib/auth/client";
import { httpStatus } from "@/lib/http";
import { logger } from "@/lib/logger";

type ReadonlyHeaders = Awaited<ReturnType<typeof headers>>;
type BaseContext = {
  headers: ReadonlyHeaders;
  env: typeof env;
  logger: Logger;
};

/**
 * Initial context that provides request-indenpendent information to any procedure/middleware that need them.
 *
 * With type-safe error handling for clients: https://orpc.unnoq.com/docs/advanced/validation-errors#type%E2%80%90safe-validation-errors
 *
 * Must conform with the initial context provided in the RPC catch-all route.
 */
export const base = os.$context<BaseContext>().errors({
  INPUT_VALIDATION_FAILED: {
    status: httpStatus.clientError.unprocessableEntity.code,
    message: httpStatus.clientError.unprocessableEntity.humanMessage,
    data: z.object({
      formErrors: z.array(z.string()),
      fieldErrors: z.record(z.string(), z.array(z.string()).optional()),
    }),
  },
});

export async function createBaseContext(): Promise<BaseContext> {
  return {
    headers: await headers(),
    env,
    logger: logger.child({ module: "lib/rpc/router/context" }),
  };
}

type DatabaseContext = BaseContext & {
  db: DB;
};

export const dbContext = os.$context<DatabaseContext>();

type RateLimitContext = DatabaseContext & {
  rateLimit: {
    trackProcessing: RateLimiterPostgres;
  };
  session: Session;
};

export const rateLimitContext = os.$context<RateLimitContext>();
