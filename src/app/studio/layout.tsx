import type { Metadata } from "next";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { studioConfig } from "@/config";

import { StudioSidebar } from "./studio-sidebar";

export const metadata: Metadata = {
  title: "Studio",
};

interface StudioLayoutProps {
  children: React.ReactNode;
}

export default async function StudioLayout({ children }: StudioLayoutProps) {
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel
        defaultSize={20}
        minSize={20}
        maxSize={50}
        className="hidden md:block"
      >
        <aside>
          <ScrollArea className="h-full">
            <StudioSidebar items={studioConfig.sidebarNav} />
          </ScrollArea>
        </aside>
      </ResizablePanel>
      <ResizableHandle className="hidden opacity-30 hover:opacity-100 md:flex" />
      <ResizablePanel defaultSize={80}>{children}</ResizablePanel>
    </ResizablePanelGroup>
  );
}
