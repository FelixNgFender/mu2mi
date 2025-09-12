import "client-only";
import { isDefinedError } from "@orpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { umami } from "@/lib/analytics";
import { browserClient } from "@/lib/rpc";
import type { TrackType } from "@/types/db/schema";

export function useGeneratePresignedUrl({ type }: { type: TrackType }) {
  return useMutation(
    browserClient.asset.generatePresignedUrl.mutationOptions({
      onMutate() {
        switch (type) {
          case "generation":
            window.umami?.track(umami.generation.init.name);
            break;
          case "separation":
            window.umami?.track(umami.separation.init.name);
            break;
          case "analysis":
            window.umami?.track(umami.analysis.init.name);
            break;
          case "midi":
            window.umami?.track(umami.midi.init.name);
            break;
          case "lyrics":
            window.umami?.track(umami.lyrics.init.name);
            break;
        }
        toast("Your file(s) are being uploaded.");
      },
      onError(error) {
        if (!isDefinedError(error)) {
          toast.error("Uh oh! Something went wrong.", {
            description: error.message,
          });
        }
      },
    }),
  );
}
