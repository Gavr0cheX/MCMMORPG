# Minecraft MMORPG Platform

Production-oriented monorepo for a scalable Minecraft MMORPG network.

This repository is meant to work as a public proof of work: it shows how I structure a game platform end to end, with an authoritative backend, player-facing web app, desktop launcher, Minecraft plugins, and containerized infrastructure around them.

## What this repository demonstrates

- authoritative server-side gameplay systems
- multi-surface product design across web, launcher, and in-game surfaces
- secure auth, sessions, and trust boundaries
- reusable packages and clear service boundaries
- deployable infrastructure with monitoring and backup guidance

## Platform overview

| Surface | Responsibility |
| --- | --- |
| `apps/api` | authoritative backend, auth, sessions, OpenAPI, Redis events, WebSocket fanout |
| `apps/web` | account portal, dashboard, leaderboards, status, and admin surfaces |
| `apps/launcher` | desktop authentication, patch checks, Java detection, update flow |
| `minecraft/plugins` | gameplay modules split by responsibility |
| `infrastructure` | Docker, Nginx, and monitoring config |
| `docs` | architecture, security, deployment, local development, backups |

## Core capabilities

- Auth, sessions, and account management
- Economy, inventory, progression, and moderation
- Real-time event delivery and WebSocket fanout
- Launcher update and patching architecture
- Redis-based coordination for ephemeral state
- PostgreSQL for durable game and account data
- Velocity proxy with modern forwarding
- Nginx and Docker Compose deployment path
- Prometheus and Grafana monitoring profile
- Java 21 multi-module plugin workspace

## Architecture at a glance

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

The backend is authoritative for auth, economy, inventory, progression, and moderation. Plugins and the launcher publish requests and telemetry, but client-provided values are never treated as trusted state.

## Repo layout

```text
apps/
  api/          Fastify authoritative backend
  web/          Next.js website and ops console
  launcher/     Electron launcher
services/       Future extractable services
packages/       Shared contracts, config, utils, UI helpers
minecraft/
  plugins/      Java 21 Paper plugin workspace
  velocity/     Velocity configuration
  servers/      Mounted plugin folders for local servers
infrastructure/
  docker/       App Dockerfiles
  nginx/        HTTP and Minecraft TCP proxy config
docs/           Architecture and operations guides
```

## Security and trust boundaries

- The backend is authoritative.
- Never trust launcher, website, or plugin-submitted economy or inventory values.
- Treat Redis pub/sub as internal coordination, not a durable ledger.
- Keep internal tokens out of images and source control.
- Use rotating refresh sessions, bcrypt hashing, rate limiting, helmet, and centralized error handling.
- Populate `.env.example` with real local secrets before booting; the compose and Prisma setup now require sensitive values explicitly instead of falling back to weak defaults.

## Local development

```bash
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm compose:up
```

Useful URLs:

- Web: `http://localhost`
- API docs: `http://localhost/api/docs`
- API health: `http://localhost/api/healthz`
- Launcher manifest: `http://localhost/launcher-updates/manifest.json`
- Minecraft: `localhost:25565`

For app development without the full Compose stack:

```bash
docker compose up postgres redis
pnpm --filter @mmorpg/api dev
pnpm --filter @mmorpg/web dev
```

For plugin development:

```bash
gradle -p minecraft/plugins build
```

## Monitoring

Start Prometheus and Grafana with:

```bash
docker compose --profile monitoring up -d prometheus grafana
```

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3002`

## Backups

- PostgreSQL: daily logical backups with `pg_dump`, plus WAL archiving for point-in-time recovery in production
- Redis: treat as ephemeral coordination; enable AOF for warm recovery, but do not rely on it as authoritative state
- Minecraft worlds: scheduled snapshots for persistent worlds; disposable templates for dungeon instances
- Launcher assets: immutable, versioned artifact paths with checksum-based integrity

## Documentation

Start here:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/SECURITY.md`](docs/SECURITY.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- [`docs/LOCAL_DEVELOPMENT.md`](docs/LOCAL_DEVELOPMENT.md)
- [`docs/MONITORING.md`](docs/MONITORING.md)
- [`docs/BACKUPS.md`](docs/BACKUPS.md)
- [`docs/REDIS_EVENTS.md`](docs/REDIS_EVENTS.md)
- [`docs/SCALING.md`](docs/SCALING.md)

## Important

This platform is designed for production-style trust boundaries. If you copy parts of it into a live environment, replace placeholder values, rotate secrets, and verify that every externally visible surface is hardened before exposure.
