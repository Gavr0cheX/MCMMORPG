# Architecture

## Request Flow

```text
Internet
  -> Cloudflare
  -> Nginx
      -> HTTP /api -> Fastify API
      -> HTTP / -> Next.js web
      -> HTTP /launcher-updates -> static update assets
      -> TCP 25565 -> Velocity
          -> lobby
          -> mmorpg-1
          -> mmorpg-2
          -> future dungeon instances
```

## Service Responsibilities

- `apps/api`: authoritative game backend, auth, sessions, OpenAPI, Redis events, websocket fanout.
- `apps/web`: account portal, dashboard, leaderboards, status, and admin surfaces.
- `apps/launcher`: desktop authentication, patch checks, Java detection, asset verification, update flow.
- `minecraft/plugins`: game-server modules split by responsibility.
- `services/*`: extraction points for auth, matchmaking, and chat once load or ownership demands it.

## Data Plane

PostgreSQL stores durable account and gameplay data. Redis stores ephemeral state: online players, pub/sub, notifications, matchmaking queues, party/guild sync, and distributed cache.

## Plugin Boundaries

`core-plugin` owns shared API and Redis services. Feature plugins depend on the core registry and remain small:

- `auth-plugin`: join/session checks and anti-spoofing
- `sync-plugin`: online state and heartbeats
- `combat-plugin`: custom combat calculations and cooldowns
- `economy-plugin`: authoritative transaction events
- `guild-plugin`: guild chat and sync hooks
- `quest-plugin`: objective progression
- `dungeon-plugin`: future instance lifecycle hooks
