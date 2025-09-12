import { X } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config";
import { auth } from "@/lib/auth/server";
import DeleteAccountButton from "./delete-account-button";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect(siteConfig.paths.auth.signIn);
  }

  if (!session.user.emailVerified) {
    return redirect(siteConfig.paths.auth.emailVerification);
  }

  return (
    <section className="container relative flex h-full max-w-md flex-1 flex-col justify-center gap-4 py-8">
      <Card className="gap-8 rounded-lg border shadow-xs">
        <CardHeader>
          <CardTitle className="bg-gradient bg-cover! bg-clip-text! bg-center! pb-1 text-transparent">
            Profile settings
          </CardTitle>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="id">User ID</Label>
            <Input id="id" defaultValue={session.user.id} readOnly />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm account deletion</DialogTitle>
                <DialogDescription>
                  This irreversible action will delete your account and all
                  associated data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="secondary" className="mt-2">
                    <X className="mr-2 h-4 w-4" />
                    Close
                  </Button>
                </DialogClose>
                <DeleteAccountButton />
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild variant="secondary">
            <Link href={siteConfig.paths.auth.passwordReset.home}>
              Change Password
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
