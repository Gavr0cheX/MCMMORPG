import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { parseBody, parseParams } from "../../shared/http/validation.js";
import { AppError } from "../../shared/http/errors.js";
import { redisChannels } from "../../shared/redis/events.js";

const createGuildSchema = z.object({
  characterId: z.string().uuid(),
  name: z.string().min(3).max(32),
  tag: z.string().min(2).max(6).regex(/^[A-Z0-9]+$/),
  description: z.string().max(500).optional()
});

const idParams = z.object({ id: z.string().uuid() });

export async function guildRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return app.prisma.guild.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { _count: { select: { members: true } } }
    });
  });

  app.post("/", { preHandler: app.authenticate }, async (request) => {
    const input = parseBody(createGuildSchema, request.body);
    const character = await app.prisma.character.findFirst({
      where: { id: input.characterId, userId: request.userAuth!.sub, deletedAt: null },
      include: { guildMembership: true }
    });

    if (!character || character.guildMembership) {
      throw new AppError(409, "Character cannot create a guild", "GUILD_CREATE_FORBIDDEN");
    }

    const guild = await app.prisma.guild.create({
      data: {
        ownerId: request.userAuth!.sub,
        name: input.name,
        tag: input.tag,
        description: input.description ?? null,
        members: {
          create: {
            characterId: input.characterId,
            role: "OWNER"
          }
        }
      },
      include: { members: true }
    });

    await app.redis.publish(redisChannels.guild(guild.id), "guild.created", { guildId: guild.id });
    return guild;
  });

  app.get("/:id", async (request) => {
    const { id } = parseParams(idParams, request.params);
    const guild = await app.prisma.guild.findFirst({
      where: { id, deletedAt: null },
      include: {
        members: {
          include: {
            character: {
              select: { id: true, name: true, level: true, classKey: true }
            }
          }
        }
      }
    });

    if (!guild) {
      throw new AppError(404, "Guild not found", "GUILD_NOT_FOUND");
    }

    return guild;
  });
}
