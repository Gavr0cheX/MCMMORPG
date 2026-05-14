package com.example.mmorpg.core;

import com.example.mmorpg.api.ApiClient;
import com.example.mmorpg.api.RedisEventBus;

public final class ServiceRegistry implements AutoCloseable {
    private final String serverSlug;
    private final ApiClient apiClient;
    private final RedisEventBus eventBus;

    public ServiceRegistry(String serverSlug, ApiClient apiClient, RedisEventBus eventBus) {
        this.serverSlug = serverSlug;
        this.apiClient = apiClient;
        this.eventBus = eventBus;
    }

    public String serverSlug() {
        return serverSlug;
    }

    public ApiClient apiClient() {
        return apiClient;
    }

    public RedisEventBus eventBus() {
        return eventBus;
    }

    @Override
    public void close() {
        eventBus.close();
    }
}
