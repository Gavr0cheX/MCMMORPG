import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { parseBody, parseParams } from "../../shared/http/validation.js";
import { AppError } from "../../shared/http/errors.js";

const createCharacterSchema = z.object({
  name: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
  classKey: z.enum(["guardian", "ranger", "arcanist", "mender", "duelist"])
});

const idParams = z.object({ id: z.string().uuid() });

export async function characterRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: app.authenticate }, async (request) => {
    return app.prisma.character.findMany({
      where: { userId: request.userAuth!.sub, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: {
        statistics: true,
        guildMembership: { include: { guild: true } }
      }
    });
  });

  app.post("/", { preHandler: app.authenticate }, async (request) => {
    const input = parseBody(createCharacterSchema, request.body);
    const count = await app.prisma.character.count({
      where: { userId: request.userAuth!.sub, deletedAt: null }
    });

    if (count >= 8) {
      throw new AppError(409, "Character limit reached", "CHARACTER_LIMIT");
    }

    return app.prisma.character.create({
      data: {
        userId: request.userAuth!.sub,
        name: input.name,
        classKey: input.classKey,
        inventory: { create: { capacity: 54 } },
        statistics: { create: {} },
        skillProgress: {
          create: [
            { skillKey: `${input.classKey}.primary`, level: 1 },
            { skillKey: "gathering", level: 1 }
          ]
        }
      },
      include: { inventory: true, statistics: true, skillProgress: true }
    });
  });

  app.get("/:id", { preHandler: app.authenticate }, async (request) => {
    const { id } = parseParams(idParams, request.params);
    const character = await app.prisma.character.findFirst({
      where: { id, userId: request.userAuth!.sub, deletedAt: null },
      include: {
        inventory: { include: { slots: { orderBy: { slot: "asc" } } } },
        statistics: true,
        skillProgress: true,
        questProgress: true,
        guildMembership: { include: { guild: true } },
        partyMembership: { include: { party: true } }
      }
    });

    if (!character) {
      throw new AppError(404, "Character not found", "CHARACTER_NOT_FOUND");
    }

    return character;
  });

  app.delete("/:id", { preHandler: app.authenticate }, async (request) => {
    const { id } = parseParams(idParams, request.params);
    const result = await app.prisma.character.updateMany({
      where: { id, userId: request.userAuth!.sub, deletedAt: null },
      data: { status: "DELETED", deletedAt: new Date() }
    });

    if (result.count === 0) {
      throw new AppError(404, "Character not found", "CHARACTER_NOT_FOUND");
    }

    return { ok: true };
  });
}
