import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      default: "bg-black text-white hover:bg-neutral-800",
      outline: "border border-neutral-500 text-black dark:text-white",
      ghost: "hover:bg-neutral-100 dark:hover:bg-neutral-800",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
