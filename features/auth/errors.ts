import type { AuthRouteError } from "@/frontend.types";

export class AuthMutationError extends Error {
  result: AuthRouteError;

  constructor(result: AuthRouteError) {
    super(result.error.message);
    this.name = "AuthMutationError";
    this.result = result;
  }
}

export function fieldError(
  error: AuthMutationError | null,
  field: string,
): string | undefined {
  return error?.result.error.details?.fieldErrors?.[field]?.[0];
}

export function authErrorMessage(error: AuthMutationError) {
  if (error.result.status === 429) {
    return "Too many attempts. Please wait a moment before trying again.";
  }

  return error.result.error.message;
}
