import type { RateLimiterRes } from "rate-limiter-flexible";
import { env } from "@/env";
import { FRESH_TRACK_PROCESSING_RATE_LIMITER_RES } from "@/lib/rate-limit";
import { base } from "../context";
import { dbProvider, rateLimitProvider, requiresAuth } from "../middleware";

const getCredits = base
  .use(requiresAuth)
  .use(dbProvider)
  .use(rateLimitProvider)
  .handler(async ({ context }): Promise<RateLimiterRes> => {
    if (!env.ENABLE_RATE_LIMIT) {
      return FRESH_TRACK_PROCESSING_RATE_LIMITER_RES;
    }
    const rateLimiterRes = await context.rateLimit.trackProcessing.get(
      context.session.user.id,
    );
    if (!rateLimiterRes) {
      return FRESH_TRACK_PROCESSING_RATE_LIMITER_RES;
    }
    return rateLimiterRes;
  });

export default {
  getCredits,
};
