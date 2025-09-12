import { siteConfig } from "@/config";

import { FeatureHeader } from "../feature-header";
import { TrackTable } from "../track-table";

export default async function AnalysisPage() {
  return (
    <>
      <FeatureHeader
        title="Track Analysis"
        href={siteConfig.paths.studio.analysis.new}
        ctaLabel="Upload Track"
      />
      <TrackTable filter="analysis" />
    </>
  );
}
