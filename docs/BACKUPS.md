# Backup Strategy

## PostgreSQL

- Daily full logical backups with `pg_dump`.
- Point-in-time recovery with WAL archiving for production.
- Test restores monthly.
- Keep at least 7 daily, 4 weekly, and 6 monthly restore points.

## Redis

Redis is ephemeral coordination. Enable AOF for warm recovery, but do not depend on Redis for authoritative state.

## Minecraft Worlds

Realm worlds should use scheduled snapshots. Dungeon instances should be disposable and generated from templates.

## Launcher Assets

Store manifests and modpacks with immutable versioned paths. Never overwrite a published artifact without changing its checksum and version.
