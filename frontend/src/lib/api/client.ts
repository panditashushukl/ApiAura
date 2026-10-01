import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

// 1. Base URL normalization
const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

// 2. Structured API Error Class
export interface BackendErrorPayload {
  success?: boolean;
  message?: string;
  error?: string;
  path?: string;
  timestamp?: string;
  traceId?: string;
  validationErrors?: Record<string, string>;
}

export class ApiError extends Error {
  public status: number;
  public errorType?: string;
  public path?: string;
  public validationErrors?: Record<string, string>;
  public details?: unknown;

  constructor(
    message: string,
    status: number,
    validationErrors?: Record<string, string>,
    errorType?: string,
    path?: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.validationErrors = validationErrors;
    this.errorType = errorType;
    this.path = path;
    this.details = details;
  }
}

// 3. Create pre-configured Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Helper token store for runtime memory token
let inMemoryAccessToken: string | null = null;

export function setApiAccessToken(token: string | null) {
  inMemoryAccessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }
}

export function getApiAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

// 4. Request Interceptor: Attach Auth Token dynamically
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getApiAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 5. Response Interceptor: Normalize errors & handle common HTTP statuses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<BackendErrorPayload>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      const message =
        data?.message ||
        data?.error ||
        (status === 401
          ? "Unauthorized access. Please sign in."
          : status === 403
          ? "You do not have permission to perform this action."
          : status === 404
          ? "Requested resource was not found."
          : status === 429
          ? "Too many requests. Please slow down."
          : status >= 500
          ? "An unexpected server error occurred."
          : error.message || "An unexpected error occurred.");

      if (status === 401 && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("apiaura:unauthorized"));
      }

      return Promise.reject(
        new ApiError(
          message,
          status,
          data?.validationErrors,
          data?.error,
          data?.path,
          data
        )
      );
    }

    if (error.request) {
      return Promise.reject(
        new ApiError("Network error. Please check your connection to backend.", 0)
      );
    }

    return Promise.reject(new ApiError(error.message, 500));
  }
);

// 6. Generic Wrapper Function
export interface CustomRequestOptions extends AxiosRequestConfig {
  token?: string;
}

export async function apiClient<T>(
  path: string,
  options: CustomRequestOptions = {}
): Promise<T> {
  const { token, headers, ...restConfig } = options;

  let cleanPath = path;
  if (cleanPath.startsWith("/api/v1")) {
    cleanPath = cleanPath.substring(7);
  }
  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }

  const requestHeaders = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await axiosInstance.request<T>({
    url: cleanPath,
    headers: requestHeaders,
    ...restConfig,
  });

  return response.data;
}

// 7. Shorthand Methods
export const api = {
  get: <T>(url: string, config?: CustomRequestOptions) =>
    apiClient<T>(url, { ...config, method: "GET" }),

  post: <T>(url: string, data?: unknown, config?: CustomRequestOptions) =>
    apiClient<T>(url, { ...config, method: "POST", data }),

  put: <T>(url: string, data?: unknown, config?: CustomRequestOptions) =>
    apiClient<T>(url, { ...config, method: "PUT", data }),

  patch: <T>(url: string, data?: unknown, config?: CustomRequestOptions) =>
    apiClient<T>(url, { ...config, method: "PATCH", data }),

  delete: <T>(url: string, config?: CustomRequestOptions) =>
    apiClient<T>(url, { ...config, method: "DELETE" }),
};