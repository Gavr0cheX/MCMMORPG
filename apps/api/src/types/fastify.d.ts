import type { PrismaClient } from "../generated/prisma/client.js";
import type { RedisService } from "../shared/redis/redis.service.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    redis: RedisService;
  }
}
