import type { AuthResponse } from "@mmorpg/shared-types";
import { apiFetch } from "@/lib/api";

export function login(input: { identifier: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(input)
  });
}

export function register(input: { email: string; username: string; password: string; displayName?: string }) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify(input)
  });
}
