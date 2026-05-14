import { cn } from "@mmorpg/shared-ui";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-lg", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold text-white", className)} {...props} />;
}
