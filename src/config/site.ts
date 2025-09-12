export const siteConfig = {
  authors: [
    { name: "Felix Nguyen", content: "https://github.com/FelixNgFender" },
  ],
  contact: "team@mu2mi.com",
  name: "Mu2Mi",
  title: "Mu2Mi | The Open Source AI Musical Toolkit",
  url: "https://mu2mi.com",
  paths: {
    home: "/",
    api: {
      auth: "/api/auth",
      captcha: "/api/captcha",
      healthcheck: "/api/healthcheck",
      rpc: "/api/rpc",
      webhook: {
        generation: "/api/webhook/generation",
        separation: "/api/webhook/separation",
        analysis: "/api/webhook/analysis",
        midi: "/api/webhook/midi",
        lyrics: "/api/webhook/lyrics",
      },
    },
    auth: {
      signIn: "/auth/sign-in",
      signUp: "/auth/sign-up",
      passwordReset: {
        home: "/auth/password-reset",
        token: "/auth/password-reset/token",
      },
      emailVerification: "/auth/email-verification",
    },
    legal: {
      cookie: "/legal/cookie",
      terms: "/legal/terms",
      privacy: "/legal/privacy",
    },
    preview: {
      track: { home: "/preview/[id]", template: "/preview" },
      midi: { home: "/preview/midi/[id]", template: "/preview/midi" },
      karaoke: { home: "/preview/karaoke/[id]", template: "/preview/karaoke" },
    },
    pricing: "/pricing",
    settings: "/settings",
    studio: {
      home: "/studio",
      generation: { home: "/studio", new: "/studio/new" },
      separation: {
        home: "/studio/separation",
        new: "/studio/separation/new",
      },
      analysis: { home: "/studio/analysis", new: "/studio/analysis/new" },
      midi: { home: "/studio/midi", new: "/studio/midi/new" },
      lyrics: { home: "/studio/lyrics", new: "/studio/lyrics/new" },
      preview: {
        track: { home: "/studio/track/[id]", template: "/studio/track" },
        midi: {
          home: "/studio/track/midi/[id]",
          template: "/studio/track/midi",
        },
        karaoke: {
          home: "/studio/track/karaoke/[id]",
          template: "/studio/track/karaoke",
        },
      },
    },
  } as const,
  description:
    "Mu2Mi is an open source, AI-powered toolkit for all your musical needs. Remove vocals, isolate instruments, transcribe lyrics and instruments, generate and remix songs.",
  links: {
    github: "https://github.com/FelixNgFender/Mu2Mi" as const,
    twitter: "https://twitter.com/felixcantcode" as const,
    status: "https://status.mu2mi.com/status/mu2mi" as const,
  },
  twitter: {
    site: "@felixcantcode",
    creator: "@felixcantcode",
  },
  keywords: ["music", "production", "ai", "vocals", "instruments", "lyrics"],
  category: "technology",
};
