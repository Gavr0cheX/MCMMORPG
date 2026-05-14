import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { parseBody } from "../../shared/http/validation.js";

const querySchema = z.object({
  scope: z.string().default("global"),
  season: z.string().default("current"),
  metric: z.string().default("level"),
  take: z.coerce.number().int().min(1).max(100).default(25)
});

export async function leaderboardRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const query = querySchema.parse(request.query);
    return app.prisma.leaderboardEntry.findMany({
      where: {
        scope: query.scope,
        season: query.season,
        metric: query.metric
      },
      orderBy: { rank: "asc" },
      take: query.take,
      include: {
        character: {
          select: { id: true, name: true, classKey: true, level: true }
        }
      }
    });
  });

  app.post("/recalculate", { preHandler: app.authorize(["ADMIN"]) }, async (request) => {
    const input = parseBody(querySchema, request.body ?? {});
    return {
      queued: true,
      scope: input.scope,
      season: input.season,
      metric: input.metric
    };
  });
}
