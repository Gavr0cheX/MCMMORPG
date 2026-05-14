# Minecraft MMORPG Platform

Production-oriented monorepo for a scalable Minecraft MMORPG network.

Current package baselines were checked against npm registry metadata on 2026-05-13:
Next.js `16.2.6`, React `19.2.6`, Fastify `5.8.5`, Prisma `7.8.0`.

## Stack

- Docker Compose with Nginx HTTP/TCP reverse proxy
- Velocity proxy with modern forwarding
- Purpur/Paper-compatible backend servers
- Fastify, TypeScript, Prisma, PostgreSQL, Redis, Socket.IO
- Next.js App Router, TailwindCSS, shadcn-style primitives, TanStack Query, Zustand
- Electron launcher with update and patching architecture
- Java 21 Gradle multi-module Minecraft plugins
- Prometheus and Grafana monitoring profile

## Layout

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
  monitoring/   Prometheus and Grafana config
docs/           Architecture and operations guides
```

## Quick Start

1. Copy `.env.example` to `.env` and replace secrets.
2. Install dependencies with `pnpm install`.
3. Generate Prisma client with `pnpm db:migrate`.
4. Start the stack with `pnpm compose:up`.
5. Open `http://localhost` for the web app and connect Minecraft to `localhost:25565`.

Monitoring can be started with:

```bash
docker compose --profile monitoring up --build
```

## Important

The backend is the authority for auth, economy, inventory, progression, and moderation. Plugins and the launcher publish requests and telemetry, but client-provided values are never treated as trusted state.
