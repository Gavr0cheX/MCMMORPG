"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { getAccessToken } from "@/lib/api";

export function useRealtime(onServerHeartbeat?: (payload: { serverSlug: string; onlinePlayers: number; status: string }) => void) {
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost", {
      path: "/socket.io",
      auth: { token }
    });

    socket.on("server:heartbeat", (payload) => onServerHeartbeat?.(payload));

    return () => {
      socket.close();
    };
  }, [onServerHeartbeat]);
}
