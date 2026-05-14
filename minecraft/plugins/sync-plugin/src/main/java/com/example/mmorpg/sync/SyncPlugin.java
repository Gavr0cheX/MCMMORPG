package com.example.mmorpg.sync;

import com.example.mmorpg.core.ServiceRegistry;
import java.util.Map;
import org.bukkit.Bukkit;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.plugin.RegisteredServiceProvider;
import org.bukkit.plugin.java.JavaPlugin;

public final class SyncPlugin extends JavaPlugin implements Listener {
    private ServiceRegistry services;

    @Override
    public void onEnable() {
        RegisteredServiceProvider<ServiceRegistry> provider = getServer().getServicesManager().getRegistration(ServiceRegistry.class);
        if (provider == null) {
            throw new IllegalStateException("MmorpgCore is required");
        }

        services = provider.getProvider();
        getServer().getPluginManager().registerEvents(this, this);
        getServer().getScheduler().runTaskTimerAsynchronously(this, this::heartbeat, 20L, 20L * 20L);
    }

    @Override
    public void onDisable() {
        if (services != null) {
            publishHeartbeat("OFFLINE");
        }
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        getServer().getScheduler().runTaskAsynchronously(this, () ->
            services.eventBus().setPlayerOnline(event.getPlayer().getUniqueId().toString(), services.serverSlug())
        );
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        getServer().getScheduler().runTaskAsynchronously(this, () ->
            services.eventBus().setPlayerOffline(event.getPlayer().getUniqueId().toString(), services.serverSlug())
        );
    }

    private void heartbeat() {
        publishHeartbeat("ONLINE");
    }

    private void publishHeartbeat(String status) {
        try {
            services.apiClient().postInternal("/servers/heartbeat", Map.of(
                "slug", services.serverSlug(),
                "status", status,
                "onlinePlayers", Bukkit.getOnlinePlayers().size(),
                "maxPlayers", Bukkit.getMaxPlayers(),
                "metadata", Map.of(
                    "bukkitVersion", Bukkit.getBukkitVersion(),
                    "minecraftVersion", Bukkit.getMinecraftVersion()
                )
            ));
            services.eventBus().publish("servers:heartbeats", "server.heartbeat", Map.of(
                "serverSlug", services.serverSlug(),
                "onlinePlayers", Bukkit.getOnlinePlayers().size(),
                "status", status
            ));
        } catch (Exception error) {
            getLogger().warning("Failed to publish heartbeat: " + error.getMessage());
        }
    }
}
