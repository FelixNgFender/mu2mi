import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  AlwaysOnSampler,
  BatchSpanProcessor,
  TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { ORPCInstrumentation } from "@orpc/otel";
import { siteConfig } from "@/config";
import { env } from "./env";

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: siteConfig.name,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-net": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-dns": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-http": {
        enabled: true,
      },
    }),
    new ORPCInstrumentation(),
  ],
  spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
  // keep all traces in development for easier debugging
  // sample 10% of traces in production to keep cost down
  sampler:
    env.NODE_ENV === "development"
      ? new AlwaysOnSampler()
      : new TraceIdRatioBasedSampler(0.1),
});

sdk.start();
