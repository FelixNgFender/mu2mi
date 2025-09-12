import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config";
import { auth } from "@/lib/auth/server";
import { ResendVerificationButton } from "./resend-verification-button";

export const metadata: Metadata = {
  title: "Email Verification",
};

const EmailVerificationPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect(siteConfig.paths.auth.signIn);
  }

  if (session.user.emailVerified) {
    return redirect(siteConfig.paths.studio.home);
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="bg-gradient bg-cover! bg-clip-text! bg-center! text-transparent">
          Verify your email
        </CardTitle>
        <CardDescription>
          We have sent a code to your email address
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <ResendVerificationButton session={session} />
      </CardFooter>
    </Card>
  );
};

export default EmailVerificationPage;
