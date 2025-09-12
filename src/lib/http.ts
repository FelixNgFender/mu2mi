export const httpStatus = {
  success: {
    ok: {
      code: 200,
    },
  },
  redirect: {
    found: {
      code: 302,
    },
  },
  clientError: {
    badRequest: {
      code: 400,
      humanMessage: "Oops! We couldn't understand your request.",
    },
    unauthorized: {
      code: 401,
      humanMessage: "Sorry, you need to be signed in to do that.",
    },
    forbidden: {
      code: 403,
      humanMessage: "Sorry, you don't have permission to access this.",
    },
    notFound: {
      code: 404,
      humanMessage: "Sorry, we couldn't find what you were looking for.",
    },
    tooManyRequests: {
      code: 429,
      humanMessage: "You're doing that too much. Please slow down.",
    },
    unprocessableEntity: {
      code: 422,
      humanMessage: "Oops! We couldn't process your request.",
    },
  },
  serverError: {
    internal: {
      code: 500,
      humanMessage:
        "Oops! Something went wrong on our end. We're looking into it.",
    },
  },
} as const;

const httpErrorCodes = {
  ...Object.fromEntries(
    Object.entries(httpStatus.clientError).map(([key, value]) => [
      key,
      value.code,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(httpStatus.serverError).map(([key, value]) => [
      key,
      value.code,
    ]),
  ),
} as const;

export type HttpErrorCodes =
  (typeof httpErrorCodes)[keyof typeof httpErrorCodes];
