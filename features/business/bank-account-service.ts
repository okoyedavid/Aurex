import { AxiosError } from "axios";

import { api } from "@/lib/api";
import type { ApiErrorResponse } from "@/types/generic";

export type Bank = {
  id?: number;
  name: string;
  slug: string;
  code: string;
  country: string;
  currency: string;
  type: string;
};

export type ResolveBankAccountBody = {
  bankCode: string;
  accountNumber: string;
};

export type ResolvedBankAccount = {
  accountNumber: string;
  accountName: string;
  bankId: number;
};

type ResolvedBankAccountResponse = {
  accountNumber: string;
  accountName: string;
  bankId: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const paystackBasePath = "/paystack";

function toPaystackError(error: unknown, fallback: string) {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as Partial<ApiErrorResponse>;
    return new Error(data.message ?? fallback);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallback);
}

export async function getBanks(): Promise<Bank[]> {
  try {
    const response = await api.get<ApiResponse<Bank[]>>(
      `${paystackBasePath}/banks`,
    );

    return response.data.data;
  } catch (error) {
    throw toPaystackError(error, "Unable to load banks.");
  }
}

export async function resolveBankAccount(
  body: ResolveBankAccountBody,
): Promise<ResolvedBankAccount> {
  try {
    const response = await api.get<ApiResponse<ResolvedBankAccountResponse>>(
      `${paystackBasePath}/bank-account/resolve`,
      {
        params: {
          bankCode: body.bankCode,
          accountNumber: body.accountNumber,
        },
      },
    );

    const data = response.data.data;
    if (!data.accountNumber || !data.accountName) {
      throw new Error("The account response was incomplete. Please try again.");
    }

    return data;
  } catch (error) {
    throw toPaystackError(error, "Unable to resolve bank account.");
  }
}
