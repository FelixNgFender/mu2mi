export const umami = {
  webVitals: {
    ttfb: {
      name: "web-vitals-ttfb",
    },
    fcp: {
      name: "web-vitals-fcp",
    },
    lcp: {
      name: "web-vitals-lcp",
    },
    cls: {
      name: "web-vitals-cls",
    },
    fid: {
      name: "web-vitals-fid",
    },
    inp: {
      name: "web-vitals-inp",
    },
  },
  searchSite: {
    name: "search-site",
  },
  downloadTrack: {
    name: "download-track",
  },
  shareTrack: {
    name: "share-track",
  },
  deleteTrack: {
    name: "delete-track",
  },
  deleteAccount: {
    name: "delete-account",
  },
  generation: {
    init: {
      name: "process-track-generation-init",
    },
    success: {
      name: "process-track-generation-success",
    },
    failure: {
      name: "process-track-generation-failure",
    },
  },
  remix: {
    init: {
      name: "process-track-remix-init",
    },
    success: {
      name: "process-track-remix-success",
    },
    failure: {
      name: "process-track-remix-failure",
    },
  },
  separation: {
    init: {
      name: "process-track-separation-init",
    },
    success: {
      name: "process-track-separation-success",
    },
    failure: {
      name: "process-track-separation-failure",
    },
  },
  analysis: {
    init: {
      name: "process-track-analysis-init",
    },
    success: {
      name: "process-track-analysis-success",
    },
    failure: {
      name: "process-track-analysis-failure",
    },
  },
  midi: {
    init: {
      name: "process-track-midi-transcription-init",
    },
    success: {
      name: "process-track-midi-transcription-success",
    },
    failure: {
      name: "process-track-midi-transcription-failure",
    },
  },
  lyrics: {
    init: {
      name: "process-track-lyrics-transcription-init",
    },
    success: {
      name: "process-track-lyrics-transcription-success",
    },
    failure: {
      name: "process-track-lyrics-transcription-failure",
    },
  },
  unknownError: {
    name: "unknown-error",
  },
  notFound: {
    name: "not-found",
  },
} as const;
