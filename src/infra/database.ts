import "server-only";
import type { Logger as DrizzleLogger } from "drizzle-orm/logger";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/env";
import { logger } from "@/lib/logger";
import * as schema from "@/types/db/schema";

const log = logger.child({ module: "infra/database" });

class DatabaseLogger implements DrizzleLogger {
  logQuery(query: string, params: unknown[]): void {
    log.debug({ query, params });
  }
}

export type DB = NodePgDatabase<typeof schema> & { $client: Pool };

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db: DB = drizzle({
  client: pool,
  logger: env.DATABASE_LOGGING && new DatabaseLogger(),
  schema,
  casing: "snake_case",
});
