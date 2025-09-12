import type { Route } from "next";
import MidiPlayerWrapper from "@/app/midi-player-wrapper";
import { siteConfig } from "@/config";
import { httpStatus } from "@/lib/http";
import { client } from "@/lib/rpc";

const VALID_CALLBACKS = [siteConfig.paths.studio.midi.home];

export default async function MidiTrackPage({
  params,
  searchParams,
}: PageProps<typeof siteConfig.paths.studio.preview.midi.home>) {
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
    <MidiPlayerWrapper
      initialURL={assetLinks.find((a) => a.type === "midi")?.url}
      callback={callback as Route}
    />
  );
}
