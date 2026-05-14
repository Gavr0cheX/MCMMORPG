package com.example.mmorpg.api;

import com.google.gson.Gson;
import java.time.Instant;
import java.util.UUID;
import redis.clients.jedis.JedisPooled;

public final class RedisEventBus implements AutoCloseable {
    private static final Gson GSON = new Gson();

    private final JedisPooled jedis;
    private final String source;

    public RedisEventBus(String redisUrl, String source) {
        this.jedis = new JedisPooled(redisUrl);
        this.source = source;
    }

    public void publish(String channel, String type, Object payload) {
        EventEnvelope envelope = new EventEnvelope(UUID.randomUUID().toString(), type, payload, Instant.now().toString(), source);
        jedis.publish(channel, GSON.toJson(envelope));
    }

    public void setPlayerOnline(String playerId, String serverSlug) {
        String key = "online:" + playerId;
        jedis.hset(key, java.util.Map.of(
            "playerId", playerId,
            "serverSlug", serverSlug,
            "seenAt", Instant.now().toString()
        ));
        jedis.expire(key, 90);
        jedis.sadd("server:" + serverSlug + ":players", playerId);
    }

    public void setPlayerOffline(String playerId, String serverSlug) {
        jedis.del("online:" + playerId);
        jedis.srem("server:" + serverSlug + ":players", playerId);
    }

    @Override
    public void close() {
        jedis.close();
    }
}
