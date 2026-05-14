import type { ServerStatus } from "@mmorpg/shared-types";
import { apiFetch } from "@/lib/api";

export function getServerStatus() {
  return apiFetch<ServerStatus[]>("/servers/status", { auth: false });
}
