import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(255),
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(12).max(128),
  displayName: z.string().min(1).max(40).optional()
});

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(32).optional()
});

export const minecraftLoginValidationSchema = z.object({
  token: z.string(),
  username: z.string().min(3).max(16).regex(/^[a-zA-Z0-9_]+$/),
  minecraftUuid: z.string().uuid(),
  serverSlug: z.string().min(1).max(64),
  launcherToken: z.string().min(16).optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MinecraftLoginValidationInput = z.infer<typeof minecraftLoginValidationSchema>;
