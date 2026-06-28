import { AccountApiError } from "@/lib/account-api";

export function accountErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AccountApiError) {
    if (error.status === 429) {
      return "Too many attempts. Please wait a moment before trying again.";
    }

    return error.message;
  }

  return fallback;
}

export function accountFieldError(
  error: AccountApiError | null,
  field: string,
) {
  return error?.response.details?.fieldErrors?.[field]?.[0];
}
