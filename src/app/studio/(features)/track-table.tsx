"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { siteConfig } from "@/config";
import { browserClient } from "@/lib/rpc";
import type { TrackType } from "@/types/db/schema";
import { trackTableColumnsBuiler } from "./track-table-columns";

const previewPathMap: Record<string, string> = {
  [siteConfig.paths.studio.generation.home]:
    siteConfig.paths.studio.preview.track.template,
  [siteConfig.paths.studio.separation.home]:
    siteConfig.paths.studio.preview.track.template,
  [siteConfig.paths.studio.analysis.home]:
    siteConfig.paths.studio.preview.track.template,
  [siteConfig.paths.studio.midi.home]:
    siteConfig.paths.studio.preview.midi.template,
  [siteConfig.paths.studio.lyrics.home]:
    siteConfig.paths.studio.preview.karaoke.template,
};

type TrackTableProps = {
  filter: TrackType;
};

export function TrackTable({ filter }: TrackTableProps) {
  const pathname = usePathname();
  const { data } = useSuspenseQuery(
    browserClient.track.findUserTracks.queryOptions({
      refetchInterval: 3000,
    }),
  );

  return (
    <DataTable
      columns={trackTableColumnsBuiler(previewPathMap[pathname], pathname)}
      data={data.filter((track) => track.type === filter)}
    />
  );
}
