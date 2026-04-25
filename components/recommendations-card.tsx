import { ArrowUpRight, BadgeDollarSign, ClockArrowUp } from "lucide-react";

import type { ClientRecommendation } from "@/lib/payment-optimizer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function toPriorityTone(priority: ClientRecommendation["priority"]) {
  if (priority === "high") return "critical" as const;
  if (priority === "medium") return "warning" as const;
  return "neutral" as const;
}

export function RecommendationsCard({ recommendation }: { recommendation: ClientRecommendation }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>{recommendation.clientName}</CardTitle>
          <Badge tone={toPriorityTone(recommendation.priority)}>
            {recommendation.priority.toUpperCase()} PRIORITY
          </Badge>
        </div>
        <CardDescription>{recommendation.reasoning}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-[#0d1117] p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Suggested Terms</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-100">
              <ClockArrowUp className="h-4 w-4 text-sky-300" />
              Net {recommendation.suggestedTermDays}
            </p>
            <p className="mt-1 text-sm text-slate-400">Discount: {recommendation.suggestedDiscountPercent}% early payment</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0d1117] p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Expected Impact</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-300">
              <BadgeDollarSign className="h-4 w-4" />
              ${recommendation.annualCashFlowImpact.toLocaleString()}/yr
            </p>
            <p className="mt-1 text-sm text-slate-400">Collection acceleration: {recommendation.expectedDaysAcceleration} days</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
          <p className="flex items-center gap-2 font-medium text-slate-100">
            <ArrowUpRight className="h-4 w-4 text-sky-300" />
            Current behavior baseline
          </p>
          <p className="mt-2">Average days late: {recommendation.currentAverageDaysLate}</p>
          <p>On-time rate: {Math.round(recommendation.currentOnTimeRate * 100)}%</p>
          <p>Confidence: {recommendation.confidence}</p>
        </div>
      </CardContent>
    </Card>
  );
}
