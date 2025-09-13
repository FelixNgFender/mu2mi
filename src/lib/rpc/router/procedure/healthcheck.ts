import { sql } from "drizzle-orm";
import { env } from "@/env";
import { base } from "../context";
import { dbProvider, fileStorageProvider } from "../middleware";

const execute = base
  .use(dbProvider)
  .use(fileStorageProvider)
  .handler(async ({ context }) => {
    const { db, fileStorage } = context;
    const start = performance.now();
    await db.execute(sql`SELECT 1`);
    const databaseLatency = (performance.now() - start).toFixed(2);
    await fileStorage.bucketExists(env.S3_BUCKET_NAME);
    const fileStorageLatency = (
      performance.now() -
      start -
      Number(databaseLatency)
    ).toFixed(2);
    const latency = {
      db: `${databaseLatency}ms`,
      s3: `${fileStorageLatency}ms`,
    };
    context.logger.info({ latency }, "healthcheck");
    return latency;
  });

export default {
  execute,
};
