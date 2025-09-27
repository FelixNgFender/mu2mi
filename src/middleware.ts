import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { siteConfig } from "@/config";
import { auth } from "@/lib/auth/server";
import { env } from "./env";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.pathname.startsWith(siteConfig.paths.studio.home)) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.redirect(
        new URL(siteConfig.paths.auth.signIn, request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: env.NEXT_RUNTIME,
};
