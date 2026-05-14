import crypto from "node:crypto";
import { Redis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";
import type { RedisEvent } from "./events.js";

export type LauncherPlaySession = {
  userId: string;
  username: string;
  tokenHash: string;
  issuedAt: string;
  expiresAt: string;
};

export type ServerHeartbeatState = {
  slug: string;
  status: string;
  onlinePlayers: number;
  maxPlayers: number;
  metadata?: unknown;
  lastHeartbeatAt: string;
};

export class RedisService {
  private readonly client: Redis;
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  constructor(
    redisUrl: string,
    private readonly logger: FastifyBaseLogger
  ) {
    this.client = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 3 });
    this.publisher = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 3 });
    this.subscriber = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: null });
  }

  async connect() {
    await Promise.all([this.client.connect(), this.publisher.connect(), this.subscriber.connect()]);
  }

  async disconnect() {
    await Promise.all([this.client.quit(), this.publisher.quit(), this.subscriber.quit()]);
  }

  async ping() {
    return this.client.ping();
  }

  async cacheGet<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async cacheSet(key: string, value: unknown, ttlSeconds: number) {
    await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async recordServerHeartbeat(state: ServerHeartbeatState, ttlSeconds = 90) {
    const encoded = JSON.stringify(state);
    const pipeline = this.client
      .multi()
      .set(`server:${state.slug}:heartbeat`, encoded, "EX", ttlSeconds)
      .hset("servers:state", state.slug, encoded);

    if (state.status === "ONLINE") {
      pipeline.sadd("servers:online", state.slug);
    } else {
      pipeline.srem("servers:online", state.slug);
    }

    await pipeline.exec();
  }

  async createLauncherPlaySession(userId: string, username: string, ttlSeconds = 120) {
    const token = crypto.randomBytes(24).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
    const session: LauncherPlaySession = {
      userId,
      username,
      tokenHash: this.hashToken(token),
      issuedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    await this.cacheSet(this.launcherSessionKey(username), session, ttlSeconds);
    return {
      token,
      username,
      expiresAt: session.expiresAt
    };
  }

  async validateLauncherPlaySession(username: string, token?: string) {
    const session = await this.cacheGet<LauncherPlaySession>(this.launcherSessionKey(username));
    if (!session) {
      return null;
    }

    if (token && session.tokenHash !== this.hashToken(token)) {
      return null;
    }

    await this.client.expire(this.launcherSessionKey(username), 90);
    return session;
  }

  async markPlayerOnline(playerId: string, serverSlug: string, ttlSeconds = 90) {
    const key = `online:${playerId}`;
    await this.client
      .multi()
      .hset(key, {
        playerId,
        serverSlug,
        seenAt: new Date().toISOString()
      })
      .expire(key, ttlSeconds)
      .sadd(`server:${serverSlug}:players`, playerId)
      .exec();
  }

  async markPlayerOffline(playerId: string, serverSlug?: string) {
    const pipeline = this.client.multi().del(`online:${playerId}`);
    if (serverSlug) {
      pipeline.srem(`server:${serverSlug}:players`, playerId);
    }
    await pipeline.exec();
  }

  async publish<T>(channel: string, type: string, payload: T, source: RedisEvent["source"] = "api") {
    const event: RedisEvent<T> = {
      id: crypto.randomUUID(),
      type,
      payload,
      source,
      publishedAt: new Date().toISOString()
    };

    await this.publisher.publish(channel, JSON.stringify(event));
    return event;
  }

  async subscribe<T>(channel: string, handler: (event: RedisEvent<T>) => Promise<void> | void) {
    await this.subscriber.subscribe(channel);
    this.subscriber.on("message", async (incomingChannel: string, message: string) => {
      if (incomingChannel !== channel) {
        return;
      }

      try {
        await handler(JSON.parse(message) as RedisEvent<T>);
      } catch (error) {
        this.logger.error({ error, channel }, "failed to handle redis event");
      }
    });
  }

  private launcherSessionKey(username: string) {
    return `launcher:session:${username.toLowerCase()}`;
  }

  private hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
