import type { Route } from "next";
import Image from "next/image";
import AudioPlayer from "@/app/audio-player";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { siteConfig } from "@/config";
import { httpStatus } from "@/lib/http";
import { client } from "@/lib/rpc";

const VALID_CALLBACKS = [
  siteConfig.paths.studio.generation.home,
  siteConfig.paths.studio.separation.home,
  siteConfig.paths.studio.analysis.home,
];

export default async function TrackPage({
  params,
  searchParams,
}: PageProps<typeof siteConfig.paths.studio.preview.track.home>) {
  const trackId = Number.parseInt((await params).id, 10);
  const { callback } = await searchParams;

  if (
    typeof callback !== "string" ||
    !(VALID_CALLBACKS as string[]).includes(callback)
  ) {
    throw new Error(httpStatus.clientError.badRequest.humanMessage);
  }

  const { data: assetLinks, error } =
    await client.asset.downloadUserTrackAssets({
      id: trackId,
    });

  if (error) {
    throw error;
  }

  return (
    <>
      <AudioPlayer
        assetLinks={assetLinks.filter(
          (link) => link.type !== "analysis_viz" && link.type !== "analysis",
        )}
        callback={callback as Route}
      />
      {assetLinks.find((link) => link.type === "analysis_viz") && (
        <ScrollArea className="w-full whitespace-nowrap rounded-md border px-4 py-2 sm:border-0">
          <div className="relative mx-auto min-h-96 w-[1024px]">
            <Image
              src={
                assetLinks.find((link) => link.type === "analysis_viz")?.url ??
                ""
              }
              alt="Track analysis visualization"
              fill
              priority
              unoptimized
              className="object-contain"
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </>
  );
}
