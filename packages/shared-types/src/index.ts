import { z } from "zod";

export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string(),
  displayName: z.string().nullable(),
  role: z.enum(["PLAYER", "MODERATOR", "ADMIN", "SERVICE"]),
  status: z.enum(["ACTIVE", "LOCKED", "BANNED", "PENDING_VERIFICATION"])
});

export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: authUserSchema
});

export const serverStatusSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  kind: z.enum(["LOBBY", "MMORPG", "DUNGEON", "MATCHMAKING"]),
  status: z.enum(["STARTING", "ONLINE", "DRAINING", "OFFLINE", "FAILED"]),
  onlinePlayers: z.number(),
  maxPlayers: z.number(),
  lastHeartbeatAt: z.string().nullable().optional()
});

export const characterSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  classKey: z.string(),
  level: z.number(),
  experience: z.string().or(z.number()).optional(),
  currentServerSlug: z.string().nullable().optional()
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type ServerStatus = z.infer<typeof serverStatusSchema>;
export type CharacterSummary = z.infer<typeof characterSummarySchema>;

export type LauncherManifest = {
  channel: "stable" | "beta" | "alpha";
  version: string;
  minimumLauncherVersion: string;
  minecraftVersion: string;
  manifestUrl: string;
  assetBaseUrl: string;
};

export type RealtimeNotification = {
  id: string;
  type: string;
  payload: unknown;
  publishedAt: string;
};
