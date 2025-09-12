import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Preset } from "@/types/studio";

import { BackgroundGradient } from "./background-gradient";
import { Badge } from "./badge";

type PresetCardProps = {
  item: Preset;
  selectedItemId: string | null;
};

export function PresetCard({ item, selectedItemId }: PresetCardProps) {
  return (
    <BackgroundGradient className="rounded-3xl bg-background">
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-4 rounded-3xl p-4 transition-all hover:bg-accent",
          selectedItemId === item.id && "bg-muted",
        )}
        onClick={item.onClick}
      >
        <Image
          src={item.icon}
          alt={item.name}
          className="h-24 w-24 rounded-xl"
        />
        <div className="flex flex-1 flex-col items-start gap-2 text-left text-base">
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{item.name}</div>
              </div>
            </div>
          </div>
          <div className="line-clamp-2 text-sm text-muted-foreground">
            {item.description.substring(0, 300)}
          </div>
          {item.labels.length ? (
            <div className="flex items-center gap-2">
              {item.labels.map((label) => (
                <Badge key={label} variant="secondary">
                  {label}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </button>
    </BackgroundGradient>
  );
}
