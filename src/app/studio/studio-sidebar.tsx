"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SidebarNavItem } from "@/types/studio";

export interface StudioSidebarNavProps {
  items: SidebarNavItem[];
}

export function StudioSidebar({ items }: StudioSidebarNavProps) {
  const pathname = usePathname();
  return items.length ? (
    <div className="gap-8 px-3 py-4">
      {items.map((item) => (
        <div key={item.title}>
          <h4 className="text-md mb-2 px-4 font-semibold tracking-tight lg:text-lg">
            {item.title}
          </h4>
          {item?.items?.length && (
            <StudioSidebarNavItems items={item.items} pathname={pathname} />
          )}
        </div>
      ))}
    </div>
  ) : null;
}

interface StudioSidebarNavItemsProps {
  items: SidebarNavItem[];
  pathname: string | null;
}

export function StudioSidebarNavItems({
  items,
  pathname,
}: StudioSidebarNavItemsProps) {
  return items?.length ? (
    <div className="grid grid-flow-row auto-rows-max gap-1">
      {items.map(
        (item) =>
          item.href && (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                buttonVariants({
                  variant: item.external
                    ? "link"
                    : pathname === item.href
                      ? "default"
                      : "ghost",
                }),
                "w-full justify-start text-xs lg:text-sm",
              )}
              target={item.external ? "_blank" : ""}
              rel={item.external ? "noreferrer" : ""}
            >
              <div className="mr-2 hidden h-4 w-4 items-center justify-center lg:flex">
                {item.icon}
              </div>
              {item.title}
            </Link>
          ),
      )}
    </div>
  ) : null;
}
