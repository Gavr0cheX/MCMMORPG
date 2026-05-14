import "dotenv/config";
import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const subscriber = new Redis(redisUrl);

await subscriber.subscribe("matchmaking:events");
subscriber.on("message", (_channel, message) => {
  const event = JSON.parse(message) as { type: string; payload: unknown };
  console.log("matchmaking event", event.type, event.payload);
});

console.log("matchmaking-service listening for dungeon and queue events");
