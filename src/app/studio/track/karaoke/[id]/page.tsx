import { ChevronLeftCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { KaraokePlayer } from "@/app/karaoke-player";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config";
import { httpStatus } from "@/lib/http";
import { client } from "@/lib/rpc";
import { cn } from "@/lib/utils";
import type { LyricsWebhookBody } from "@/types/replicate/output";

const VALID_CALLBACKS = [siteConfig.paths.studio.lyrics.home];

export default async function KaraokePage({
  params,
  searchParams,
}: PageProps<typeof siteConfig.paths.studio.preview.karaoke.home>) {
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

  const audioSrc = assetLinks
    ?.filter((link) => link.type === "original")
    .at(0)?.url;
  const lyricsSrc = assetLinks
    ?.filter((link) => link.type === "lyrics")
    .at(0)?.url;

  if (!lyricsSrc) {
    throw new Error("No lyrics found");
  }
  const res = await fetch(lyricsSrc);
  if (!res.ok) {
    throw new Error("Failed to fetch lyrics");
  }
  const lyrics = (await res.json())
    .chunks as LyricsWebhookBody["output"]["chunks"];

  return (
    <>
      {callback && (
        <Link
          href={callback as Route}
          className={cn(buttonVariants({ variant: "link" }), "self-start")}
        >
          <span>
            <ChevronLeftCircle className="mr-2 h-4 w-4" />
          </span>
          <span>Back to tracks</span>
        </Link>
      )}
      <div className="flex-1 pb-8 sm:pb-16">
        <KaraokePlayer audioSrc={audioSrc} lyrics={lyrics} />
      </div>
    </>
  );
}
