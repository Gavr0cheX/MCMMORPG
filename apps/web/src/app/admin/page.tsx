import { Activity, Ban, Coins, Megaphone, Server } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle } from "@/components/ui/card";

const tools = [
  { label: "Player Management", icon: Ban, detail: "Bans, mutes, roles, and audit trails" },
  { label: "Economy Moderation", icon: Coins, detail: "Authoritative grants and transaction review" },
  { label: "Announcements", icon: Megaphone, detail: "Global web, launcher, and in-game broadcasts" },
  { label: "Server Control", icon: Server, detail: "Drain, restart, and instance capacity controls" },
  { label: "Analytics", icon: Activity, detail: "Population, retention, and gameplay telemetry" }
];

export default function AdminPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="mt-2 text-[var(--muted)]">Operational tooling is permission-gated by API role checks and audit logging.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.label}>
            <tool.icon className="mb-4 text-[var(--gold)]" size={22} />
            <CardTitle>{tool.label}</CardTitle>
            <p className="mt-2 text-sm text-[var(--muted)]">{tool.detail}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
