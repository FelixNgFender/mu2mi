import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { siteConfig, studioConfig } from "@/config";
import { cn } from "@/lib/utils";
import type { SidebarNavItem } from "@/types/studio";

const features = studioConfig.sidebarNav
  .filter((item) => item.title === "Create" || item.title === "Analyze")
  .flatMap((item) => item.items);

function FeatureCard({ title, href, icon, description }: SidebarNavItem) {
  return (
    <Link href={href ? href : siteConfig.paths.studio.home}>
      <Card className="flex h-full flex-col items-center justify-center gap-2 pt-8">
        <div className="bg-gradient h-10 w-10 rounded-full p-2">{icon}</div>
        <CardHeader className="w-full">
          <CardTitle className="flex items-center justify-center text-foreground">
            <span className="text-xl font-bold">{title}</span>
            <ChevronRight className="ml-1 h-6 w-6" />
          </CardTitle>

          <CardDescription className="text-balance">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

function LandingFooter() {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by{" "}
          <Link
            href={siteConfig.links.twitter}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            {siteConfig.authors[0]?.name}
          </Link>
          . The source code is available on{" "}
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </Link>
          .
        </p>
        <p className="text-sm leading-loose text-muted-foreground md:text-right">
          <Link
            href={siteConfig.links.status}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Status
          </Link>
          {" | "}
          <Link
            href={siteConfig.paths.legal.privacy}
            className="font-medium underline underline-offset-4"
          >
            Privacy
          </Link>
        </p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <section className="py-4 md:py-16 lg:py-24 xl:py-40">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-6">
            <div className="flex flex-col items-center justify-center gap-12 text-center">
              <Spotlight
                className="-top-112 sm:-top-128 sm:left-16"
                fill="white"
              />
              <h1 className="text-4xl font-bold sm:text-5xl sm:leading-none lg:text-7xl">
                <span className="animate-gradient bg-linear-to-r from-orange-700 via-blue-500 to-green-400 bg-clip-text text-transparent">
                  Unleash your creativity
                </span>
              </h1>
              <p className="text-balance text-lg text-muted-foreground md:text-xl">
                {siteConfig.description}
              </p>
              <Link
                href={siteConfig.paths.studio.home}
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "relative inline-flex h-12 overflow-hidden rounded-full p-px hover:no-underline md:h-16",
                )}
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="text-md inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background px-3 py-1 font-thin text-foreground backdrop-blur-3xl md:text-lg">
                  10 credits per day. Start now
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 lg:py-24 xl:py-40">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-6">
            <div className="flex flex-col justify-center gap-12 text-center">
              <div className="gap-2  text-balance">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Discover Our Features
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Our features help you write, record, and produce faster.
                </p>
              </div>
              <div className="mx-auto w-full max-w-full gap-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
                  {features.map((feature) => (
                    <FeatureCard key={feature.title} {...feature} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <LandingFooter />
    </>
  );
}
