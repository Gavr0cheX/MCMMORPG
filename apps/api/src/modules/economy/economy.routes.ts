import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { parseBody } from "../../shared/http/validation.js";
import { redisChannels } from "../../shared/redis/events.js";

const grantSchema = z.object({
  characterId: z.string().uuid(),
  currency: z.string().min(1).max(24).default("gold"),
  amount: z.coerce.number().positive(),
  reason: z.string().min(3).max(255)
});

export async function economyRoutes(app: FastifyInstance) {
  app.post("/admin/grant", { preHandler: app.authorize(["ADMIN", "MODERATOR"]) }, async (request) => {
    const input = parseBody(grantSchema, request.body);

    const transaction = await app.prisma.economyTransaction.create({
      data: {
        characterId: input.characterId,
        actorUserId: request.userAuth!.sub,
        type: "ADMIN_ADJUSTMENT",
        amount: input.amount,
        currency: input.currency,
        reason: input.reason
      }
    });

    await app.prisma.auditLog.create({
      data: {
        actorUserId: request.userAuth!.sub,
        action: "economy.admin_grant",
        targetType: "character",
        targetId: input.characterId,
        metadata: input
      }
    });

    await app.redis.publish(redisChannels.economy, "economy.grant", {
      characterId: input.characterId,
      currency: input.currency,
      amount: input.amount
    });

    return transaction;
  });
}
