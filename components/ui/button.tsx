import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-sky-400 text-slate-950 hover:bg-sky-300 focus-visible:ring-sky-300 disabled:bg-slate-700 disabled:text-slate-300",
  outline:
    "border border-slate-700 bg-transparent text-slate-100 hover:border-slate-500 hover:bg-slate-900 focus-visible:ring-slate-500 disabled:border-slate-800 disabled:text-slate-500",
  ghost:
    "bg-transparent text-slate-200 hover:bg-slate-800 focus-visible:ring-slate-400 disabled:text-slate-500"
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-11 px-5 text-sm font-semibold",
  sm: "h-9 px-3 text-xs font-medium",
  lg: "h-12 px-6 text-base font-semibold"
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button };
