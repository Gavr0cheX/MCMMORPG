"use client";

import { useQuery } from "@tanstack/react-query";
import { Server, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { getServerStatus } from "@/services/servers";
import { useRealtime } from "@/hooks/use-realtime";

export function ServerStatusGrid() {
  const { data = [], isLoading } = useQuery({ queryKey: ["servers"], queryFn: getServerStatus });
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});

  useRealtime((payload) => {
    setLiveCounts((current) => ({ ...current, [payload.serverSlug]: payload.onlinePlayers }));
  });

  const totalPlayers = useMemo(
    () => data.reduce((sum, server) => sum + (liveCounts[server.slug] ?? server.onlinePlayers), 0),
    [data, liveCounts]
  );

  if (isLoading) {
    return <Card className="h-40 animate-pulse" />;
  }

  return (
    <div className="grid gap-4">
      <Card className="flex items-center justify-between">
        <div>
          <CardTitle>Network Population</CardTitle>
          <p className="text-sm text-[var(--muted)]">Live counts stream through Redis and Socket.IO.</p>
        </div>
        <div className="flex items-center gap-2 text-2xl font-bold text-[var(--teal)]">
          <Users size={22} />
          {totalPlayers}
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {data.map((server) => (
          <Card key={server.id}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server size={18} className="text-[var(--gold)]" />
                <CardTitle>{server.slug}</CardTitle>
              </div>
              <Badge className={server.status === "ONLINE" ? "border-[var(--teal)] text-[var(--teal)]" : ""}>{server.status}</Badge>
            </div>
            <div className="text-3xl font-bold">{liveCounts[server.slug] ?? server.onlinePlayers}</div>
            <div className="mt-1 text-sm text-[var(--muted)]">of {server.maxPlayers} players</div>
            <div className="mt-4 h-2 rounded-sm bg-[#0a0e13]">
              <div
                className="h-2 rounded-sm bg-[var(--teal)]"
                style={{ width: `${Math.min(100, ((liveCounts[server.slug] ?? server.onlinePlayers) / server.maxPlayers) * 100)}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
