import type { FastifyInstance } from "fastify";
import { parseBody } from "../../shared/http/validation.js";
import { AuthService } from "./auth.service.js";
import { loginSchema, minecraftLoginValidationSchema, refreshSchema, registerSchema } from "./auth.schemas.js";

export async function authRoutes(app: FastifyInstance) {
  const service = new AuthService(app);

  app.post("/register", async (request, reply) => {
    const input = parseBody(registerSchema, request.body);
    return service.register(input, request, reply);
  });

  app.post("/login", async (request, reply) => {
    const input = parseBody(loginSchema, request.body);
    return service.login(input, request, reply);
  });

  app.post("/refresh", async (request, reply) => {
    const input = parseBody(refreshSchema, request.body ?? {});
    return service.refresh(input.refreshToken, request, reply);
  });

  app.post("/logout", async (request, reply) => {
    const input = parseBody(refreshSchema, request.body ?? {});
    return service.logout(request, reply, input.refreshToken);
  });

  app.get("/me", { preHandler: app.authenticate }, async (request) => {
    return service.me(request.userAuth!.sub);
  });

  app.post("/minecraft/validate", async (request) => {
    const input = parseBody(minecraftLoginValidationSchema, request.body);
    return service.validateMinecraftLogin(input, request);
  });
}
