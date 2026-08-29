export const DEFAULT_API_BASE_URL = "http://localhost/api";
export const DEFAULT_WS_URL = "http://localhost";
export const DEFAULT_LAUNCHER_UPDATES_BASE_URL = "http://localhost/launcher-updates";

export function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function resolveBaseUrl(value: string | undefined, fallback: string) {
  return normalizeBaseUrl((value ?? fallback).trim());
}

export function resolveApiBaseUrl(value?: string) {
  return resolveBaseUrl(value, DEFAULT_API_BASE_URL);
}

export function resolveWebSocketUrl(value?: string) {
  return resolveBaseUrl(value, DEFAULT_WS_URL);
}

export function resolveLauncherUpdatesBaseUrl(value?: string) {
  return resolveBaseUrl(value, DEFAULT_LAUNCHER_UPDATES_BASE_URL);
}

export const serverKinds = ["LOBBY", "MMORPG", "DUNGEON", "MATCHMAKING"] as const;

export const defaultClassKeys = ["guardian", "ranger", "arcanist", "mender", "duelist"] as const;

export const redisKeyspace = {
  onlinePlayer: (playerId: string) => `online:${playerId}`,
  serverPlayers: (serverSlug: string) => `server:${serverSlug}:players`,
  partyState: (partyId: string) => `party:${partyId}:state`,
  guildState: (guildId: string) => `guild:${guildId}:state`,
  matchmakingQueue: (queueKey: string) => `matchmaking:${queueKey}`
};
