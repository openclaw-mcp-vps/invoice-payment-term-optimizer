import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, ChartColumnIncreasing, CircleDollarSign, TimerReset, TriangleAlert } from "lucide-react";

import { AccessUnlockForm } from "@/components/access-unlock-form";
import { PricingSection } from "@/components/pricing-section";

const faq = [
  {
    question: "What invoice format do I need?",
    answer:
      "Upload a CSV with client name, invoice number, issue date, due date, paid date, and amount. Most billing tools can export this directly."
  },
  {
    question: "Does this replace my invoicing software?",
    answer:
      "No. It works as an optimization layer on top of your existing invoicing process and gives policy recommendations you can apply in your current stack."
  },
  {
    question: "How does access work after purchase?",
    answer:
      "Stripe handles checkout, then this app unlocks dashboard access for the email that completed payment through webhook verification."
  }
];

export default async function LandingPage() {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get("ipt_paid")?.value === "1";

  return (
    <main>
      <header className="border-b border-slate-800/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-[var(--font-display)] text-lg font-semibold text-slate-100">Invoice Payment Term Optimizer</p>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Optimize payment terms based on client behavior</p>
          </div>
          <Link
            href={hasAccess ? "/dashboard" : "#pricing"}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-500"
          >
            {hasAccess ? "Open Dashboard" : "See Pricing"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr,0.85fr] lg:px-8">
          <div>
            <p className="inline-flex rounded-full border border-sky-900 bg-sky-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              Invoice Billing Intelligence
            </p>
            <h1 className="mt-6 max-w-3xl font-[var(--font-display)] text-4xl font-bold leading-tight text-slate-50 md:text-6xl">
              Stop giving every client the same payment terms.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              This tool analyzes how each client actually pays and recommends targeted terms and discount tactics that
              improve cash flow without across-the-board margin loss.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="rounded-xl border border-slate-700 px-3 py-2">For freelancers, agencies, and B2B service providers</span>
              <span className="rounded-xl border border-slate-700 px-3 py-2">Actionable recommendations in minutes</span>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm font-semibold text-slate-100">Why standard terms hurt cash flow</p>
            <div className="space-y-3 text-sm text-slate-300">
              <p className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                Early-paying clients are left on long net terms that delay incoming cash.
              </p>
              <p className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                Late-paying clients keep extending DSO because terms never adapt.
              </p>
              <p className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                Blanket discounts erode margin even where they do not change payment timing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Solution</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-50 md:text-4xl">
              Data-driven payment terms, client by client.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
              <ChartColumnIncreasing className="h-6 w-6 text-sky-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-100">Behavior Analytics</h3>
              <p className="mt-2 text-sm text-slate-400">
                Measure days-late trends, on-time rate, and payment volatility per client from your real invoice history.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
              <TimerReset className="h-6 w-6 text-sky-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-100">Term Optimization</h3>
              <p className="mt-2 text-sm text-slate-400">
                Get recommended net terms and discount percentages matched to payment behavior and risk profile.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
              <CircleDollarSign className="h-6 w-6 text-sky-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-100">Cash-Flow Impact</h3>
              <p className="mt-2 text-sm text-slate-400">
                See expected collection acceleration and annual cash impact before you change client terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr,0.9fr] lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-50">Questions teams ask before rollout</h2>
            <div className="mt-8 space-y-5">
              {faq.map((item) => (
                <article key={item.question} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                  <h3 className="text-lg font-semibold text-slate-100">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="self-start lg:sticky lg:top-8">
            <AccessUnlockForm />
          </div>
        </div>
      </section>
    </main>
  );
}
