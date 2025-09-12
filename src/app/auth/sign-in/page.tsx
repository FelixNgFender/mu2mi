import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config";
import { auth } from "@/lib/auth/server";
import SocialSignIn from "../social-sign-in";
import { SignInForm } from "./form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    if (!session.user.emailVerified) {
      return redirect(siteConfig.paths.auth.emailVerification);
    }
    return redirect(siteConfig.paths.studio.home);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="bg-gradient bg-cover! bg-clip-text! bg-center! text-transparent">
          Welcome back
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:gap-6">
        <SocialSignIn />
        <div className="flex items-center">
          <Separator className="flex-1" />
          <span className="px-4 text-sm text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <SignInForm />
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          New to Mu2Mi?{" "}
          <Link
            href={siteConfig.paths.auth.signUp}
            className="underline underline-offset-2 hover:text-primary"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
