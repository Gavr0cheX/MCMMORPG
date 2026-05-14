import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { parseBody } from "../../shared/http/validation.js";
import { AppError } from "../../shared/http/errors.js";

const requestSchema = z.object({
  addresseeUsername: z.string().min(3).max(24)
});

export async function friendRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: app.authenticate }, async (request) => {
    return app.prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: request.userAuth!.sub }, { addresseeId: request.userAuth!.sub }]
      },
      include: {
        requester: { select: { id: true, username: true, displayName: true } },
        addressee: { select: { id: true, username: true, displayName: true } }
      }
    });
  });

  app.post("/requests", { preHandler: app.authenticate }, async (request) => {
    const input = parseBody(requestSchema, request.body);
    const addressee = await app.prisma.user.findUnique({ where: { username: input.addresseeUsername } });

    if (!addressee || addressee.id === request.userAuth!.sub) {
      throw new AppError(404, "Player not found", "PLAYER_NOT_FOUND");
    }

    return app.prisma.friendship.upsert({
      where: {
        requesterId_addresseeId: {
          requesterId: request.userAuth!.sub,
          addresseeId: addressee.id
        }
      },
      update: { status: "PENDING" },
      create: {
        requesterId: request.userAuth!.sub,
        addresseeId: addressee.id,
        status: "PENDING"
      }
    });
  });
}
