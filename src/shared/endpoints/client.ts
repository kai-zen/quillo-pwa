import axios from "axios";
import type { EndpointDef, EndpointOptions } from "./types";

const AUTH_TOKEN_KEY = "quillo_auth_token";
export const AUTH_CHANGED_EVENT = "quillo-auth-changed";

const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const subscribeAuth = (onStoreChange: () => void) => {
  window.addEventListener(AUTH_CHANGED_EVENT, onStoreChange);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, onStoreChange);
};

export const API_BASE_URL = "https://quillo-api.sofre.app";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token: string | null): void => {
  if (typeof window === "undefined") return;

  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);

  notifyAuthChanged();
};

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getAuthToken()) {
      setAuthToken(null);
    }
    return Promise.reject(error);
  },
);

const resolvePath = <TParams>(
  path: EndpointDef<unknown, never, never, TParams>["path"],
  params?: TParams,
): string => {
  if (typeof path === "function") {
    if (!params) {
      throw new Error("Path params are required for this endpoint.");
    }
    return path(params);
  }
  return path;
};

export const request = async <
  TResponse,
  TBody = never,
  TQuery = never,
  TParams = never,
>(
  endpoint: EndpointDef<TResponse, TBody, TQuery, TParams>,
  options?: EndpointOptions<TBody, TQuery, TParams>,
): Promise<TResponse> => {
  const path = resolvePath(endpoint.path, options?.params);

  const response = await apiClient.request<TResponse>({
    method: endpoint.method,
    url: path,
    data: options?.body,
    params: options?.query,
  });

  return response.data;
};
