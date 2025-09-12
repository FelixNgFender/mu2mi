import { headers } from "next/headers";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { siteConfig } from "@/config";
import { auth } from "@/lib/auth/server";
import { client } from "@/lib/rpc";

function formatTime(ms: number): string {
  const hours = Math.floor(ms / 1000 / 60 / 60);
  const minutes = Math.floor(ms / 1000 / 60) % 60;

  if (hours >= 1) {
    return `${hours < 10 ? hours : hours.toString().padStart(2, "0")} hour${
      hours > 1 ? "s" : ""
    }`;
  } else {
    return `${
      minutes < 10 ? minutes : minutes.toString().padStart(2, "0")
    } minute${minutes > 1 ? "s" : ""}`;
  }
}

export async function CreditBadge() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user.emailVerified) {
    return null;
  }

  const { data: rateLimiterRes, error } = await client.user.getCredits({
    id: session.user.id,
  });

  if (error) {
    throw error;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge variant="secondary" className="whitespace-nowrap">
          <Link href={siteConfig.paths.pricing}>
            Credit: {rateLimiterRes.remainingPoints}
          </Link>
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-40 p-2 text-center text-sm font-semibold">
        {rateLimiterRes.msBeforeNext === 0
          ? "Starting fresh!"
          : `Reset in ${formatTime(rateLimiterRes.msBeforeNext)}`}
      </HoverCardContent>
    </HoverCard>
  );
}
