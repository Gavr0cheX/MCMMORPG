# Scaling Strategy

## Near Term

- Keep the modular API in one Fastify process.
- Scale `api` horizontally behind Nginx.
- Use Redis for websocket fanout coordination.
- Add read replicas for leaderboards and public profile reads.

## Dungeon Instances

Dungeon instances should become short-lived workloads:

1. Party requests a dungeon through the API.
2. Matchmaking service validates requirements and selects a template.
3. Orchestrator starts a server pod/container with metadata.
4. Velocity receives the instance registration.
5. Party is transferred after readiness.
6. Instance uploads results and shuts down.

## Kubernetes

Compose services map cleanly to Kubernetes:

- `api`, `web`, service workers as Deployments
- `velocity` as Deployment or StatefulSet depending on proxy plugins
- game servers as StatefulSets for realms and Jobs/Deployments for dungeons
- Postgres and Redis managed externally where possible
- launcher assets in object storage plus CDN

## Multi-Region

Use region-local Velocity and realm pools. Keep account identity global, but shard realtime gameplay state by region. Economy and marketplace writes should remain strongly consistent or be partitioned by realm.
