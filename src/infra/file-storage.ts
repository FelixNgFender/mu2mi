import "server-only";
import { Client as MinioClient } from "minio";
import { env } from "@/env";

const fileStorage = new MinioClient({
  endPoint: env.S3_ENDPOINT,
  port: env.S3_PORT,
  useSSL: env.S3_USE_SSL,
  accessKey: env.S3_ACCESS_KEY,
  secretKey: env.S3_SECRET_KEY,
});

export { fileStorage };
