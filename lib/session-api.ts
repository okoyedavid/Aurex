import { AxiosError, type AxiosRequestConfig } from "axios";

import { api } from "@/lib/api";
import type {
  GetMySessionsResponse,
  RevokeOtherSessionsResponse,
  RevokeSessionResponse,
  SessionRouteErrorResponse,
} from "@/types/generic";

type SessionRequestConfig = AxiosRequestConfig & {
  _skipAuthRefresh: boolean;
};

export class SessionApiError extends Error {
  status: number;
  response: SessionRouteErrorResponse;

  constructor(status: number, response: SessionRouteErrorResponse) {
    super(response.message);
    this.name = "SessionApiError";
    this.status = status;
    this.response = response;
  }
}

const sessionBasePath = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(
  /\/+$/,
  "",
).endsWith("/api")
  ? "/me/sessions"
  : "/api/me/sessions";

const sessionRequestConfig: SessionRequestConfig = {
  _skipAuthRefresh: true,
};

function friendlySessionMessage(status: number) {
  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 404) {
    return "Session not found.";
  }

  if (status === 429) {
    return "Too many attempts. Please wait a moment before trying again.";
  }

  return "Unable to update sessions. Please try again.";
}

function toSessionApiError(error: unknown): SessionApiError {
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    const data = error.response.data as Partial<SessionRouteErrorResponse>;

    return new SessionApiError(status, {
      message: data.message ?? friendlySessionMessage(status),
      requestId: data.requestId ?? null,
      details: data.details,
      stack: data.stack,
    });
  }

  return new SessionApiError(500, {
    message: "Unable to reach Aurex. Check your connection and try again.",
  });
}

export async function getMySessions(): Promise<GetMySessionsResponse> {
  try {
    const response = await api.get<GetMySessionsResponse>(
      sessionBasePath,
      sessionRequestConfig,
    );

    return response.data;
  } catch (error) {
    throw toSessionApiError(error);
  }
}

export async function revokeSession(
  userSessionId: string,
): Promise<RevokeSessionResponse> {
  try {
    const response = await api.delete<RevokeSessionResponse>(
      `${sessionBasePath}/${encodeURIComponent(userSessionId)}`,
      sessionRequestConfig,
    );

    return response.data;
  } catch (error) {
    throw toSessionApiError(error);
  }
}

export async function revokeOtherSessions(): Promise<RevokeOtherSessionsResponse> {
  try {
    const response = await api.delete<RevokeOtherSessionsResponse>(
      sessionBasePath,
      sessionRequestConfig,
    );

    return response.data;
  } catch (error) {
    throw toSessionApiError(error);
  }
}
