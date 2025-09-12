"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CaptchaWidget } from "@/components/ui/captcha";
import { Form } from "@/components/ui/form";
import { siteConfig } from "@/config";
import { env } from "@/env";
import { authClient, type Session } from "@/lib/auth/client";
import { httpStatus } from "@/lib/http";

interface ResendVerificationButtonProps {
  session: Session;
}

export function ResendVerificationButton({
  session,
}: ResendVerificationButtonProps) {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const form = useForm();

  useEffect(() => {
    if (!env.NEXT_PUBLIC_ENABLE_CAPTCHA) {
      setCaptchaToken("just so it is not null");
    }
  }, []);

  async function onSubmit() {
    if (env.NEXT_PUBLIC_ENABLE_CAPTCHA) {
      if (!captchaToken) return;
      const verificationResult = await fetch(siteConfig.paths.api.captcha, {
        method: "POST",
        body: JSON.stringify({ token: captchaToken }),
        headers: {
          "content-type": "application/json",
        },
      });

      if (verificationResult.status !== httpStatus.success.ok.code) {
        toast.error("Uh oh! Something went wrong.", {
          description:
            "The captcha failed to verify. Please refresh the page and try again.",
        });
        return;
      }
    }

    const { error, data } = await authClient.sendVerificationEmail({
      email: session.user.email,
      callbackURL: siteConfig.paths.studio.home,
    });
    if (error) {
      toast.error("Uh oh! Something went wrong.", {
        description: error.message,
      });
      form.reset();
    }
    if (data?.status) {
      toast("Email verification link sent!", {
        description: "Check your inbox for the link.",
        action: {
          label: "Gmail",
          onClick() {
            window.open(
              `https://mail.google.com/mail/u/${session.user.email}/#search/from%3A%40${siteConfig.url}+in%3Aanywhere+newer_than%3A1d`,
              "_blank",
              "noreferrer",
            );
          },
        },
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <CaptchaWidget
          id="resend-verification-code"
          action="resend-verification-code"
          size="invisible"
          className="m-0!"
          onScriptLoadError={() => {
            toast.error("Uh oh! Something went wrong.", {
              description:
                "The captcha failed to load. Please refresh the page and try again.",
            });
          }}
          onError={() => {
            toast.error("Uh oh! Something went wrong.", {
              description:
                "The captcha failed to load. Please refresh the page and try again.",
            });
          }}
          onSuccess={setCaptchaToken}
        />
        <Button
          disabled={form.formState.isSubmitting || !captchaToken}
          variant="outline"
          className="w-full"
          type="submit"
        >
          {form.formState.isSubmitting || !captchaToken ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Didn’t receive an email? Resend"
          )}
        </Button>
      </form>
    </Form>
  );
}
