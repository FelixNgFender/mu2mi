import type { NextRequest } from "next/server";
import type { AnalysisWebhookBody } from "@/types/replicate/output";
import { replicateWebhookHandler } from "../replicate";

export async function POST(request: NextRequest) {
  return await replicateWebhookHandler<AnalysisWebhookBody>(
    request,
    "analysis",
  );
}
