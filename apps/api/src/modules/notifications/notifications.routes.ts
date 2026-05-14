import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { parseBody } from "../../shared/http/validation.js";

const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100)
});

export async function notificationRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: app.authenticate }, async (request) => {
    return app.prisma.notification.findMany({
      where: { userId: request.userAuth!.sub },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  });

  app.post("/read", { preHandler: app.authenticate }, async (request) => {
    const input = parseBody(markReadSchema, request.body);
    await app.prisma.notification.updateMany({
      where: { id: { in: input.ids }, userId: request.userAuth!.sub },
      data: { readAt: new Date() }
    });

    return { ok: true };
  });
}
