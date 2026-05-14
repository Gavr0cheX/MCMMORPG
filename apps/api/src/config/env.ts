import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),
  COOKIE_SECRET: z.string().min(24),
  INTERNAL_API_TOKEN: z.string().min(16),
  CORS_ORIGINS: z.string().default("http://localhost,http://localhost:3001"),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_WINDOW: z.string().default("1 minute"),
  LAUNCHER_UPDATES_BASE_URL: z.string().url().default("http://localhost/launcher-updates")
});

export const env = envSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGINS.split(",").map((origin) => origin.trim());

export const isProduction = env.NODE_ENV === "production";
