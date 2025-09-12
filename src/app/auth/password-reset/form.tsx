"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CaptchaWidget } from "@/components/ui/captcha";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config/site";
import { env } from "@/env";
import { authClient } from "@/lib/auth/client";
import { httpStatus } from "@/lib/http";
import { type PasswordReset, passwordResetFormSchema } from "./schema";

export function PasswordResetForm() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<PasswordReset>({
    resolver: zodResolver(passwordResetFormSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (!env.NEXT_PUBLIC_ENABLE_CAPTCHA) {
      setCaptchaToken("just so it is not null");
    }
  }, []);

  async function onSubmit(data: PasswordReset) {
    if (!env.NEXT_PUBLIC_ENABLE_CAPTCHA) {
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

    const { data: result, error } = await authClient.requestPasswordReset({
      ...data,
      redirectTo: siteConfig.paths.auth.passwordReset.token,
    });
    if (error) {
      toast.error("Uh oh! Something went wrong.", {
        description: error.message,
      });
      form.reset();
    }
    if (result?.status) {
      toast("Password reset link sent!", {
        description: "Check your inbox for the link.",
        action: {
          label: "Gmail",
          onClick() {
            window.open(
              `https://mail.google.com/mail/u/${data.email}/#search/from%3A%40${siteConfig.url}+in%3Aanywhere+newer_than%3A1d`,
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@email.com"
                  {...field}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="inline-flex w-full flex-col gap-2 overflow-hidden md:gap-4">
          <CaptchaWidget
            action="password-reset"
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
            className="w-full"
            type="submit"
          >
            {form.formState.isSubmitting || !captchaToken ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send reset link"
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            type="button"
            onClick={() => {
              router.back();
            }}
          >
            Go back
          </Button>
        </div>
      </form>
    </Form>
  );
}
