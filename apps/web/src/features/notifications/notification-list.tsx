"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

type Notification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
};

export function NotificationList() {
  const { data = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<Notification[]>("/notifications")
  });

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Bell size={18} className="text-[var(--teal)]" />
        <CardTitle>Notifications</CardTitle>
      </div>
      <div className="grid gap-3">
        {data.slice(0, 5).map((notification) => (
          <div key={notification.id} className="rounded-md border border-[var(--border)] p-3">
            <div className="text-sm font-semibold">{notification.title}</div>
            <div className="text-xs text-[var(--muted)]">{notification.body}</div>
          </div>
        ))}
        {data.length === 0 ? <p className="text-sm text-[var(--muted)]">No notifications.</p> : null}
      </div>
    </Card>
  );
}
