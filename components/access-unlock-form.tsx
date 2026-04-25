"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AccessUnlockForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Enter the email used at checkout.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/access/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to verify purchase. Ensure webhook setup is complete.");
        return;
      }

      setMessage(payload.message ?? "Access unlocked.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-sm font-semibold text-slate-100">Already purchased?</p>
      <p className="text-sm text-slate-400">
        Enter the same email from your Stripe receipt to unlock the dashboard on this device.
      </p>
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@yourcompany.com"
        autoComplete="email"
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Checking..." : "Unlock Dashboard"}
      </Button>
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </form>
  );
}
