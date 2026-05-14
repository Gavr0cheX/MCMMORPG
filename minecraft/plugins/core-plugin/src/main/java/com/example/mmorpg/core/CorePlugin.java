package com.example.mmorpg.core;

import com.example.mmorpg.api.ApiClient;
import com.example.mmorpg.api.RedisEventBus;
import org.bukkit.plugin.java.JavaPlugin;

public final class CorePlugin extends JavaPlugin {
    private ServiceRegistry services;

    @Override
    public void onEnable() {
        saveDefaultConfig();

        String apiBaseUrl = configValue("api-base-url", "http://api:3000");
        String internalToken = configValue("internal-token", "replace_with_internal_service_token");
        String redisUrl = configValue("redis-url", "redis://redis:6379");
        String serverSlug = configValue("server-slug", getServer().getName());

        services = new ServiceRegistry(
            serverSlug,
            new ApiClient(apiBaseUrl, internalToken),
            new RedisEventBus(redisUrl, "plugin:" + serverSlug)
        );

        getServer().getServicesManager().register(ServiceRegistry.class, services, this, org.bukkit.plugin.ServicePriority.Highest);
        getLogger().info("MMORPG core services registered for " + serverSlug);
    }

    @Override
    public void onDisable() {
        if (services != null) {
            services.close();
        }
    }

    private String configValue(String key, String fallback) {
        String envKey = "MMORPG_" + key.toUpperCase().replace("-", "_");
        return System.getenv().getOrDefault(envKey, getConfig().getString(key, fallback));
    }
}
