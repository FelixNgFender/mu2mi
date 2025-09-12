import { sql } from "drizzle-orm";
import { base } from "../context";
import { dbProvider, fileStorageProvider, redisProvider } from "../middleware";

const execute = base
  .use(dbProvider)
  .use(redisProvider)
  .use(fileStorageProvider)
  .handler(async ({ context }) => {
    const { db, redis, fileStorage } = context;
    const start = performance.now();
    await db.execute(sql`SELECT 1`);
    const databaseLatency = (performance.now() - start).toFixed(2);
    await redis.ping();
    const cacheLatency = (
      performance.now() -
      start -
      Number(databaseLatency)
    ).toFixed(2);
    await fileStorage.bucketExists("bucket-name-of-a-non-existent-bucket");
    const fileStorageLatency = (
      performance.now() -
      start -
      Number(databaseLatency) -
      Number(cacheLatency)
    ).toFixed(2);
    return {
      databaseLatency: `${databaseLatency}ms`,
      cacheLatency: `${cacheLatency}ms`,
      fileStorageLatency: `${fileStorageLatency}ms`,
    };
  });

export default {
  execute,
};
