package com.example.mmorpg.api;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public final class CooldownRegistry {
    private final Map<String, Instant> cooldowns = new ConcurrentHashMap<>();

    public boolean isReady(UUID playerId, String key) {
        Instant expiresAt = cooldowns.get(compound(playerId, key));
        return expiresAt == null || Instant.now().isAfter(expiresAt);
    }

    public void put(UUID playerId, String key, Duration duration) {
        cooldowns.put(compound(playerId, key), Instant.now().plus(duration));
    }

    private String compound(UUID playerId, String key) {
        return playerId + ":" + key;
    }
}
