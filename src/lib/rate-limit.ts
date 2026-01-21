import "server-only";
import type { Pool } from "pg";
import { RateLimiterPostgres, RateLimiterRes } from "rate-limiter-flexible";

// https://github.com/animir/node-rate-limiter-flexible/wiki/PostgreSQL#usage
const TRACK_PROCESSING_RATE_LIMITER_PREFIX = "rate_limiter_track_processing";
const TRACK_PROCESSING_RATE_LIMITER_POINTS = 10; // 10 requests
const TRACK_PROCESSING_RATE_LIMITER_DURATION_SECONDS = 60 * 60 * 24; // per 24 hours

export const FRESH_TRACK_PROCESSING_RATE_LIMITER_RES = new RateLimiterRes(
  TRACK_PROCESSING_RATE_LIMITER_POINTS,
  0,
  0,
  true,
);

export function createTrackProcessingRateLimiter(
  db: Pool,
): RateLimiterPostgres {
  return new RateLimiterPostgres({
    storeClient: db,
    tableCreated: true,
    keyPrefix: TRACK_PROCESSING_RATE_LIMITER_PREFIX,
    points: TRACK_PROCESSING_RATE_LIMITER_POINTS,
    duration: TRACK_PROCESSING_RATE_LIMITER_DURATION_SECONDS,
  });
}
