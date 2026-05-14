package com.example.mmorpg.quest;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.bukkit.Material;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.plugin.java.JavaPlugin;

public final class QuestPlugin extends JavaPlugin implements Listener {
    private final Map<UUID, Integer> miningProgress = new ConcurrentHashMap<>();

    @Override
    public void onEnable() {
        getServer().getPluginManager().registerEvents(this, this);
    }

    @EventHandler(ignoreCancelled = true)
    public void onBlockBreak(BlockBreakEvent event) {
        if (event.getBlock().getType() != Material.IRON_ORE) {
            return;
        }

        miningProgress.merge(event.getPlayer().getUniqueId(), 1, Integer::sum);
    }
}
