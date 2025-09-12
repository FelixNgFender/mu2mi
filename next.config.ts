// @ts-check
import { fileURLToPath } from "node:url";
import createJiti from "jiti";
import type { NextConfig } from "next";

const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build. Using jiti@^1 we can import .ts files :)
jiti("./src/env");

// https://nextjs.org/docs/app/guides/package-bundling#analyzing-javascript-bundles
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */
  // If you're using the standalone output in your next.config.ts, make sure to include the following:
  // output: "standalone",
  // // Add the packages in transpilePackages
  // transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  typedRoutes: true,
  serverExternalPackages: ["pino", "pino-pretty"],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default withBundleAnalyzer(nextConfig);
