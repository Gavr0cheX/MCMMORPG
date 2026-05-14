import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { AppError } from "../http/errors.js";

export type AuthClaims = {
  sub: string;
  sid: string;
  username: string;
  role: "PLAYER" | "MODERATOR" | "ADMIN" | "SERVICE";
};

declare module "fastify" {
  interface FastifyRequest {
    userAuth?: AuthClaims;
  }

  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    authorize(roles: AuthClaims["role"][]): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const authenticatePlugin = fp(async (app: FastifyInstance) => {
  app.decorateRequest("userAuth");

  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const claims = await request.jwtVerify<AuthClaims>();
      request.userAuth = claims;
    } catch {
      throw new AppError(401, "Authentication required", "UNAUTHENTICATED");
    }
  });

  app.decorate("authorize", (roles: AuthClaims["role"][]) => {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
      await app.authenticate(request, _reply);
      if (!request.userAuth || !roles.includes(request.userAuth.role)) {
        throw new AppError(403, "Insufficient permissions", "FORBIDDEN");
      }
    };
  });
});
