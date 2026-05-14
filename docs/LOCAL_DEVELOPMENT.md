# Local Development

## First Run

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

## App Development

Run web and API outside Docker while keeping Postgres and Redis in Docker:

```bash
docker compose up postgres redis
pnpm --filter @mmorpg/api dev
pnpm --filter @mmorpg/web dev
```

## Plugin Development

```bash
gradle -p minecraft/plugins build
```

Copy generated shadow jars into `minecraft/servers/<server>/plugins` for local testing.
