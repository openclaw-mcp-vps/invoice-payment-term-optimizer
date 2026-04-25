import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/upload", label: "Upload" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/recommendations", label: "Recommendations" }
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get("ipt_paid")?.value === "1";

  if (!hasAccess) {
    redirect("/?paywall=1");
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-800 bg-[#0d1117]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-[var(--font-display)] text-xl font-semibold text-slate-100">Dashboard</p>
              <p className="text-sm text-slate-400">Invoice payment behavior intelligence</p>
            </div>
            <Link href="/" className="text-sm text-sky-300 underline-offset-4 hover:underline">
              Back to site
            </Link>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-sky-500"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
