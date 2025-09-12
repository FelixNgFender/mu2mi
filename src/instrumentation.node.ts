import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { ORPCInstrumentation } from "@orpc/otel";
import { siteConfig } from "@/config";

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: siteConfig.name,
  }),
  instrumentations: [getNodeAutoInstrumentations(), new ORPCInstrumentation()],
  spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
});

sdk.start();
