"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config";
import { authClient } from "@/lib/auth/client";

export default function SocialSignIn() {
  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: siteConfig.paths.studio.home,
      errorCallbackURL: siteConfig.paths.auth.signIn,
      newUserCallbackURL: siteConfig.paths.studio.home,
    });
  }

  async function signInWithGithub() {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: siteConfig.paths.studio.home,
      errorCallbackURL: siteConfig.paths.auth.signIn,
      newUserCallbackURL: siteConfig.paths.studio.home,
    });
  }

  return (
    <div className="inline-flex w-full flex-col overflow-hidden p-1 gap-4">
      <Button onClick={signInWithGoogle} variant="secondary">
        <span>
          <Icons.google className="mr-2 h-4 w-4 fill-current" />
        </span>
        <span>Continue with Google</span>
      </Button>
      <Button onClick={signInWithGithub} variant="secondary">
        <span>
          <Icons.github className="mr-2 h-4 w-4 fill-current" />
        </span>
        <span>Continue with GitHub</span>
      </Button>
    </div>
  );
}
