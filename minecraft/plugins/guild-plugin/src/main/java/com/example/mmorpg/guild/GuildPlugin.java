package com.example.mmorpg.guild;

import com.example.mmorpg.core.ServiceRegistry;
import io.papermc.paper.event.player.AsyncChatEvent;
import java.util.Map;
import net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.plugin.RegisteredServiceProvider;
import org.bukkit.plugin.java.JavaPlugin;

public final class GuildPlugin extends JavaPlugin implements Listener {
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
    public void onChat(AsyncChatEvent event) {
        String message = PlainTextComponentSerializer.plainText().serialize(event.message());
        if (!message.startsWith("/g ")) {
            return;
        }

        event.setCancelled(true);
        services.eventBus().publish("chat:global", "guild.chat.requested", Map.of(
            "playerId", event.getPlayer().getUniqueId().toString(),
            "playerName", event.getPlayer().getName(),
            "message", message.substring(3)
        ));
    }
}
