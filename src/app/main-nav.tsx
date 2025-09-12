"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href={siteConfig.paths.home} className="mr-4 flex items-center">
        <Icons.mu2mi.dark.large className="hidden h-8 w-24 dark:block" />
        <Icons.mu2mi.light.large className="block h-8 w-24 dark:hidden" />
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link
          href={siteConfig.paths.studio.home}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === siteConfig.paths.studio.home
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Studio
        </Link>
        <Link
          href={siteConfig.paths.pricing}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === siteConfig.paths.pricing
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Pricing
        </Link>
        <Link
          href={siteConfig.links.github}
          className={cn(
            "text-foreground/60 transition-colors hover:text-foreground/80",
          )}
        >
          GitHub
        </Link>
      </nav>
    </div>
  );
}
