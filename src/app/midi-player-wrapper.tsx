"use client";

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import type { MidiPlayerProps } from "@/app/midi-player";

const MidiPlayer = dynamic(() => import("@/app/midi-player"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="text-sm text-muted-foreground">Loading preview...</span>
    </div>
  ),
});

export default function MidiPlayerWrapper(props: MidiPlayerProps) {
  return <MidiPlayer {...props} />;
}
