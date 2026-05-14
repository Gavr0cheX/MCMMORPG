export const redisChannels = {
  globalChat: "chat:global",
  guild: (guildId: string) => `guild:${guildId}:events`,
  party: (partyId: string) => `party:${partyId}:events`,
  notifications: "notifications:realtime",
  authSessions: "auth:sessions",
  serverHeartbeats: "servers:heartbeats",
  matchmaking: "matchmaking:events",
  economy: "economy:events"
} as const;

export type RedisEvent<TPayload = unknown> = {
  id: string;
  type: string;
  payload: TPayload;
  publishedAt: string;
  source: "api" | "plugin" | "launcher" | "service";
};
