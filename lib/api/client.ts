"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let accessToken: string | null = null;
let refreshToken: string | null = null;

const ACCESS_TOKEN_KEY = "racesim_access_token";
const REFRESH_TOKEN_KEY = "racesim_refresh_token";

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
  }
  return API_BASE_URL;
}

export function loadStoredSession() {
  if (typeof window === "undefined") return;
  accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveSessionTokens(nextAccessToken: string, nextRefreshToken: string) {
  accessToken = nextAccessToken;
  refreshToken = nextRefreshToken;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
  }
}

export function clearSessionTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getAccessToken() {
  return accessToken;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401 && retry && refreshToken) {
    const refreshed = await refreshSession();
    if (refreshed) return request(path, init, false);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed");
  }
  return payload.data as T;
}

export async function refreshSession() {
  if (!refreshToken) return false;
  try {
    const data = await request<{
      session: { access_token: string; refresh_token: string } | null;
    }>(
      "/api/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      },
      false,
    );
    if (!data.session) return false;
    saveSessionTokens(data.session.access_token, data.session.refresh_token);
    return true;
  } catch {
    clearSessionTokens();
    return false;
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
