import type { AuthResponse } from "@mmorpg/shared-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost/api";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      window.localStorage.setItem("accessToken", token);
    } else {
      window.localStorage.removeItem("accessToken");
    }
  }
}

export function getAccessToken() {
  if (accessToken) {
    return accessToken;
  }

  if (typeof window !== "undefined") {
    accessToken = window.localStorage.getItem("accessToken");
  }

  return accessToken;
}

async function refreshAccessToken() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    setAccessToken(null);
    return null;
  }

  const data = (await response.json()) as AuthResponse;
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("content-type", headers.get("content-type") ?? "application/json");

  const token = getAccessToken();
  if (options.auth !== false && token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers
  });

  if (response.status === 401 && options.auth !== false) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, options);
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(payload.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}
