import type { NextRequest } from "next/server";
import type { SeparationWebhookBody } from "@/types/replicate/output";
import { replicateWebhookHandler } from "../replicate";

export async function POST(request: NextRequest) {
  return await replicateWebhookHandler<SeparationWebhookBody>(request);
}
