import axios, { AxiosError } from "axios";

import type {
  AuditEvent,
  DemoEmployee,
  DemoOverview,
  EmployeeExplanation,
  PolicyCategory,
  PolicyDetail,
  PolicySummary,
  ResolvedPolicy,
} from "./types";

const configuredApiUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000/api";

// The rest of Aurex stores `/api` in NEXT_PUBLIC_BACKEND_URL. This public
// client uses the backend origin so its route constants match the public API
// contract verbatim and can never produce `/api/api/...`.
export const warpDemoClient = axios.create({
  baseURL: configuredApiUrl.replace(/\/api\/?$/, ""),
  timeout: 6_000,
  withCredentials: false,
});

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function get<T>(path: string, params?: object) {
  try {
    const response = await warpDemoClient.get<ApiEnvelope<T>>(path, { params });
    return response.data.data;
  } catch (error) {
    const apiError = error as AxiosError<{ message?: string }>;
    throw new Error(
      apiError.response?.data?.message ??
        "The live Warp demo is unavailable. Check that the Aurex API is running, then retry.",
    );
  }
}

const root = "/api/demo/warp";

export interface WarpPolicyFilters {
  categoryId?: string;
  status?: string;
}

export interface WarpAuditFilters {
  limit?: number;
  employeeId?: string;
  policyId?: string;
  action?: string;
}

export const warpDemoApi = {
  overview: () => get<DemoOverview>(`${root}/overview`),
  employees: () => get<{ employees: DemoEmployee[] }>(`${root}/employees`),
  employee: (employeeId: string) =>
    get<DemoEmployee>(`${root}/employees/${encodeURIComponent(employeeId)}`),
  employeePolicies: (employeeId: string) =>
    get<{ employee: DemoEmployee; policies: ResolvedPolicy[] }>(
      `${root}/employees/${encodeURIComponent(employeeId)}/policies`,
    ),
  explainEmployee: (employeeId: string) =>
    get<EmployeeExplanation>(`${root}/employees/${encodeURIComponent(employeeId)}/explain`),
  categories: () => get<{ categories: PolicyCategory[] }>(`${root}/policy-categories`),
  policies: (filters?: WarpPolicyFilters) =>
    get<{ policies: PolicySummary[] }>(`${root}/policies`, filters),
  policy: (policyId: string) =>
    get<PolicyDetail>(`${root}/policies/${encodeURIComponent(policyId)}`),
  audit: (filters?: WarpAuditFilters) =>
    get<{ events: AuditEvent[] }>(`${root}/audit`, filters),
};
