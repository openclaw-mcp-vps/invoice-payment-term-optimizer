import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "positive" | "warning" | "critical";
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-slate-800 text-slate-200",
  positive: "bg-emerald-950 text-emerald-300",
  warning: "bg-amber-950 text-amber-300",
  critical: "bg-rose-950 text-rose-300"
};

function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
