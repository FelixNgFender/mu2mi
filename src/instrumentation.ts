export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { env } = await import("@/env");
    await import("@/lib/rpc/server");
    await import("./instrumentation.node");
    if (env.NEXT_MANUAL_SIG_HANDLE) {
      // https://orpc.unnoq.com/docs/integrations/opentelemetry#handling-uncaught-exceptions
      const { logger } = await import("@/lib/logger");
      const log = logger.child({ module: "instrumentation" });
      log.info({ env }, "running with envinronment variables");
      const { SpanStatusCode, trace } = await import("@opentelemetry/api");

      const tracer = trace.getTracer("uncaught-errors");

      function recordError(eventName: string, reason: unknown) {
        const span = tracer.startSpan(eventName);
        const message = String(reason);

        if (reason instanceof Error) {
          span.recordException(reason);
        } else {
          span.recordException({ message });
        }

        span.setStatus({ code: SpanStatusCode.ERROR, message });
        span.end();
      }

      process.on("uncaughtException", (reason) => {
        log.fatal(reason, "uncaught exception detected");
        recordError("uncaughtException", reason);
      });

      process.on("unhandledRejection", (reason) => {
        log.fatal(reason, "unhandled rejection detected");
        recordError("unhandledRejection", reason);
      });
    }
  }
}
