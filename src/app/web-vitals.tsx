"use client";

import { useReportWebVitals } from "next/web-vitals";
import { umami } from "@/lib/analytics";

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: Umami doesn't have types
    umami: any;
  }
}

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (!window || !window.umami) {
      return;
    }

    switch (metric.name) {
      case "TTFB": {
        window.umami.track(umami.webVitals.ttfb.name, metric);
        break;
      }
      case "FCP": {
        window.umami.track(umami.webVitals.fcp.name, metric);
        break;
      }
      case "LCP": {
        window.umami.track(umami.webVitals.lcp.name, metric);
        break;
      }
      case "CLS": {
        window.umami.track(umami.webVitals.cls.name, metric);
        break;
      }
      case "FID": {
        window.umami.track(umami.webVitals.fid.name, metric);
        break;
      }
      case "INP": {
        window.umami.track(umami.webVitals.inp.name, metric);
        break;
      }
    }
  });

  return null;
}
