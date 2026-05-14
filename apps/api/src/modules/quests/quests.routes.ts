import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { parseParams } from "../../shared/http/validation.js";
import { AppError } from "../../shared/http/errors.js";

const paramsSchema = z.object({ characterId: z.string().uuid() });

export async function questRoutes(app: FastifyInstance) {
  app.get("/:characterId", { preHandler: app.authenticate }, async (request) => {
    const { characterId } = parseParams(paramsSchema, request.params);
    const character = await app.prisma.character.findFirst({
      where: { id: characterId, userId: request.userAuth!.sub, deletedAt: null }
    });

    if (!character) {
      throw new AppError(404, "Character not found", "CHARACTER_NOT_FOUND");
    }

    return app.prisma.questProgress.findMany({
      where: { characterId },
      orderBy: { updatedAt: "desc" }
    });
  });
}
