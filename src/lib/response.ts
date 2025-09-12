import { NextResponse } from "next/server";
import { httpStatus } from "@/lib/http";

const { clientError, serverError } = httpStatus;

function success(body?: Record<string, unknown>, headers?: HeadersInit) {
  return NextResponse.json(body || {}, {
    status: httpStatus.success.ok.code,
    headers,
  });
}

function redirect(body?: BodyInit, headers?: HeadersInit) {
  return new Response(body, {
    status: httpStatus.redirect.found.code,
    headers,
  });
}

function badRequest(error?: Record<string, unknown> | string) {
  return NextResponse.json(
    { message: clientError.badRequest.humanMessage, error },
    { status: clientError.badRequest.code },
  );
}

function unauthorized() {
  return NextResponse.json(
    { message: clientError.unauthorized.humanMessage },
    { status: clientError.unauthorized.code },
  );
}

function forbidden() {
  return NextResponse.json(
    { message: clientError.forbidden.humanMessage },
    { status: clientError.forbidden.code },
  );
}

function notFound() {
  return NextResponse.json(
    { message: clientError.notFound.humanMessage },
    { status: clientError.notFound.code },
  );
}

function tooManyRequests(headers?: HeadersInit) {
  return NextResponse.json(
    { message: clientError.tooManyRequests.humanMessage },
    { status: clientError.tooManyRequests.code, headers },
  );
}

function unprocessableEntity(error?: Record<string, unknown> | string) {
  return NextResponse.json(
    {
      message: clientError.unprocessableEntity.humanMessage,
      error,
    },
    { status: clientError.unprocessableEntity.code },
  );
}

function internalServerError() {
  return NextResponse.json(
    {
      message: serverError.internal.humanMessage,
    },
    { status: serverError.internal.code },
  );
}

export {
  success,
  redirect,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
  unprocessableEntity,
  internalServerError,
};
