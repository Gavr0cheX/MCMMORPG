import { AppError } from "./errors.js";
import type { z } from "zod";

export function parseBody<TSchema extends z.ZodTypeAny>(schema: TSchema, body: unknown): z.infer<TSchema> {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new AppError(400, result.error.issues[0]?.message ?? "Invalid request body", "VALIDATION_ERROR");
  }

  return result.data;
}

export function parseParams<TSchema extends z.ZodTypeAny>(schema: TSchema, params: unknown): z.infer<TSchema> {
  const result = schema.safeParse(params);
  if (!result.success) {
    throw new AppError(400, result.error.issues[0]?.message ?? "Invalid route params", "VALIDATION_ERROR");
  }

  return result.data;
}
