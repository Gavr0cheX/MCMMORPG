import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/http/errors.js";
import { parseBody } from "../../shared/http/validation.js";
import type { AuthClaims } from "../../shared/plugins/authenticate.js";
import { redisChannels } from "../../shared/redis/events.js";

const validateLauncherSessionSchema = z.object({
  token: z.string(),
  accessToken: z.string().min(32)
});

const minecraftUsernameSchema = z.string().min(3).max(16).regex(/^[a-zA-Z0-9_]+$/);

const startPlaySessionSchema = z.object({
  minecraftUsername: minecraftUsernameSchema.optional()
});

export async function launcherRoutes(app: FastifyInstance) {
  app.get("/manifest", async () => {
    return {
      channel: "stable",
      version: "0.1.0",
      minimumLauncherVersion: "0.1.0",
      manifestUrl: `${env.LAUNCHER_UPDATES_BASE_URL}/manifest.json`,
      minecraftVersion: process.env.MINECRAFT_VERSION ?? "1.21.8",
      assetBaseUrl: env.LAUNCHER_UPDATES_BASE_URL
    };
  });

  app.get("/news", async () => {
    return [
      {
        id: "welcome",
        title: "Network foundation online",
        summary: "The MMORPG platform scaffold now has API, launcher, proxy, and server plumbing.",
        publishedAt: new Date().toISOString()
      }
    ];
  });

  app.post("/session/validate", async (request) => {
    const input = parseBody(validateLauncherSessionSchema, request.body);
    if (input.token !== env.INTERNAL_API_TOKEN) {
      throw new AppError(401, "Invalid internal token", "INVALID_INTERNAL_TOKEN");
    }

    let claims: AuthClaims;
    try {
      claims = app.jwt.verify<AuthClaims>(input.accessToken);
    } catch {
      throw new AppError(401, "Launcher access token is invalid", "INVALID_LAUNCHER_SESSION");
    }

    const session = await app.prisma.session.findFirst({
      where: {
        id: claims.sid,
        userId: claims.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!session || session.user.status !== "ACTIVE") {
      throw new AppError(401, "Launcher session is not active", "INVALID_LAUNCHER_SESSION");
    }

    return {
      valid: true,
      userId: claims.sub,
      username: claims.username,
      role: claims.role
    };
  });

  app.post("/session/start", { preHandler: app.authenticate }, async (request) => {
    const input = parseBody(startPlaySessionSchema, request.body ?? {});
    const claims = request.userAuth!;
    const username = input.minecraftUsername ?? claims.username;
    const parsedUsername = minecraftUsernameSchema.safeParse(username);

    if (!parsedUsername.success) {
      throw new AppError(400, "Minecraft username must be 3-16 alphanumeric characters or underscores", "INVALID_MINECRAFT_USERNAME");
    }

    const user = await app.prisma.user.findFirst({
      where: {
        id: claims.sub,
        status: "ACTIVE",
        deletedAt: null
      }
    });

    if (!user) {
      throw new AppError(401, "Launcher account is not active", "INVALID_LAUNCHER_SESSION");
    }

    const session = await app.redis.createLauncherPlaySession(user.id, parsedUsername.data);
    await app.redis.publish(redisChannels.authSessions, "auth.launcher.session.started", {
      userId: user.id,
      username: parsedUsername.data,
      expiresAt: session.expiresAt
    });

    return session;
  });
}
