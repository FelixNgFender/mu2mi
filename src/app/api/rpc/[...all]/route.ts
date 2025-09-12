import { ORPCError, onError, ValidationError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { z } from "zod";
import { siteConfig } from "@/config";
import { httpStatus } from "@/lib/http";
import { notFound } from "@/lib/response";
import router, { createBaseContext } from "@/lib/rpc/router";

const handler = new RPCHandler(router, {
  clientInterceptors: [
    onError((error) => {
      if (
        error instanceof ORPCError &&
        error.code === "BAD_REQUEST" &&
        error.cause instanceof ValidationError
      ) {
        const zodError = new z.ZodError(
          error.cause.issues as z.core.$ZodIssue[],
        );

        throw new ORPCError("INPUT_VALIDATION_FAILED", {
          status: httpStatus.clientError.unprocessableEntity.code,
          message: z.prettifyError(zodError),
          data: z.flattenError(zodError),
          cause: error.cause,
        });
      }
    }),
  ],
});

async function handleRequest(request: Request) {
  const { matched, response } = await handler.handle(request, {
    prefix: siteConfig.paths.api.rpc,
    context: await createBaseContext(), // Provide initial context if needed
  });

  if (matched) {
    return response;
  }

  return notFound();
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
