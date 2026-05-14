import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import { parseBody } from "../../shared/http/validation.js";
import { redisChannels } from "../../shared/redis/events.js";

const sendMailSchema = z.object({
  recipientUserId: z.string().uuid(),
  subject: z.string().min(1).max(120),
  body: z.string().min(1).max(5000),
  attachments: z.unknown().optional()
});

export async function mailRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: app.authenticate }, async (request) => {
    return app.prisma.mail.findMany({
      where: { recipientUserId: request.userAuth!.sub, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  });

  app.post("/", { preHandler: app.authenticate }, async (request) => {
    const input = parseBody(sendMailSchema, request.body);
    const mail = await app.prisma.mail.create({
      data: {
        senderUserId: request.userAuth!.sub,
        recipientUserId: input.recipientUserId,
        subject: input.subject,
        body: input.body,
        ...(input.attachments !== undefined ? { attachments: input.attachments as Prisma.InputJsonValue } : {})
      }
    });

    await app.redis.publish(redisChannels.notifications, "mail.received", {
      userId: input.recipientUserId,
      title: "New mail",
      body: input.subject
    });

    return mail;
  });
}
