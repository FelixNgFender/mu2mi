import { KaraokePlayer } from "@/app/karaoke-player";
import type { siteConfig } from "@/config";
import { client } from "@/lib/rpc";
import type { LyricsWebhookBody } from "@/types/replicate/output";

export default async function KaraokePage({
  params,
}: PageProps<typeof siteConfig.paths.preview.karaoke.home>) {
  const trackId = Number.parseInt((await params).id, 10);

  const { error, data: assetLinks } =
    await client.asset.downloadPublicTrackAssets({
      id: trackId,
    });

  if (error) {
    throw error;
  }

  const audioSrc = assetLinks
    .filter((link) => link.type === "original")
    .at(0)?.url;
  const lyricsSrc = assetLinks
    .filter((link) => link.type === "lyrics")
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
    <div className="flex-1 pb-8 sm:pb-16">
      <KaraokePlayer audioSrc={audioSrc ?? ""} lyrics={lyrics} />
    </div>
  );
}
