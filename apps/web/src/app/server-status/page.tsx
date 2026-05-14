import { AppShell } from "@/components/layout/app-shell";
import { ServerStatusGrid } from "@/features/servers/server-status-grid";

export default function ServerStatusPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Server Status</h1>
        <p className="mt-2 text-[var(--muted)]">Velocity, lobby, realm, and future dungeon instance capacity.</p>
      </div>
      <ServerStatusGrid />
    </AppShell>
  );
}
