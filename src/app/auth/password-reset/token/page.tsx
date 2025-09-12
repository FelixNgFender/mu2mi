import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config";
import { auth } from "@/lib/auth/server";
import { NewPasswordForm } from "./form";

export const metadata: Metadata = {
  title: "New Password",
};

type PasswordResetTokenPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PasswordResetTokenPage({
  searchParams,
}: PasswordResetTokenPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    if (!session.user.emailVerified)
      return redirect(siteConfig.paths.auth.emailVerification);
    return redirect(siteConfig.paths.studio.home);
  }

  // https://www.better-auth.com/docs/authentication/email-password#request-password-reset
  const { token, error } = await searchParams;

  if (typeof token !== "string") {
    throw new Error(
      `No token found or an error happened when resetting password. Token: ${token}. Error: ${error}`,
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="bg-gradient bg-cover! bg-clip-text! bg-center! text-transparent">
          Set your new password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <NewPasswordForm token={token} />
      </CardContent>
    </Card>
  );
}
