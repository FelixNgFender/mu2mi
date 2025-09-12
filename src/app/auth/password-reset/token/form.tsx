"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { authClient } from "@/lib/auth/client";
import { type NewPassword, newPasswordFormSchema } from "./schema";

export function NewPasswordForm({ token }: { token: string }) {
  const form = useForm<NewPassword>({
    resolver: zodResolver(newPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      token,
    },
  });

  const onSubmit: SubmitHandler<NewPassword> = async (data: NewPassword) => {
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
      fetchOptions: {
        onSuccess: () => {
          return redirect(siteConfig.paths.auth.signIn);
        },
      },
    });
    if (error) {
      toast.error("Uh oh! Something went wrong.", {
        description: error.message,
      });
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
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
        {/* hidden form field for token */}
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormControl>
              <Input type="hidden" {...field} value={token} />
            </FormControl>
          )}
        />
        <Button
          disabled={form.formState.isSubmitting}
          className="w-full"
          type="submit"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </Form>
  );
}
