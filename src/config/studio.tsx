import {
  Activity,
  BadgeDollarSign,
  BrainCircuit,
  Disc3,
  FileAudio,
  FileMusic,
  KeyboardMusic,
  Mic2,
  Split,
} from "lucide-react";
import { Icons } from "@/components/icons";
import type { MainNavItem, SidebarNavItem } from "@/types/studio";

import { siteConfig } from "./site";

interface StudioConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}

export const studioConfig: StudioConfig = {
  mainNav: [
    {
      title: "Studio",
      href: siteConfig.paths.studio.home,
      icon: <KeyboardMusic />,
    },
    {
      title: "Pricing",
      href: siteConfig.paths.pricing,
      icon: <BadgeDollarSign />,
    },
    {
      title: "GitHub",
      href: siteConfig.links.github,
      external: true,
    },
    {
      title: "Twitter",
      href: siteConfig.links.twitter,
      external: true,
    },
  ],
  sidebarNav: [
    {
      title: "Create",
      items: [
        {
          title: "Music Generation",
          description:
            "Craft unique compositions from text or melodies with our AI-driven tool.",
          href: siteConfig.paths.studio.generation.home,
          items: [],
          icon: <BrainCircuit />,
        },
      ],
    },
    {
      title: "Analyze",
      items: [
        {
          title: "Track Separation",
          description:
            "Isolate vocals and instruments within a track with precision.",
          href: siteConfig.paths.studio.separation.home,
          items: [],
          icon: <Split />,
        },
        {
          title: "Track Analysis",
          description:
            "Analyze the tempo, key, and structure of a musical piece for comprehensive insights.",
          href: siteConfig.paths.studio.analysis.home,
          items: [],
          icon: <Activity />,
        },
        {
          title: "MIDI Transcription",
          description: "Convert audio to MIDI data with accuracy.",
          href: siteConfig.paths.studio.midi.home,
          items: [],
          icon: <FileMusic />,
        },
        {
          title: "Lyrics Transcription",
          description:
            "Transcribe lyrics of any language from audio recordings into text with ease.",
          href: siteConfig.paths.studio.lyrics.home,
          items: [],
          icon: <Mic2 />,
        },
      ],
    },
    {
      title: "Preview",
      items: [
        {
          title: "Audio Preview",
          href: siteConfig.paths.studio.preview.track.template,
          items: [],
          icon: <Disc3 />,
        },
        {
          title: "MIDI Preview",
          href: siteConfig.paths.studio.preview.midi.template,
          items: [],
          icon: <FileAudio />,
        },
      ],
    },
    {
      title: "Connect",
      items: [
        {
          title: "GitHub",
          href: siteConfig.links.github,
          items: [],
          external: true,
          icon: <Icons.github className="fill-current" />,
        },
        {
          title: "Twitter",
          href: siteConfig.links.twitter,
          items: [],
          external: true,
          icon: <Icons.twitter className="fill-current" />,
        },
      ],
    },
  ],
};
