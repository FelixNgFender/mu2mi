import { siteConfig } from "@/config";

import { FeatureHeader } from "../feature-header";
import { TrackTable } from "../track-table";

export default async function LyricsPage() {
  return (
    <>
      <FeatureHeader
        title="Lyrics Transcription"
        href={siteConfig.paths.studio.lyrics.new}
        ctaLabel="Upload Track"
      />
      <TrackTable filter="lyrics" />
    </>
  );
}
