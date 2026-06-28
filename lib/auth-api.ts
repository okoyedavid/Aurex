import { AxiosError, type AxiosRequestConfig } from "axios";

import { api } from "@/lib/api";
import type {
  AuthRouteError,
  AuthRouteErrorResponse,
  LoginBody,
  LoginResult,
  RegisterBody,
  RegisterResult,
  ResendEmailBody,
  ResendEmailResult,
  VerifyEmailBody,
  VerifyEmailResult,
} from "@/frontend.types";

type AuthRequestConfig = AxiosRequestConfig & {
  _skipAuthRefresh: boolean;
};

const authBasePath = "/auth";

function toAuthRouteError(error: unknown): AuthRouteError {
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status as AuthRouteError["status"];
    const data = error.response.data as Partial<AuthRouteErrorResponse>;

    return {
      ok: false,
      status,
      error: {
        message: data.message ?? friendlyErrorMessage(status),
        requestId: data.requestId ?? null,
        details: data.details,
        stack: data.stack,
      },
    };
  }

  return {
    ok: false,
    status: 500,
    error: {
      message: "Unable to reach Aurex. Check your connection and try again.",
    },
  };
}

function friendlyErrorMessage(status: AuthRouteError["status"]) {
  if (status === 429) {
    return "Too many attempts. Please wait a moment, then try again.";
  }

  return "Something went wrong. Please try again.";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const authRequestConfig: AuthRequestConfig = {
  _skipAuthRefresh: true,
};

export async function login(body: LoginBody): Promise<LoginResult> {
  try {
    const response = await api.post(
      `${authBasePath}/login`,
      {
        email: normalizeEmail(body.email),
        password: body.password,
      },
      authRequestConfig,
    );

    return { ok: true, status: 200, ...response.data };
  } catch (error) {
    return toAuthRouteError(error);
  }
}

export async function register(body: RegisterBody): Promise<RegisterResult> {
  try {
    const response = await api.post(
      `${authBasePath}/register`,
      {
        name: body.name.trim(),
        email: normalizeEmail(body.email),
        password: body.password,
      },
      authRequestConfig,
    );

    return { ok: true, status: 201, ...response.data };
  } catch (error) {
    return toAuthRouteError(error);
  }
}

export async function verifyEmail(
  body: VerifyEmailBody,
): Promise<VerifyEmailResult> {
  try {
    const response = await api.post(
      `${authBasePath}/verify-email`,
      {
        email: normalizeEmail(body.email),
        otp: body.otp,
      },
      authRequestConfig,
    );

    return { ok: true, status: 200, ...response.data };
  } catch (error) {
    return toAuthRouteError(error);
  }
}

export async function resendEmail(
  body: ResendEmailBody,
): Promise<ResendEmailResult> {
  try {
    const response = await api.post(
      `${authBasePath}/resend-email`,
      {
        email: normalizeEmail(body.email),
      },
      authRequestConfig,
    );

    return { ok: true, status: 201, ...response.data };
  } catch (error) {
    return toAuthRouteError(error);
  }
}
