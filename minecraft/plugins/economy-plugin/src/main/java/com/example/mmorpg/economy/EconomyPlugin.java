package com.example.mmorpg.economy;

import com.example.mmorpg.core.ServiceRegistry;
import java.util.Map;
import org.bukkit.plugin.RegisteredServiceProvider;
import org.bukkit.plugin.java.JavaPlugin;

public final class EconomyPlugin extends JavaPlugin {
    private ServiceRegistry services;

    @Override
    public void onEnable() {
        RegisteredServiceProvider<ServiceRegistry> provider = getServer().getServicesManager().getRegistration(ServiceRegistry.class);
        if (provider == null) {
            throw new IllegalStateException("MmorpgCore is required");
        }

        services = provider.getProvider();
        getServer().getServicesManager().register(EconomyService.class, new EconomyService(services), this, org.bukkit.plugin.ServicePriority.Normal);
    }

    public static final class EconomyService {
        private final ServiceRegistry services;

        public EconomyService(ServiceRegistry services) {
            this.services = services;
        }

        public void publishReward(String characterId, String currency, double amount, String reason) {
            services.eventBus().publish("economy:events", "economy.reward", Map.of(
                "characterId", characterId,
                "currency", currency,
                "amount", amount,
                "reason", reason
            ));
        }
    }
}
