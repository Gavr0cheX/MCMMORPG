# Redis Event Architecture

## Channels

- `chat:global`: global chat and guild chat fanout requests.
- `guild:{guildId}:events`: guild membership, bank, and announcement updates.
- `party:{partyId}:events`: party membership and ready checks.
- `notifications:realtime`: user-targeted notification fanout to Socket.IO.
- `servers:heartbeats`: game server population and status.
- `matchmaking:events`: queue and dungeon instance requests.
- `economy:events`: economy rewards, grants, and transaction notifications.

## Online Players

Keys:

- `online:{playerId}` hash with `playerId`, `serverSlug`, `seenAt`
- `server:{serverSlug}:players` set of online player IDs

Online hashes use short TTLs. Servers refresh presence with join events and heartbeats.

## Event Envelope

```json
{
  "id": "uuid",
  "type": "server.heartbeat",
  "payload": {},
  "publishedAt": "iso-date",
  "source": "api"
}
```

Consumers must be idempotent. Redis pub/sub does not guarantee replay.
