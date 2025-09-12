import { siteConfig } from "@/config";
import { FeatureHeader } from "../feature-header";
import { TrackTable } from "../track-table";

export default async function MidiTranscriptionPage() {
  return (
    <>
      <FeatureHeader
        title="MIDI Transcription"
        href={siteConfig.paths.studio.midi.new}
        ctaLabel="Upload Tracks"
      />
      <TrackTable filter="midi" />
    </>
  );
}
