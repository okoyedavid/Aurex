import { AxiosError, type AxiosRequestConfig } from "axios";

import { api } from "@/lib/api";
import type {
  ApiErrorResponse,
  DeleteAvatarResponse,
  ForgotPasswordBody,
  ForgotPasswordResponse,
  ResetPasswordBody,
  ResetPasswordResponse,
  UpdateAvatarBody,
  UpdateAvatarResponse,
  UpdatePreferencesBody,
  UpdatePreferencesResponse,
  User,
} from "@/types/generic";

export type UpdateProfileBody = {
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string | null;
};

export type UpdateProfileResponse = {
  message: string;
  user: User;
};

export type RequestEmailChangeBody = {
  newEmail: string;
};

export type RequestEmailChangeResponse = {
  message: string;
};

export type VerifyEmailChangeBody = {
  otp: string;
};

export type VerifyEmailChangeResponse = {
  message: string;
  user: User;
};

export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  message: string;
};

export class AccountApiError extends Error {
  status: number;
  response: ApiErrorResponse;

  constructor(status: number, response: ApiErrorResponse) {
    super(response.message);
    this.name = "AccountApiError";
    this.status = status;
    this.response = response;
  }
}

const meBasePath = "/me";
const authPasswordBasePath = "/auth/password";

const authRecoveryRequestConfig: AxiosRequestConfig & {
  _skipAuthRefresh: boolean;
} = {
  _skipAuthRefresh: true,
};

function friendlyMessage(status: number) {
  if (status === 429) {
    return "Too many attempts. Please wait a moment before trying again.";
  }

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  return "Something went wrong. Please try again.";
}

function toAccountApiError(error: unknown): AccountApiError {
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    const data = error.response.data as Partial<ApiErrorResponse>;

    return new AccountApiError(status, {
      message: data.message ?? friendlyMessage(status),
      code: data.code,
      errors: data.errors,
      requestId: data.requestId ?? null,
      details: data.details,
      stack: data.stack,
    });
  }

  return new AccountApiError(500, {
    message: "Unable to reach Aurex. Check your connection and try again.",
  });
}

function unwrapUserResponse(
  response: Partial<UpdateProfileResponse> & { data?: User },
): UpdateProfileResponse {
  const user = response.user ?? response.data;

  if (!user) {
    throw new AccountApiError(500, {
      message: "Profile response did not include a user.",
    });
  }

  return {
    message: response.message ?? "Profile updated successfully.",
    user,
  };
}

export async function updateProfile(
  body: UpdateProfileBody,
): Promise<UpdateProfileResponse> {
  try {
    const response = await api.patch(`${meBasePath}`, body);

    return unwrapUserResponse(response.data);
  } catch (error) {
    if (error instanceof AccountApiError) {
      throw error;
    }

    throw toAccountApiError(error);
  }
}

export async function requestEmailChange(
  body: RequestEmailChangeBody,
): Promise<RequestEmailChangeResponse> {
  try {
    const response = await api.post<RequestEmailChangeResponse>(
      `${meBasePath}/email/change`,
      {
        newEmail: body.newEmail.trim().toLowerCase(),
      },
    );

    return response.data;
  } catch (error) {
    throw toAccountApiError(error);
  }
}

export async function verifyEmailChange(
  body: VerifyEmailChangeBody,
): Promise<VerifyEmailChangeResponse> {
  try {
    const response = await api.patch<VerifyEmailChangeResponse>(
      `${meBasePath}/email/change`,
      {
        otp: body.otp,
      },
    );

    return response.data;
  } catch (error) {
    throw toAccountApiError(error);
  }
}

export async function changePassword(
  body: ChangePasswordBody,
): Promise<ChangePasswordResponse> {
  try {
    const response = await api.patch<ChangePasswordResponse>(
      `${meBasePath}/password`,
      body,
    );

    return response.data;
  } catch (error) {
    throw toAccountApiError(error);
  }
}

export async function forgotPassword(
  body: ForgotPasswordBody,
): Promise<ForgotPasswordResponse> {
  try {
    const response = await api.post<ForgotPasswordResponse>(
      `${authPasswordBasePath}/forgot`,
      {
        email: body.email.trim().toLowerCase(),
      },
      authRecoveryRequestConfig,
    );

    return response.data;
  } catch (error) {
    throw toAccountApiError(error);
  }
}

export async function resetPassword(
  body: ResetPasswordBody,
): Promise<ResetPasswordResponse> {
  try {
    const response = await api.patch<ResetPasswordResponse>(
      `${authPasswordBasePath}/reset`,
      {
        email: body.email.trim().toLowerCase(),
        otp: body.otp,
        newPassword: body.newPassword,
      },
      authRecoveryRequestConfig,
    );

    return response.data;
  } catch (error) {
    throw toAccountApiError(error);
  }
}

export async function updateAvatar(
  body: UpdateAvatarBody,
): Promise<UpdateAvatarResponse> {
  try {
    const response = await api.patch<UpdateAvatarResponse>(
      `${meBasePath}/avatar`,
      body,
    );

    return response.data;
  } catch (error) {
    throw toAccountApiError(error);
  }
}

export async function deleteAvatar(): Promise<DeleteAvatarResponse> {
  try {
    const response = await api.delete<DeleteAvatarResponse>(
      `${meBasePath}/avatar`,
    );

    return response.data;
  } catch (error) {
    throw toAccountApiError(error);
  }
}

export async function updatePreferences(
  body: UpdatePreferencesBody,
): Promise<UpdatePreferencesResponse> {
  try {
    const response = await api.patch<UpdatePreferencesResponse>(
      `${meBasePath}/preferences`,
      body,
    );

    return response.data;
  } catch (error) {
    throw toAccountApiError(error);
  }
}
