import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { parseBody } from "../../shared/http/validation.js";
import { redisChannels } from "../../shared/redis/events.js";

const createPartySchema = z.object({
  leaderCharacterId: z.string().uuid(),
  maxSize: z.coerce.number().int().min(2).max(10).default(5)
});

export async function partyRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: app.authenticate }, async (request) => {
    const input = parseBody(createPartySchema, request.body);
    const party = await app.prisma.party.create({
      data: {
        leaderCharacterId: input.leaderCharacterId,
        maxSize: input.maxSize,
        members: {
          create: {
            characterId: input.leaderCharacterId,
            role: "LEADER"
          }
        }
      },
      include: { members: true }
    });

    await app.redis.publish(redisChannels.party(party.id), "party.created", { partyId: party.id });
    return party;
  });
}
