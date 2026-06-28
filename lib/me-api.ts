import { AxiosError } from "axios";

import { api } from "@/lib/api";
import type { ApiErrorResponse, User } from "@/types/generic";

type MeResponse = {
  data: User;
  message: string;
  success: boolean;
};

export class MeApiError extends Error {
  status: number;
  response: ApiErrorResponse;

  constructor(status: number, response: ApiErrorResponse) {
    super(response.message);
    this.name = "MeApiError";
    this.status = status;
    this.response = response;
  }
}

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

const authMePath = "/auth/me";

function toMeApiError(error: unknown): MeApiError {
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    const data = error.response.data as Partial<ApiErrorResponse>;

    return new MeApiError(status, {
      message: data.message ?? "Unable to load your profile.",
      code: data.code,
      errors: data.errors,
      requestId: data.requestId ?? null,
    });
  }

  return new MeApiError(500, {
    message: "Unable to reach Aurex. Check your connection and try again.",
  });
}

export async function getMe(): Promise<User> {
  try {
    const response = await api.get<MeResponse>(authMePath);

    return response.data.data;
  } catch (error) {
    if (error instanceof MeApiError) {
      throw error;
    }

    throw toMeApiError(error);
  }
}
