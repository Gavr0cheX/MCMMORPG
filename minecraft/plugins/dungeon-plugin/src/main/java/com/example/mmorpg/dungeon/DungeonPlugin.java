package com.example.mmorpg.dungeon;

import com.example.mmorpg.core.ServiceRegistry;
import java.util.Map;
import org.bukkit.plugin.RegisteredServiceProvider;
import org.bukkit.plugin.java.JavaPlugin;

public final class DungeonPlugin extends JavaPlugin {
    private ServiceRegistry services;

    @Override
    public void onEnable() {
        RegisteredServiceProvider<ServiceRegistry> provider = getServer().getServicesManager().getRegistration(ServiceRegistry.class);
        if (provider == null) {
            throw new IllegalStateException("MmorpgCore is required");
        }
        services = provider.getProvider();
    }

    public void requestInstance(String partyId, String dungeonKey) {
        services.eventBus().publish("matchmaking:events", "dungeon.instance.requested", Map.of(
            "partyId", partyId,
            "dungeonKey", dungeonKey,
            "serverSlug", services.serverSlug()
        ));
    }
}
