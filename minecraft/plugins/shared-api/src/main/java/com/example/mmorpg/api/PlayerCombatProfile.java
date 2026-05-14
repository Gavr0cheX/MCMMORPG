package com.example.mmorpg.api;

public record PlayerCombatProfile(double strength, double intellect, double defense, double critChance, double critMultiplier) {
    public static PlayerCombatProfile baseline() {
        return new PlayerCombatProfile(10.0, 10.0, 5.0, 0.05, 1.5);
    }
}
