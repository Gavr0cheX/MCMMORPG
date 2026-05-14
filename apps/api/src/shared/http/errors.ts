import type { FastifyReply } from "fastify";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = "APP_ERROR"
  ) {
    super(message);
  }
}

export function sendError(reply: FastifyReply, error: unknown) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message
    });
  }

  return reply.status(500).send({
    error: "INTERNAL_SERVER_ERROR",
    message: "Unexpected server error"
  });
}
