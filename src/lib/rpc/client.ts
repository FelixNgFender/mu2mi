import { createORPCClient, createSafeClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { siteConfig } from "@/config";
import type router from "./router";

declare global {
  var $client: RouterClient<typeof router> | undefined;
}

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") {
      throw new Error("RPCLink is not allowed on the server side.");
    }

    return `${window.location.origin}${siteConfig.paths.api.rpc}`;
  },
});

/**
 * Fallback to client-side client if server-side client is not available.
 */
const rpcClient: RouterClient<typeof router> =
  globalThis.$client ?? createORPCClient(link);

export const client = createSafeClient(rpcClient);
/**
 * For usage in client-side component data fetching with Tanstack Query.
 */
export const browserClient = createTanstackQueryUtils(rpcClient);
