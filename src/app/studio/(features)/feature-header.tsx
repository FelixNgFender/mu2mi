import { LucideUpload } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeatureHeaderProps<T extends string> = {
  title: string;
  href: Route<T> | URL;
  ctaLabel: string;
};

export function FeatureHeader<T extends string = string>({
  title,
  href,
  ctaLabel,
}: FeatureHeaderProps<T>) {
  return (
    <div className="flex w-full items-end justify-between">
      <h1 className="text-lg font-extrabold tracking-tight lg:text-xl">
        {title}
      </h1>
      <Link
        href={href as Route}
        className={cn(buttonVariants({ variant: "default" }))}
      >
        <LucideUpload className="mr-2 h-4 w-4" />
        {ctaLabel}
      </Link>
    </div>
  );
}
