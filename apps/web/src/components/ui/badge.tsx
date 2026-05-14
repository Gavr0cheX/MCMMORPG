import { cn } from "@mmorpg/shared-ui";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-sm border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)]", className)}>
      {children}
    </span>
  );
}
