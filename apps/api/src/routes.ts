import type { FastifyInstance } from "fastify";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { userRoutes } from "./modules/users/users.routes.js";
import { characterRoutes } from "./modules/characters/characters.routes.js";
import { guildRoutes } from "./modules/guilds/guilds.routes.js";
import { inventoryRoutes } from "./modules/inventory/inventory.routes.js";
import { economyRoutes } from "./modules/economy/economy.routes.js";
import { questRoutes } from "./modules/quests/quests.routes.js";
import { partyRoutes } from "./modules/parties/parties.routes.js";
import { serverRoutes } from "./modules/servers/servers.routes.js";
import { friendRoutes } from "./modules/friends/friends.routes.js";
import { mailRoutes } from "./modules/mail/mail.routes.js";
import { leaderboardRoutes } from "./modules/leaderboards/leaderboards.routes.js";
import { notificationRoutes } from "./modules/notifications/notifications.routes.js";
import { launcherRoutes } from "./modules/launcher/launcher.routes.js";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(userRoutes, { prefix: "/profile" });
  await app.register(characterRoutes, { prefix: "/characters" });
  await app.register(guildRoutes, { prefix: "/guilds" });
  await app.register(inventoryRoutes, { prefix: "/inventory" });
  await app.register(economyRoutes, { prefix: "/economy" });
  await app.register(questRoutes, { prefix: "/quests" });
  await app.register(partyRoutes, { prefix: "/parties" });
  await app.register(serverRoutes, { prefix: "/servers" });
  await app.register(friendRoutes, { prefix: "/friends" });
  await app.register(mailRoutes, { prefix: "/mail" });
  await app.register(leaderboardRoutes, { prefix: "/leaderboards" });
  await app.register(notificationRoutes, { prefix: "/notifications" });
  await app.register(launcherRoutes, { prefix: "/launcher" });
}
