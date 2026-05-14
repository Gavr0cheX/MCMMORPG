import "dotenv/config";
import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const subscriber = new Redis(redisUrl);

await subscriber.subscribe("chat:global");
subscriber.on("message", (_channel, message) => {
  const event = JSON.parse(message) as { type: string; payload: unknown };
  console.log("chat event", event.type, event.payload);
});

console.log("chat-service listening for global, guild, and party chat events");
