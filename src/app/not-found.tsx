"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config";
import { umami } from "@/lib/analytics";
import { httpStatus } from "@/lib/http";
import { cn } from "@/lib/utils";

export default function NotFound() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window?.umami) {
        window.umami.track(umami.notFound.name);
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-2 text-balance text-center">
      <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
        {httpStatus.clientError.notFound.code} Not Found
      </h2>
      <p className="text-sm text-muted-foreground">
        {httpStatus.clientError.notFound.humanMessage}
      </p>
      <Link
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "mt-6!",
        )}
        href={siteConfig.paths.home}
      >
        Back to home
      </Link>
    </section>
  );
}
