import { createAuthClient } from "better-auth/client";
import { toast } from "sonner";

export const authClient = createAuthClient({
  fetchOptions: {
    onError: async (context) => {
      const { response } = context;
      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After");
        toast.error("Rate limit exceeded.", {
          description: `Retry after ${retryAfter} seconds.`,
        });
      }
    },
  },
});

export type Session = typeof authClient.$Infer.Session;
