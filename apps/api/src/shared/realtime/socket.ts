import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import { corsOrigins } from "../../config/env.js";
import { redisChannels } from "../redis/events.js";
import type { RedisService } from "../redis/redis.service.js";
import type { AuthClaims } from "../plugins/authenticate.js";

export async function registerRealtime(app: FastifyInstance, redis: RedisService) {
  const io = new Server(app.server, {
    path: "/socket.io",
    cors: {
      origin: corsOrigins,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token ?? socket.handshake.headers.authorization?.replace("Bearer ", "");
      if (!token || typeof token !== "string") {
        return next(new Error("missing token"));
      }

      socket.data.user = app.jwt.verify<AuthClaims>(token);
      return next();
    } catch {
      return next(new Error("invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as AuthClaims;
    socket.join(`user:${user.sub}`);

    socket.on("party:join", (partyId: string) => {
      socket.join(`party:${partyId}`);
    });

    socket.on("guild:join", (guildId: string) => {
      socket.join(`guild:${guildId}`);
    });
  });

  await redis.subscribe<{ userId: string; title: string; body: string }>(redisChannels.notifications, (event) => {
    io.to(`user:${event.payload.userId}`).emit("notification", event);
  });

  await redis.subscribe<{ serverSlug: string; onlinePlayers: number }>(redisChannels.serverHeartbeats, (event) => {
    io.emit("server:heartbeat", event.payload);
  });

  app.addHook("onClose", async () => {
    await io.close();
  });

  return io;
}
