"use client";

import { useMemo } from "react";

import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import type { PaymentAnalytics } from "@/lib/invoice-analyzer";
import { STORAGE_KEYS } from "@/lib/storage";

export default function AnalyticsPage() {
  const analytics = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEYS.analytics);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as PaymentAnalytics;
    } catch {
      return null;
    }
  }, []);

  if (!analytics) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
        <h1 className="text-2xl font-bold text-slate-100">No analytics data yet</h1>
        <p className="mt-3 text-slate-400">
          Upload invoice history first. Analytics will appear here once processing completes.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Payment Analytics</h1>
        <p className="mt-2 text-slate-400">
          A client-level view of collection performance, late-payment risk, and timing trends.
        </p>
      </div>
      <AnalyticsDashboard analytics={analytics} />
    </section>
  );
}
