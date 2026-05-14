import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import { env } from "../../config/env.js";
import { parseBody } from "../../shared/http/validation.js";
import { AppError } from "../../shared/http/errors.js";
import { redisChannels } from "../../shared/redis/events.js";

const heartbeatSchema = z.object({
  token: z.string(),
  slug: z.string().min(1),
  status: z.enum(["STARTING", "ONLINE", "DRAINING", "OFFLINE", "FAILED"]),
  onlinePlayers: z.coerce.number().int().min(0),
  maxPlayers: z.coerce.number().int().positive(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export async function serverRoutes(app: FastifyInstance) {
  app.get("/status", async () => {
    return app.prisma.gameServer.findMany({
      where: { deletedAt: null },
      orderBy: [{ kind: "asc" }, { slug: "asc" }]
    });
  });

  app.post("/heartbeat", async (request) => {
    const input = parseBody(heartbeatSchema, request.body);
    if (input.token !== env.INTERNAL_API_TOKEN) {
      throw new AppError(401, "Invalid internal token", "INVALID_INTERNAL_TOKEN");
    }

    const metadata = input.metadata as Prisma.InputJsonValue | undefined;
    const lastHeartbeatAt = new Date();
    const server = await app.prisma.gameServer.upsert({
      where: { slug: input.slug },
      update: {
        status: input.status,
        onlinePlayers: input.onlinePlayers,
        maxPlayers: input.maxPlayers,
        ...(metadata !== undefined ? { metadata } : {}),
        lastHeartbeatAt
      },
      create: {
        slug: input.slug,
        kind: input.slug === "lobby" ? "LOBBY" : "MMORPG",
        address: input.slug,
        status: input.status,
        onlinePlayers: input.onlinePlayers,
        maxPlayers: input.maxPlayers,
        ...(metadata !== undefined ? { metadata } : {}),
        lastHeartbeatAt
      }
    });

    await app.redis.recordServerHeartbeat({
      slug: input.slug,
      status: input.status,
      onlinePlayers: input.onlinePlayers,
      maxPlayers: input.maxPlayers,
      metadata: input.metadata,
      lastHeartbeatAt: lastHeartbeatAt.toISOString()
    });
    app.metrics.onlinePlayers.set({ server: input.slug }, input.onlinePlayers);
    await app.redis.publish(redisChannels.serverHeartbeats, "server.heartbeat", {
      serverSlug: input.slug,
      onlinePlayers: input.onlinePlayers,
      status: input.status
    });

    return server;
  });
}
