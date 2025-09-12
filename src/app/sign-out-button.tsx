"use client";

import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config";
import { authClient } from "@/lib/auth/client";

export default function SignOutButton() {
  const [isPending, setIsPending] = useState(false);

  const onSignOut = async () => {
    setIsPending(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setIsPending(false);
          return redirect(siteConfig.paths.auth.signIn);
        },
      },
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={onSignOut}
      className="flex flex-1"
    >
      <LogOut className="mr-2 h-5 w-5" />
      Sign out
    </button>
  );
}
