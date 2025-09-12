import { Account } from "./account";
import { CommandMenu } from "./command-menu";
import { CreditBadge } from "./credit-badge";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { ModeToggle as ThemeToggle } from "./theme-toggle";

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 max-w-(--breakpoint-2xl) items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-between gap-2 md:justify-end md:gap-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <CommandMenu />
          </div>
          <CreditBadge />
          <nav className="flex items-center gap-1">
            <ThemeToggle />
            <Account className="h-9 w-9 px-0" />
          </nav>
        </div>
      </div>
    </header>
  );
}
