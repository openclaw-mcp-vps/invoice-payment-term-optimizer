"use client";

import { useMemo } from "react";

import { RecommendationsCard } from "@/components/recommendations-card";
import type { RecommendationBundle } from "@/lib/payment-optimizer";
import { STORAGE_KEYS } from "@/lib/storage";

export default function RecommendationsPage() {
  const recommendations = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEYS.recommendations);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as RecommendationBundle;
    } catch {
      return null;
    }
  }, []);

  if (!recommendations) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
        <h1 className="text-2xl font-bold text-slate-100">No recommendations yet</h1>
        <p className="mt-3 text-slate-400">
          Process invoice data from the Upload page to generate actionable term updates.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Recommendation Summary</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">{recommendations.headline}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Projected annual cash-flow improvement: ${recommendations.projectedAnnualCashFlowImpact.toLocaleString()}.
          Estimated DSO reduction: {recommendations.projectedDsoReduction} days.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          {recommendations.strategicActions.map((action) => (
            <li key={action}>• {action}</li>
          ))}
        </ul>
      </div>

      <div className="grid gap-5">
        {recommendations.clientRecommendations.map((item) => (
          <RecommendationsCard key={item.clientName} recommendation={item} />
        ))}
      </div>
    </section>
  );
}
