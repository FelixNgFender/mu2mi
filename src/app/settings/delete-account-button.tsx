"use client";

import { Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config";
import { umami } from "@/lib/analytics";
import { authClient } from "@/lib/auth/client";

export default function DeleteAccountButton() {
  const [isPending, setIsPending] = useState(false);

  const onDeleteAccount = async () => {
    setIsPending(true);
    await authClient.deleteUser({
      fetchOptions: {
        onSuccess: () => {
          setIsPending(false);
          return redirect(siteConfig.paths.auth.signIn);
        },
      },
    });
  };

  return (
    <Button
      disabled={isPending}
      variant="destructive"
      onClick={onDeleteAccount}
      data-umami-event={umami.deleteAccount.name}
      className="mt-2"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete account
    </Button>
  );
}
