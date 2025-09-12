import MidiPlayerWrapper from "@/app/midi-player-wrapper";
import type { siteConfig } from "@/config";
import { client } from "@/lib/rpc";

export default async function MidiTrackPage({
  params,
}: PageProps<typeof siteConfig.paths.preview.midi.home>) {
  const trackId = Number.parseInt((await params).id, 10);

  const { error, data: assetLinks } =
    await client.asset.downloadPublicTrackAssets({
      id: trackId,
    });

  if (error) {
    throw error;
  }

  return (
    <MidiPlayerWrapper
      initialURL={assetLinks.find((a) => a.type === "midi")?.url}
      isPublic
    />
  );
}
