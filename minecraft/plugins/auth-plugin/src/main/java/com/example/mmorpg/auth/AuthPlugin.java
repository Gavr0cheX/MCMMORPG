package com.example.mmorpg.auth;

import com.example.mmorpg.core.ServiceRegistry;
import java.util.HashMap;
import java.util.Map;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerPreLoginEvent;
import org.bukkit.plugin.RegisteredServiceProvider;
import org.bukkit.plugin.java.JavaPlugin;

public final class AuthPlugin extends JavaPlugin implements Listener {
    private ServiceRegistry services;

    @Override
    public void onEnable() {
        RegisteredServiceProvider<ServiceRegistry> provider = getServer().getServicesManager().getRegistration(ServiceRegistry.class);
        if (provider == null) {
            throw new IllegalStateException("MmorpgCore is required");
        }

        services = provider.getProvider();
        getServer().getPluginManager().registerEvents(this, this);
    }

    @EventHandler
    public void onPreLogin(AsyncPlayerPreLoginEvent event) {
        try {
            AuthValidationResponse response = services.apiClient().postInternal(
                "/auth/minecraft/validate",
                validationPayload(event),
                AuthValidationResponse.class
            );

            if (response == null || !response.valid) {
                event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_OTHER, "Launcher session validation failed.");
                return;
            }

            services.eventBus().publish("auth:sessions", "auth.minecraft.prelogin.accepted", Map.of(
                "userId", response.userId,
                "username", response.username,
                "minecraftUuid", event.getUniqueId().toString(),
                "serverSlug", services.serverSlug()
            ));
        } catch (Exception error) {
            getLogger().warning("Rejected " + event.getName() + ": " + error.getMessage());
            event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_OTHER, "Start the game from the official launcher and try again.");
        }
    }

    private Map<String, Object> validationPayload(AsyncPlayerPreLoginEvent event) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("username", event.getName());
        payload.put("minecraftUuid", event.getUniqueId().toString());
        payload.put("serverSlug", services.serverSlug());
        String launcherToken = launcherTokenFromHostname(event.getHostname());
        if (launcherToken != null) {
            payload.put("launcherToken", launcherToken);
        }
        return payload;
    }

    private String launcherTokenFromHostname(String hostname) {
        if (hostname == null) {
            return null;
        }

        String normalized = hostname.split(":", 2)[0];
        if (!normalized.startsWith("session-")) {
            return null;
        }

        String token = normalized.substring("session-".length()).split("\\.", 2)[0];
        return token.isBlank() ? null : token;
    }

    private static final class AuthValidationResponse {
        boolean valid;
        String userId;
        String username;
        String role;
    }
}
