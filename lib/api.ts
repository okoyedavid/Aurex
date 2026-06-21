import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const MAX_REFRESH_ATTEMPTS = 3;
const REFRESH_BLOCK_MS = 1000;

type RefreshableRequestConfig = InternalAxiosRequestConfig & {
  _hasRetriedAfterRefresh?: boolean;
  _skipAuthRefresh?: boolean;
};

type RefreshResponse = {
  accessToken?: string;
  token?: string;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

let refreshPromise: Promise<AxiosResponse<RefreshResponse>> | null = null;
let refreshBlockedUntil = 0;

function isRefreshRequest(config?: AxiosRequestConfig) {
  return config?.url?.replace(/^\/+/, "") === "refresh";
}

function setAccessToken(token?: string) {
  if (!token) {
    delete api.defaults.headers.common.Authorization;
    return;
  }

  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

async function refreshSession() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const now = Date.now();
  if (now < refreshBlockedUntil) {
    throw new Error("Refresh request is temporarily blocked.");
  }

  refreshBlockedUntil = now + REFRESH_BLOCK_MS;
  refreshPromise = (async () => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_REFRESH_ATTEMPTS; attempt += 1) {
      try {
        const response = await refreshClient.post<RefreshResponse>("/refresh");
        setAccessToken(response.data.accessToken ?? response.data.token);
        return response;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  })().finally(() => {
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
      throw error;
    }

    config._hasRetriedAfterRefresh = true;

    await refreshSession();

    return api(config);
  },
);

export function setApiAccessToken(token?: string) {
  setAccessToken(token);
}
