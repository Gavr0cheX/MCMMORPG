import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { CharacterPanel } from "@/features/characters/character-panel";
import { NotificationList } from "@/features/notifications/notification-list";
import { ServerStatusGrid } from "@/features/servers/server-status-grid";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Network Dashboard</h1>
        <p className="mt-2 text-[var(--muted)]">Accounts, characters, server telemetry, and real-time events in one place.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          <ServerStatusGrid />
          <Card>
            <CardTitle>Operational Map</CardTitle>
            <div className="mt-4 grid min-h-64 place-items-center rounded-md border border-[var(--border)] bg-[#0a0e13]">
              <div className="grid w-full max-w-2xl grid-cols-3 items-center gap-3 px-6 text-center text-sm">
                <div className="rounded-md border border-[var(--gold)] p-4 text-[var(--gold)]">Lobby</div>
                <div className="rounded-md border border-[var(--teal)] p-4 text-[var(--teal)]">Realm Pool</div>
                <div className="rounded-md border border-[var(--violet)] p-4 text-[var(--violet)]">Dungeon Pool</div>
              </div>
            </div>
          </Card>
        </div>
        <div className="grid content-start gap-4">
          <CharacterPanel />
          <NotificationList />
        </div>
      </div>
    </AppShell>
  );
}
