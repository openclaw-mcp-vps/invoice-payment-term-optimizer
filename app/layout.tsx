import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"]
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Invoice Payment Term Optimizer | Optimize payment terms based on client behavior",
  description:
    "Analyze invoice payment history, identify late-payment risk, and apply client-specific terms and discount strategies that improve cash flow.",
  openGraph: {
    title: "Invoice Payment Term Optimizer",
    description:
      "Find the best payment terms per client and improve cash flow with data-backed recommendations.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoice Payment Term Optimizer",
    description: "Use client payment behavior to improve cash conversion and reduce DSO."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="font-[var(--font-sans)] antialiased">{children}</body>
    </html>
  );
}
