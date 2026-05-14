package com.example.mmorpg.combat;

import com.example.mmorpg.api.CooldownRegistry;
import com.example.mmorpg.api.PlayerCombatProfile;
import java.time.Duration;
import java.util.concurrent.ThreadLocalRandom;
import org.bukkit.attribute.Attribute;
import org.bukkit.entity.LivingEntity;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.plugin.java.JavaPlugin;

public final class CombatPlugin extends JavaPlugin implements Listener {
    private final CooldownRegistry cooldowns = new CooldownRegistry();

    @Override
    public void onEnable() {
        getServer().getPluginManager().registerEvents(this, this);
    }

    @EventHandler(ignoreCancelled = true)
    public void onDamage(EntityDamageByEntityEvent event) {
        if (!(event.getDamager() instanceof Player player) || !(event.getEntity() instanceof LivingEntity target)) {
            return;
        }

        if (!cooldowns.isReady(player.getUniqueId(), "basic-attack")) {
            event.setCancelled(true);
            return;
        }

        PlayerCombatProfile profile = PlayerCombatProfile.baseline();
        double weaponPower = Math.max(1.0, event.getDamage());
        double crit = ThreadLocalRandom.current().nextDouble() <= profile.critChance() ? profile.critMultiplier() : 1.0;
        double mitigated = Math.max(1.0, (weaponPower + profile.strength() * 0.75) * crit - armor(target));

        event.setDamage(mitigated);
        cooldowns.put(player.getUniqueId(), "basic-attack", Duration.ofMillis(650));
    }

    private double armor(LivingEntity entity) {
        var attribute = entity.getAttribute(Attribute.ARMOR);
        return attribute == null ? 0.0 : attribute.getValue() * 0.35;
    }
}
