import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config";
import { auth } from "@/lib/auth/server";
import { FeatureHeader } from "../feature-header";
import { TrackTable } from "../track-table";

export default async function GenerationPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect(siteConfig.paths.auth.signIn);
  }

  if (!session.user.emailVerified) {
    return redirect(siteConfig.paths.auth.emailVerification);
  }

  return (
    <>
      <FeatureHeader
        title="Music Generation"
        href={siteConfig.paths.studio.generation.new}
        ctaLabel="Create Track"
      />
      <TrackTable filter="generation" />
    </>
  );
}
