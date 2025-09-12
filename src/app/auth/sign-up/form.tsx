"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { generateId } from "better-auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
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
import { PasswordInput } from "@/components/ui/password-input";
import { siteConfig } from "@/config";
import { env } from "@/env";
import { authClient } from "@/lib/auth/client";
import { httpStatus } from "@/lib/http";
import { type SignUp, signUpSchema } from "./schema";

export function SignUpForm() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const form = useForm<SignUp>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!env.NEXT_PUBLIC_ENABLE_CAPTCHA) {
      setCaptchaToken("just so it is not null");
    }
  }, []);

  async function onSubmit(data: SignUp) {
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

    const { error } = await authClient.signUp.email({
      name: generateId(15),
      email: data.email,
      password: data.password,
      callbackURL: siteConfig.paths.studio.home,
    });

    if (error) {
      toast("Uh oh! Something went wrong.", {
        description: error.message,
      });
      form.reset();
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...field}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...field}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-sm italic text-muted-foreground">
          By signing up, you agree to our{" "}
          <Link
            href={siteConfig.paths.legal.terms}
            className="underline underline-offset-2 hover:text-primary"
          >
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link
            href={siteConfig.paths.legal.privacy}
            className="underline underline-offset-2 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <CaptchaWidget
          action="sign-up"
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
            "Sign up"
          )}
        </Button>
      </form>
    </Form>
  );
}
