import * as React from "react";
import { cn } from "@mmorpg/shared-ui";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-[var(--border)] bg-[#0e141b] px-3 text-sm text-white outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--teal)]",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
