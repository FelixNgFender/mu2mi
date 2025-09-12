import { LogIn, Settings, User } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/config";
import { auth } from "@/lib/auth/server";
import { cn } from "@/lib/utils";
import SignOutButton from "./sign-out-button";

interface AccountProps {
  className?: string;
}

export async function Account({ className }: AccountProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return (
      <Link
        href={siteConfig.paths.auth.signIn}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          className,
        )}
      >
        <LogIn className="h-5 w-5" />
        <span className="sr-only">Sign in</span>
      </Link>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={className}
          size="icon"
          title="Account"
        >
          <User className="h-5 w-5" />
          <span className="sr-only">Manage account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link href={siteConfig.paths.settings} className="flex flex-1">
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
