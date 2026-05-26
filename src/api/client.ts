import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

// Token management module
// Access token stays in memory (secure against XSS)
// Refresh token persisted in sessionStorage (survives HMR and page navigation within tab)
let accessToken: string | null = null;

const REFRESH_TOKEN_KEY = 'salary_mgmt_refresh_token';

// Flag to prevent redirect during session restoration
let isRestoringSession = false;

export function setRestoringSession(value: boolean): void {
  isRestoringSession = value;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function setAccessToken(access: string): void {
  accessToken = access;
}

export function clearTokens(): void {
  accessToken = null;
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track whether a token refresh is in progress to avoid multiple refresh attempts
let isRefreshing = false;
let failedQueue: {
  resolve: (value: AxiosResponse) => void;
  reject: (reason: unknown) => void;
  config: InternalAxiosRequestConfig;
}[] = [];

function processQueue(error: unknown): void {
  failedQueue.forEach(({ reject }) => {
    reject(error);
  });
  failedQueue = [];
}

async function retryQueue(newToken: string): Promise<void> {
  const queue = [...failedQueue];
  failedQueue = [];
  for (const { resolve, reject, config } of queue) {
    config.headers.Authorization = `Bearer ${newToken}`;
    try {
      const response = await apiClient(config);
      resolve(response);
    } catch (err) {
      reject(err);
    }
  }
}

// Request interceptor: inject Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 → attempt token refresh → retry
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401 and if we haven't already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't attempt refresh for auth endpoints (login, refresh itself)
    const url = originalRequest.url || '';
    if (url.includes('/api/auth/login') || url.includes('/api/auth/token/refresh')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    isRefreshing = true;
    const currentRefreshToken = getRefreshToken();

    if (!currentRefreshToken) {
      isRefreshing = false;
      // Don't redirect if session is being restored — AuthContext handles it
      if (!isRestoringSession) {
        clearTokens();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    try {
      const response = await axios.post<{ access: string }>(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/token/refresh/`,
        { refresh: currentRefreshToken }
      );

      const newAccessToken = response.data.access;
      accessToken = newAccessToken;

      // Retry queued requests
      await retryQueue(newAccessToken);

      // Retry the original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      isRefreshing = false;
      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError);
      // Don't redirect if session is being restored — AuthContext handles it
      if (!isRestoringSession) {
        clearTokens();
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
