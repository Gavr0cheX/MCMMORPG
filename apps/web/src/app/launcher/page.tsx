import { Download, HardDrive, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export default function LauncherPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Launcher</h1>
        <p className="mt-2 text-[var(--muted)]">Electron launcher with API login, patch manifests, asset verification, and Java detection.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Desktop Client</CardTitle>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            The launcher consumes the same authentication API as the website, pulls update manifests from the CDN-ready update service,
            verifies downloaded assets by checksum, and starts Minecraft with server-issued session metadata.
          </p>
          <Button className="mt-6">
            <Download size={16} />
            Download latest
          </Button>
        </Card>
        <div className="grid gap-4">
          <Card>
            <HardDrive className="mb-3 text-[var(--teal)]" />
            <CardTitle>Patch Channel</CardTitle>
            <p className="mt-2 text-sm text-[var(--muted)]">Stable manifest at /launcher-updates/manifest.json</p>
          </Card>
          <Card>
            <ShieldCheck className="mb-3 text-[var(--gold)]" />
            <CardTitle>Session Security</CardTitle>
            <p className="mt-2 text-sm text-[var(--muted)]">Launcher sessions are validated server-side before game join.</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
