import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { parseBody } from "../../shared/http/validation.js";
import { AppError } from "../../shared/http/errors.js";

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(40).optional()
});

export async function userRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: app.authenticate }, async (request) => {
    const user = await app.prisma.user.findUnique({
      where: { id: request.userAuth!.sub },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError(404, "Profile not found", "PROFILE_NOT_FOUND");
    }

    return user;
  });

  app.patch("/", { preHandler: app.authenticate }, async (request) => {
    const input = parseBody(updateProfileSchema, request.body);
    return app.prisma.user.update({
      where: { id: request.userAuth!.sub },
      data: {
        ...(input.displayName !== undefined ? { displayName: input.displayName } : {})
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        status: true
      }
    });
  });
}
