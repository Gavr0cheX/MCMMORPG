import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@mmorpg/shared-ui";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border-[var(--gold)] bg-[var(--gold)] text-black hover:brightness-110",
        secondary: "border-[var(--border)] bg-[var(--panel-strong)] text-white hover:border-[var(--teal)]",
        ghost: "border-transparent bg-transparent text-[var(--muted)] hover:text-white"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        icon: "h-10 w-10 px-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});

Button.displayName = "Button";
