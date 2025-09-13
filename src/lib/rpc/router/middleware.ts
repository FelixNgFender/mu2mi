import { trace } from "@opentelemetry/api";
import { os } from "@orpc/server";
import { db, fileStorage, replicate } from "@/infra";
import { auth } from "@/lib/auth/server";
import { httpStatus } from "@/lib/http";
import { createTrackProcessingRateLimiter } from "@/lib/rate-limit";
import { base, dbContext, rateLimitContext } from "./context";

export const requiresAuth = base
  .errors({
    UNAUTHORIZED: {
      message: httpStatus.clientError.unauthorized.humanMessage, // default message
    },
  })
  .middleware(async ({ context, errors, next }) => {
    const session = await auth.api.getSession({ headers: context.headers });
    if (!session) {
      throw errors.UNAUTHORIZED();
    }

    const span = trace.getActiveSpan();
    span?.setAttribute("mu2mi.user.id", session.user.id);
    span?.setAttribute("mu2mi.user.email", session.user.email ?? "unknown");
    span?.addEvent("authenticated user");

    return await next({
      context: {
        // Pass additional context
        session,
      },
    });
  });

Object.defineProperty(requiresAuth, "name", {
  value: "requiresAuthMiddleware",
});

export const dbProvider = os.middleware(async ({ next }) => {
  return await next({
    context: {
      db,
    },
  });
});

export const rateLimitProvider = dbContext.middleware(
  async ({ context, next }) => {
    return await next({
      context: {
        rateLimit: {
          trackProcessing: createTrackProcessingRateLimiter(context.db.$client),
        },
      },
    });
  },
);

export const rateLimitTrackProcessing = rateLimitContext
  .errors({
    TOO_MANY_REQUESTS: {
      message: httpStatus.clientError.tooManyRequests.humanMessage,
    },
  })
  .middleware(async ({ context, next, errors }) => {
    if (!context.env.ENABLE_RATE_LIMIT) {
      return await next();
    }
    const rateLimitRes = await context.rateLimit.trackProcessing.penalty(
      context.session.user.id,
    );
    context.logger.info(
      { rateLimitRes, userId: context.session.user.id },
      "rate limit status",
    );

    const span = trace.getActiveSpan();
    span?.setAttribute(
      "mu2mi.rate_limit.track_processing.remaining_points",
      rateLimitRes.remainingPoints,
    );
    span?.setAttribute(
      "mu2mi.rate_limit.track_processing.consumed_points",
      rateLimitRes.consumedPoints,
    );
    span?.setAttribute(
      "mu2mi.rate_limit.track_processing.ms_before_next",
      rateLimitRes.msBeforeNext,
    );
    span?.addEvent("track processing rate limit check");
    if (rateLimitRes.remainingPoints === 0) {
      throw errors.TOO_MANY_REQUESTS();
    }

    return await next();
  });

Object.defineProperty(rateLimitTrackProcessing, "name", {
  value: "rateLimitTrackProcessingMiddleware",
});

export const fileStorageProvider = os.middleware(async ({ next }) => {
  return await next({
    context: {
      fileStorage,
    },
  });
});

export const replicateProvider = os.middleware(async ({ next }) => {
  return await next({
    context: {
      replicate,
    },
  });
});
