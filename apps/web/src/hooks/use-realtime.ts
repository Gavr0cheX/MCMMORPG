"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { resolveWebSocketUrl } from "@mmorpg/shared-config";
import { getAccessToken } from "@/lib/api";

export function useRealtime(onServerHeartbeat?: (payload: { serverSlug: string; onlinePlayers: number; status: string }) => void) {
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    const socket = io(resolveWebSocketUrl(process.env.NEXT_PUBLIC_WS_URL), {
      path: "/socket.io",
      auth: { token }
    });

    socket.on("server:heartbeat", (payload) => onServerHeartbeat?.(payload));

    return () => {
      socket.close();
    };
  }, [onServerHeartbeat]);
}
