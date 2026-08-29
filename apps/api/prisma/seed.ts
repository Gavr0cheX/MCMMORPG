import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running seed commands.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD must be set before seeding the admin account.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE"
    },
    create: {
      email,
      username: "admin",
      displayName: "Administrator",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE"
    }
  });

  await prisma.gameServer.upsert({
    where: { slug: "lobby" },
    update: { kind: "LOBBY", address: "lobby", maxPlayers: 250 },
    create: { slug: "lobby", kind: "LOBBY", address: "lobby", maxPlayers: 250 }
  });

  for (const slug of ["mmorpg-1", "mmorpg-2"]) {
    await prisma.gameServer.upsert({
      where: { slug },
      update: { kind: "MMORPG", address: slug, maxPlayers: 150 },
      create: { slug, kind: "MMORPG", address: slug, maxPlayers: 150 }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
