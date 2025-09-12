import type { NextRequest } from "next/server";
import type { LyricsWebhookBody } from "@/types/replicate/output";
import { replicateWebhookHandler } from "../replicate";

export async function POST(request: NextRequest) {
  return await replicateWebhookHandler<LyricsWebhookBody>(request, "lyrics");
}
