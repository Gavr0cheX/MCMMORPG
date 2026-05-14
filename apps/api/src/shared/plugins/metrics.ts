import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from "prom-client";

export const metricsPlugin = fp(async (app: FastifyInstance) => {
  const registry = new Registry();
  collectDefaultMetrics({ register: registry });

  const httpRequests = new Counter({
    name: "mmorpg_http_requests_total",
    help: "Total HTTP requests",
    labelNames: ["method", "route", "status"],
    registers: [registry]
  });

  const httpDuration = new Histogram({
    name: "mmorpg_http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registers: [registry]
  });

  const onlinePlayers = new Gauge({
    name: "mmorpg_online_players",
    help: "Online player count reported by game servers",
    labelNames: ["server"],
    registers: [registry]
  });

  app.decorate("metrics", { onlinePlayers });

  app.addHook("onRequest", async (request) => {
    request.startTime = process.hrtime.bigint();
  });

  app.addHook("onResponse", async (request, reply) => {
    const started = request.startTime ?? process.hrtime.bigint();
    const duration = Number(process.hrtime.bigint() - started) / 1_000_000_000;
    const route = request.routeOptions.url ?? request.url;
    const labels = {
      method: request.method,
      route,
      status: String(reply.statusCode)
    };
    httpRequests.inc(labels);
    httpDuration.observe(labels, duration);
  });

  app.get("/metrics", async (_request, reply) => {
    reply.header("content-type", registry.contentType);
    return registry.metrics();
  });
});

declare module "fastify" {
  interface FastifyRequest {
    startTime?: bigint;
  }

  interface FastifyInstance {
    metrics: {
      onlinePlayers: Gauge<string>;
    };
  }
}
