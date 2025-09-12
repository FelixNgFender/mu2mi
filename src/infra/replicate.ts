import "server-only";
import Replicate from "replicate";
import { siteConfig } from "@/config";
import { env } from "@/env";
import type {
  AnalysisSchema,
  GenerationSchema,
  LyricsSchema,
  MidiTranscription,
  SeparationSchema,
  WebhookMetadataSchema,
} from "@/types/replicate/input";

class ReplicateClient {
  replicate: Replicate;

  constructor({ auth }: { auth: string }) {
    this.replicate = new Replicate({ auth });

    // 🫠 - https://github.com/replicate/replicate-javascript/issues/136
    // Alternatively, opt out of caching in your component with noStore
    // https://github.com/replicate/replicate-javascript/issues/136#issuecomment-1847442879
    this.replicate.fetch = (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, cache: "no-store" });
  }

  async generateMusic({
    trackId,
    userId,
    ...data
  }: WebhookMetadataSchema & GenerationSchema) {
    const webhook = new URL(
      siteConfig.paths.api.webhook.generation,
      env.BASE_URL,
    );
    webhook.searchParams.set("trackId", trackId.toString());
    webhook.searchParams.set("userId", userId);
    return this.replicate.predictions.create({
      version: env.MUSIC_GENERATION_MODEL_VERSION,
      input: data,
      webhook: webhook.toString(),
      webhook_events_filter: ["completed"],
    });
  }

  async separateTrack({
    trackId,
    userId,
    ...data
  }: WebhookMetadataSchema & SeparationSchema) {
    const webhook = new URL(
      siteConfig.paths.api.webhook.separation,
      env.BASE_URL,
    );
    webhook.searchParams.set("trackId", trackId.toString());
    webhook.searchParams.set("userId", userId);
    return this.replicate.predictions.create({
      version: env.TRACK_SEPARATION_MODEL_VERSION,
      input: data,
      webhook: webhook.toString(),
      webhook_events_filter: ["completed"],
    });
  }

  async analyzeTrack({
    trackId,
    userId,
    ...data
  }: WebhookMetadataSchema & AnalysisSchema) {
    const webhook = new URL(
      siteConfig.paths.api.webhook.analysis,
      env.BASE_URL,
    );
    webhook.searchParams.set("trackId", trackId.toString());
    webhook.searchParams.set("userId", userId);
    return this.replicate.predictions.create({
      version: env.TRACK_ANALYSIS_MODEL_VERSION,
      input: data,
      webhook: webhook.toString(),
      webhook_events_filter: ["completed"],
    });
  }

  async transcribeMidi({
    trackId,
    userId,
    ...data
  }: WebhookMetadataSchema & MidiTranscription) {
    const webhook = new URL(siteConfig.paths.api.webhook.midi, env.BASE_URL);
    webhook.searchParams.set("trackId", trackId.toString());
    webhook.searchParams.set("userId", userId);
    return this.replicate.predictions.create({
      version: env.MIDI_TRANSCRIPTION_MODEL_VERSION,
      input: data,
      webhook: webhook.toString(),
      webhook_events_filter: ["completed"],
    });
  }

  async transcribeLyrics({
    trackId,
    userId,
    ...data
  }: WebhookMetadataSchema & LyricsSchema) {
    const webhook = new URL(siteConfig.paths.api.webhook.lyrics, env.BASE_URL);
    webhook.searchParams.set("trackId", trackId.toString());
    webhook.searchParams.set("userId", userId);
    return this.replicate.predictions.create({
      version: env.LYRICS_TRANSCRIPTION_MODEL_VERSION,
      input: data,
      webhook: webhook.toString(),
      webhook_events_filter: ["completed"],
    });
  }
}

export const replicate = new ReplicateClient({
  auth: env.REPLICATE_API_TOKEN,
});
