# Monitoring

## Compose Profile

Start Prometheus and Grafana:

```bash
docker compose --profile monitoring up -d prometheus grafana
```

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3002`

## Metrics

The API exposes `/metrics` with:

- Node.js process metrics
- HTTP request counters
- HTTP request duration histogram
- Online player gauge by server

## Logging

Fastify emits structured JSON logs. In production, ship Docker logs to Loki, CloudWatch, Datadog, or another centralized sink. Include request IDs at the edge and propagate them to API logs.

## Alerts

Recommended alerts:

- API error rate above 1 percent for 5 minutes
- API p95 latency above 500 ms for 10 minutes
- Postgres unavailable
- Redis unavailable
- Velocity unavailable
- Server heartbeat stale for more than 90 seconds
