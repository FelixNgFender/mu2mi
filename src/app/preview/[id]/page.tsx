import Image from "next/image";
import AudioPlayer from "@/app/audio-player";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { siteConfig } from "@/config";
import { client } from "@/lib/rpc";

export default async function TrackPage({
  params,
}: PageProps<typeof siteConfig.paths.preview.track.home>) {
  const trackId = Number.parseInt((await params).id, 10);

  const { error, data: assetLinks } =
    await client.asset.downloadPublicTrackAssets({
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
        isPublic
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
