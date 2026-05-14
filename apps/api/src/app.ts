import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env, corsOrigins, isProduction } from "./config/env.js";
import { prisma } from "./db/prisma.js";
import { RedisService } from "./shared/redis/redis.service.js";
import { sendError } from "./shared/http/errors.js";
import { authenticatePlugin } from "./shared/plugins/authenticate.js";
import { metricsPlugin } from "./shared/plugins/metrics.js";
import { registerRealtime } from "./shared/realtime/socket.js";
import { registerRoutes } from "./routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "development" ? "debug" : "info"
    },
    trustProxy: true
  });

  app.decorate("prisma", prisma);

  const redis = new RedisService(env.REDIS_URL, app.log);
  await redis.connect();
  app.decorate("redis", redis);

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: false
  });
  await app.register(cors, {
    origin: corsOrigins,
    credentials: true
  });
  await app.register(cookie, { secret: env.COOKIE_SECRET });
  await app.register(jwt, {
    secret: env.JWT_ACCESS_SECRET,
    cookie: {
      cookieName: "accessToken",
      signed: false
    }
  });
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW
  });
  await app.register(swagger, {
    openapi: {
      info: {
        title: "MMORPG Platform API",
        version: "0.1.0"
      },
      servers: [{ url: "/api" }]
    }
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });
  await app.register(authenticatePlugin);
  await app.register(metricsPlugin);

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    return sendError(reply, error);
  });

  app.get("/healthz", async () => {
    const [database, redisPong] = await Promise.all([app.prisma.$queryRaw`SELECT 1`, app.redis.ping()]);
    return {
      ok: true,
      database: Boolean(database),
      redis: redisPong === "PONG",
      environment: env.NODE_ENV
    };
  });

  await registerRoutes(app);
  await registerRealtime(app, redis);

  app.addHook("onClose", async () => {
    await app.prisma.$disconnect();
    await app.redis.disconnect();
  });

  app.addHook("onSend", async (_request, reply) => {
    if (isProduction) {
      reply.header("x-content-type-options", "nosniff");
    }
  });

  return app;
}
