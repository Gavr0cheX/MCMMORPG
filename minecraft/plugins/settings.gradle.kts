pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        mavenCentral()
        maven("https://repo.papermc.io/repository/maven-public/")
    }
}

rootProject.name = "mmorpg-plugins"

include(
    "shared-api",
    "core-plugin",
    "auth-plugin",
    "combat-plugin",
    "economy-plugin",
    "guild-plugin",
    "quest-plugin",
    "sync-plugin",
    "dungeon-plugin"
)
