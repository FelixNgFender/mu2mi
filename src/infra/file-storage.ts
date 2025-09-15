import "server-only";
import { Client as MinioClient } from "minio";
import { env } from "@/env";

const fileStorage = new MinioClient({
  endPoint: env.S3_ENDPOINT,
  port: env.S3_PORT,
  useSSL: false,
  accessKey: env.S3_ACCESS_KEY,
  secretKey: env.S3_SECRET_KEY,
});

const publicFileStorage = new MinioClient({
  endPoint: env.S3_PUBLIC_ENDPOINT,
  port: env.S3_PUBLIC_PORT,
  useSSL: true,
  accessKey: env.S3_ACCESS_KEY,
  secretKey: env.S3_SECRET_KEY,
});

export { fileStorage, publicFileStorage };
