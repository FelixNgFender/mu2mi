import "server-only";
import { createClient } from "redis";
import { env } from "@/env";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "infra/redis" });

export const redis = createClient({
  url: env.REDIS_URL,
  // https://github.com/animir/node-rate-limiter-flexible/wiki/Redis#redis-package
  disableOfflineQueue: true,
}).on("error", async (error) => log.error(error, "redis client error"));
// .on("ready", () => log.info({}, "redis client ready"));

redis.connect();
