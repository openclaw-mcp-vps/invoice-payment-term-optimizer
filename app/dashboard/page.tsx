import Link from "next/link";
import { ArrowRight, FileUp, Lightbulb, LineChart } from "lucide-react";

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-sky-950/30 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Workflow</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-50">Optimize payment terms in three steps</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Upload invoice history, inspect client payment behavior, then apply recommendation cards for term and discount
          updates that shorten cash conversion cycles.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <FileUp className="h-6 w-6 text-sky-300" />
          <h2 className="mt-3 text-lg font-semibold text-slate-100">1. Upload CSV</h2>
          <p className="mt-2 text-sm text-slate-400">Import invoice exports with issue date, due date, paid date, and amount.</p>
          <Link href="/dashboard/upload" className="mt-4 inline-flex items-center gap-2 text-sm text-sky-300">
            Open Upload
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <LineChart className="h-6 w-6 text-sky-300" />
          <h2 className="mt-3 text-lg font-semibold text-slate-100">2. Review Analytics</h2>
          <p className="mt-2 text-sm text-slate-400">Understand DSO, on-time rates, late trends, and client-level risk exposure.</p>
          <Link href="/dashboard/analytics" className="mt-4 inline-flex items-center gap-2 text-sm text-sky-300">
            Open Analytics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <Lightbulb className="h-6 w-6 text-sky-300" />
          <h2 className="mt-3 text-lg font-semibold text-slate-100">3. Apply Recommendations</h2>
          <p className="mt-2 text-sm text-slate-400">Get client-specific term and discount strategies with estimated cash-flow impact.</p>
          <Link href="/dashboard/recommendations" className="mt-4 inline-flex items-center gap-2 text-sm text-sky-300">
            Open Recommendations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </div>
    </section>
  );
}
