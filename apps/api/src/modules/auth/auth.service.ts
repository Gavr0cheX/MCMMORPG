import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env, isProduction } from "../../config/env.js";
import { AppError } from "../../shared/http/errors.js";
import type { AuthClaims } from "../../shared/plugins/authenticate.js";
import { redisChannels } from "../../shared/redis/events.js";
import type { LoginInput, MinecraftLoginValidationInput, RegisterInput } from "./auth.schemas.js";

const refreshCookieName = "refreshToken";
const accessCookieName = "accessToken";

function hashRefreshToken(token: string) {
  return crypto.createHmac("sha256", env.JWT_REFRESH_SECRET).update(token).digest("hex");
}

function createRefreshToken() {
  return crypto.randomBytes(64).toString("base64url");
}

function refreshExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_TTL_DAYS);
  return expiresAt;
}

function setRefreshCookie(reply: FastifyReply, refreshToken: string) {
  reply.setCookie(refreshCookieName, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/auth",
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60
  });
}

function setAccessCookie(reply: FastifyReply, accessToken: string) {
  reply.setCookie(accessCookieName, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60
  });
}

function clearRefreshCookie(reply: FastifyReply) {
  reply.clearCookie(refreshCookieName, { path: "/auth" });
}

function clearAccessCookie(reply: FastifyReply) {
  reply.clearCookie(accessCookieName, { path: "/" });
}

export class AuthService {
  constructor(private readonly app: FastifyInstance) {}

  async register(input: RegisterInput, request: FastifyRequest, reply: FastifyReply) {
    const existing = await this.app.prisma.user.findFirst({
      where: {
        OR: [{ email: input.email.toLowerCase() }, { username: input.username }]
      }
    });

    if (existing) {
      throw new AppError(409, "Email or username is already registered", "AUTH_CONFLICT");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await this.app.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        username: input.username,
        displayName: input.displayName ?? null,
        passwordHash
      }
    });

    await this.app.prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "auth.register",
        targetType: "user",
        targetId: user.id,
        ipAddress: request.ip
      }
    });

    return this.createSession(user, request, reply);
  }

  async login(input: LoginInput, request: FastifyRequest, reply: FastifyReply) {
    const user = await this.app.prisma.user.findFirst({
      where: {
        OR: [{ email: input.identifier.toLowerCase() }, { username: input.identifier }]
      }
    });

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(403, "Account is not active", "ACCOUNT_RESTRICTED");
    }

    await this.app.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return this.createSession(user, request, reply);
  }

  async refresh(rawToken: string | undefined, request: FastifyRequest, reply: FastifyReply) {
    const refreshToken = rawToken ?? request.cookies[refreshCookieName];
    if (!refreshToken) {
      throw new AppError(401, "Refresh token required", "REFRESH_REQUIRED");
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const session = await this.app.prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: true }
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.status !== "ACTIVE") {
      throw new AppError(401, "Refresh session is invalid", "INVALID_REFRESH_SESSION");
    }

    const nextRefreshToken = createRefreshToken();
    const nextTokenHash = hashRefreshToken(nextRefreshToken);
    const nextExpiresAt = refreshExpiresAt();

    await this.app.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: nextTokenHash,
        expiresAt: nextExpiresAt,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"] ?? null
      }
    });

    const accessToken = this.signAccessToken({
      sub: session.user.id,
      sid: session.id,
      username: session.user.username,
      role: session.user.role
    });

    setRefreshCookie(reply, nextRefreshToken);
    setAccessCookie(reply, accessToken);

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      user: this.publicUser(session.user)
    };
  }

  async logout(request: FastifyRequest, reply: FastifyReply, rawToken?: string) {
    const refreshToken = rawToken ?? request.cookies[refreshCookieName];
    const tokenHash = refreshToken ? hashRefreshToken(refreshToken) : undefined;

    if (tokenHash) {
      await this.app.prisma.session.updateMany({
        where: { refreshTokenHash: tokenHash, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    } else if (request.userAuth?.sid) {
      await this.app.prisma.session.updateMany({
        where: { id: request.userAuth.sid, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }

    clearRefreshCookie(reply);
    clearAccessCookie(reply);
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.app.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError(404, "User not found", "USER_NOT_FOUND");
    }

    return this.publicUser(user);
  }

  async validateMinecraftLogin(input: MinecraftLoginValidationInput, request: FastifyRequest) {
    if (input.token !== env.INTERNAL_API_TOKEN) {
      throw new AppError(401, "Invalid internal token", "INVALID_INTERNAL_TOKEN");
    }

    const launcherSession = await this.app.redis.validateLauncherPlaySession(input.username, input.launcherToken);
    if (!launcherSession) {
      throw new AppError(401, "A valid launcher play session is required", "INVALID_MINECRAFT_SESSION");
    }

    const user = await this.app.prisma.user.findFirst({
      where: {
        id: launcherSession.userId,
        status: "ACTIVE",
        deletedAt: null
      }
    });

    if (!user) {
      throw new AppError(401, "Launcher account is not active", "INVALID_MINECRAFT_SESSION");
    }

    await this.app.prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "auth.minecraft.validate",
        targetType: "minecraft_session",
        targetId: input.minecraftUuid,
        ipAddress: request.ip,
        metadata: {
          username: input.username,
          serverSlug: input.serverSlug
        }
      }
    });

    await this.app.redis.publish(redisChannels.authSessions, "auth.minecraft.validated", {
      userId: user.id,
      username: input.username,
      minecraftUuid: input.minecraftUuid,
      serverSlug: input.serverSlug
    });

    return {
      valid: true,
      userId: user.id,
      username: input.username,
      role: user.role
    };
  }

  private async createSession(
    user: { id: string; username: string; email: string; displayName: string | null; role: AuthClaims["role"]; status: string },
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const refreshToken = createRefreshToken();
    const session = await this.app.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashRefreshToken(refreshToken),
        expiresAt: refreshExpiresAt(),
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"] ?? null
      }
    });

    const accessToken = this.signAccessToken({
      sub: user.id,
      sid: session.id,
      username: user.username,
      role: user.role
    });

    setRefreshCookie(reply, refreshToken);
    setAccessCookie(reply, accessToken);

    return {
      accessToken,
      refreshToken,
      user: this.publicUser(user)
    };
  }

  private signAccessToken(payload: AuthClaims) {
    return this.app.jwt.sign(payload, { expiresIn: env.JWT_ACCESS_TTL });
  }

  private publicUser(user: { id: string; email: string; username: string; displayName: string | null; role: string; status: string }) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      status: user.status
    };
  }
}
