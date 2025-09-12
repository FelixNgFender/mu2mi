"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config";
import { authClient } from "@/lib/auth/client";
import { type SignIn, signInFormSchema } from "./schema";

export function SignInForm() {
  const form = useForm<SignIn>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: SignIn) {
    const { error } = await authClient.signIn.email({
      ...data,
      callbackURL: siteConfig.paths.studio.home,
    });
    // must check if action returns redirect
    if (error) {
      toast.error("Uh oh! Something went wrong.", {
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...field}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormLabel className="text-sm text-muted-foreground">
                  Remember me
                </FormLabel>
              </FormItem>
            )}
          />
          <Link
            href={siteConfig.paths.auth.passwordReset.home}
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-primary"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          disabled={form.formState.isSubmitting}
          className="w-full"
          type="submit"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Sign in"
          )}
        </Button>
        <p className="text-sm italic text-muted-foreground">
          By signing in, you agree to our{" "}
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
        <Separator />
      </form>
    </Form>
  );
}
