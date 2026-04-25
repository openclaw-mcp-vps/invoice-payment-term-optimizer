import { CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const benefits = [
  "Upload CSV invoice exports from tools like QuickBooks, Xero, or Wave",
  "Model each client's true payment behavior and on-time probability",
  "Get clear term updates and discount plays to reduce DSO"
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Card className="border-sky-900/60 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Pricing</p>
            <CardTitle className="text-3xl md:text-4xl">One plan. Built for billing-focused teams.</CardTitle>
            <CardDescription className="max-w-2xl text-base text-slate-300">
              Invoice Payment Term Optimizer runs your client payment history through practical cash-flow logic and gives
              you recommended terms you can apply today.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
            <div className="space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-700 bg-[#0d1117] p-6">
              <p className="text-sm uppercase tracking-wide text-slate-400">Invoice Payment Term Optimizer</p>
              <p className="mt-3 text-4xl font-bold text-slate-50">$12<span className="text-lg text-slate-400">/mo</span></p>
              <p className="mt-3 text-sm text-slate-300">
                Hosted checkout through Stripe. Purchase once and unlock full dashboard access with your receipt email.
              </p>
              <a
                href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                target="_blank"
                rel="noreferrer"
              >
                Buy Access
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
