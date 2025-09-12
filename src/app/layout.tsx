// for pre-rendering
import "@/lib/rpc/server";
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config";
import { env } from "@/env";
import { cn } from "@/lib/utils";
import QueryProvider from "./query-provider";
import { SiteHeader } from "./site-header";
import { TailwindIndicator } from "./tailwind-indicator";
import { WebVitals } from "./web-vitals";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase:
    env.NODE_ENV === "development"
      ? new URL(env.BASE_URL)
      : new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: siteConfig.authors,
  generator: "Next.js",
  keywords: siteConfig.keywords,
  referrer: "origin",
  creator: siteConfig.authors[0]?.name,
  publisher: siteConfig.authors[0]?.name,
  alternates: {
    canonical: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitter.site,
    creator: siteConfig.twitter.creator,
    title: siteConfig.title,
    description: siteConfig.description,
    images: `${siteConfig.url}/opengraph-image.png`,
  },
  category: siteConfig.category,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader
              easing="ease"
              showSpinner={false}
              color="var(--primary)"
            />
            <div className="relative flex min-h-screen flex-col bg-background">
              <SiteHeader />
              <main className="flex flex-1 flex-col">{children}</main>
            </div>
            <TailwindIndicator />
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
        {env.ENABLE_ANALYTICS && (
          <>
            <WebVitals />
            <Script
              async
              defer
              src={env.UMAMI_SCRIPT_URL}
              data-website-id={env.UMAMI_ANALYTICS_ID}
            />
          </>
        )}
      </body>
    </html>
  );
}
