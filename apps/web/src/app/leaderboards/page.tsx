import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle } from "@/components/ui/card";

export default async function LeaderboardsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Leaderboards</h1>
        <p className="mt-2 text-[var(--muted)]">Seasonal rankings for levels, dungeons, economy, and combat.</p>
      </div>
      <Card>
        <CardTitle>Global Season</CardTitle>
        <div className="mt-4 overflow-hidden rounded-md border border-[var(--border)]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#0a0e13] text-[var(--muted)]">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Character</th>
                <th className="p-3">Metric</th>
                <th className="p-3">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--border)]">
                <td className="p-3 text-[var(--gold)]">1</td>
                <td className="p-3">Awaiting season data</td>
                <td className="p-3">Level</td>
                <td className="p-3">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
