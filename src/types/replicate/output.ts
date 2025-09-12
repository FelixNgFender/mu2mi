interface ReplicateWebhookBody {
  status: "starting" | "succeeded" | "failed" | "canceled";
  error: string | null;
  output: unknown;
}

export interface GenerationWebhookBody extends ReplicateWebhookBody {
  output: string | null;
}

export interface SeparationWebhookBody extends ReplicateWebhookBody {
  output: {
    bass: string | null;
    drums: string | null;
    other: string | null;
    piano: string | null;
    guitar: string | null;
    vocals: string | null;
  };
}

export interface AnalysisWebhookBody extends ReplicateWebhookBody {
  output: [string | null, string | null, string | null];
}

export interface MidiWebhookBody extends ReplicateWebhookBody {
  output: string | null;
}

export interface LyricsWebhookBody extends ReplicateWebhookBody {
  output: {
    text: string | null;
    chunks: Array<{
      text: string;
      timestamp: [number, number];
    }>;
  };
}

export type ReplicateWebhookBodyTypes =
  | GenerationWebhookBody
  | SeparationWebhookBody
  | AnalysisWebhookBody
  | MidiWebhookBody
  | LyricsWebhookBody;
