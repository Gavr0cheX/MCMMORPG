import Link from "next/link";
import type { Route } from "next";
import { Bell, Crown, Download, Gauge, Shield, Trophy, Users } from "lucide-react";

const nav: Array<{ href: Route; label: string; icon: typeof Gauge }> = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/server-status", label: "Servers", icon: Shield },
  { href: "/leaderboards", label: "Rankings", icon: Trophy },
  { href: "/admin", label: "Admin", icon: Crown },
  { href: "/launcher", label: "Launcher", icon: Download }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--border)] bg-[#0a0e13]/95 p-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md border border-[var(--gold)] text-[var(--gold)]">
            <Users size={20} />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-wide">MMORPG</div>
            <div className="text-xs text-[var(--muted)]">Network Console</div>
          </div>
        </Link>
        <nav className="mt-8 grid gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-white"
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[#0b0f14]/90 px-5 backdrop-blur">
          <div>
            <div className="text-xs uppercase text-[var(--muted)]">Live Operations</div>
            <div className="text-sm font-semibold">Production-ready local stack</div>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-md border border-[var(--border)] text-[var(--muted)]" aria-label="Notifications">
            <Bell size={18} />
          </button>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-6">{children}</div>
      </main>
    </div>
  );
}
