import { siteConfig } from "@/config";
import { FeatureHeader } from "../feature-header";
import { TrackTable } from "../track-table";

export default async function SeparationPage() {
  return (
    <>
      <FeatureHeader
        title="Track Separation"
        href={siteConfig.paths.studio.separation.new}
        ctaLabel="Upload Track"
      />
      <TrackTable filter="separation" />
    </>
  );
}
