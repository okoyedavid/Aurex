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
  ReconciliationRun,
  WarpDemoMutation,
  WarpDemoSession,
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

export class WarpDemoError extends Error {
  constructor(public status: number | undefined, message: string) {
    super(message);
    this.name = "WarpDemoError";
  }
}

async function request<T>(method: "post" | "get", path: string, body?: unknown) {
  try {
    const response = await warpDemoClient.request<ApiEnvelope<T>>({ method, url: path, data: body });
    return response.data.data;
  } catch (error) {
    const apiError = error as AxiosError<{ message?: string }>;
    const status = apiError.response?.status;
    const messages: Record<number, string> = {
      400: "That change is not supported by the live demo.",
      409: "A reconciliation is already in progress.",
      410: "Your demo session expired.",
      423: "Live demo currently in use. Another visitor is changing the demo scenario. Try again shortly.",
      429: "Demo limit reached. This temporary sandbox has reached its mutation limit.",
      503: "Live reconciliation is temporarily unavailable.",
    };
    throw new WarpDemoError(status, messages[status ?? 0] ?? "The live Warp demo is unavailable. Please try again.");
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
  createSession: () => request<WarpDemoSession>("post", `${root}/session`, {}),
  mutate: (sessionId: string, mutation: WarpDemoMutation) => request<{ runId: string; status: "queued" }>("post", `${root}/session/${encodeURIComponent(sessionId)}/mutations`, mutation),
  reset: (sessionId: string) => request<{ runId: string; status: "queued"; employee: DemoEmployee }>("post", `${root}/session/${encodeURIComponent(sessionId)}/reset`, {}),
  reconciliationRun: (sessionId: string, runId: string) => request<ReconciliationRun>("get", `${root}/session/${encodeURIComponent(sessionId)}/reconciliation/${encodeURIComponent(runId)}`),
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
