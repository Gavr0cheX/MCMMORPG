# Deployment

## Compose Deployment

Compose is intended for local and small single-host deployments. Required hardening before public exposure:

- Replace every `.env` secret.
- Put Cloudflare in proxy mode for HTTP domains.
- Use Cloudflare Spectrum, TCP passthrough, or a direct DNS record for Minecraft traffic.
- Terminate TLS at Cloudflare or mount certificates into Nginx.
- Restrict Postgres and Redis to private networks only.
- Keep backend servers in Velocity modern forwarding mode.

## Migration Flow

```bash
pnpm --filter @mmorpg/api prisma:deploy
pnpm --filter @mmorpg/api prisma:seed
docker compose up -d --build
```

## Backups

Back up Postgres with `pg_dump` or managed snapshots. Redis append-only files are useful for warm recovery, but durable gameplay state belongs in Postgres.

## Static Assets

`infrastructure/launcher-updates` is a local CDN stand-in. In production, publish launcher manifests, launcher installers, modpacks, and asset archives to object storage behind a CDN.
