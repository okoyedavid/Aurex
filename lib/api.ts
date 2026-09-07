import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

const REFRESH_BLOCK_MS = 1000;

type RefreshableRequestConfig = InternalAxiosRequestConfig & {
  _hasRetriedAfterRefresh?: boolean;
  _skipAuthRefresh?: boolean;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

const refreshPath = "/auth/refresh";

let refreshPromise: Promise<void> | null = null;
let refreshBlockedUntil = 0;
let authFailureHandler: (() => void) | null = null;
let authFailureHandled = false;

export function registerAuthFailureHandler(handler: () => void) {
  authFailureHandler = handler;
  authFailureHandled = false;

  return () => {
    if (authFailureHandler === handler) authFailureHandler = null;
  };
}

function handleAuthFailure() {
  if (authFailureHandled) return;
  authFailureHandled = true;
  authFailureHandler?.();
}

function isRefreshRequest(config?: AxiosRequestConfig) {
  const normalizedUrl = config?.url?.replace(/^\/+/, "");
  return normalizedUrl === "auth/refresh";
}

async function refreshSession() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const now = Date.now();
  if (now < refreshBlockedUntil) {
    return;
  }

  refreshBlockedUntil = now + REFRESH_BLOCK_MS;
  refreshPromise = (async (): Promise<void> => {
    await refreshClient.post(refreshPath, {}, {
      headers: { "Content-Type": "application/json" },
    });
  })().catch((error) => {
    handleAuthFailure();
    throw error;
  }).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const config = error.config as RefreshableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !config ||
      config._skipAuthRefresh ||
      isRefreshRequest(config)
    ) {
      throw error;
    }

    if (config._hasRetriedAfterRefresh) {
      handleAuthFailure();
      throw error;
    }

    config._hasRetriedAfterRefresh = true;

    await refreshSession();

    return api(config);
  },
);
