import type { Metadata } from "next";
import { siteConfig } from "@/config";

type PreviewLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Preview",
  description: `Check out what I just made on ${siteConfig.name}!`,
};

export default function PreviewLayout({ children }: PreviewLayoutProps) {
  return (
    <section className="container relative flex h-full flex-1 flex-col gap-4 py-4">
      {children}
    </section>
  );
}
