"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, UploadCloud } from "lucide-react";

import type { InvoiceRecord, PaymentAnalytics } from "@/lib/invoice-analyzer";
import type { RecommendationBundle } from "@/lib/payment-optimizer";
import { STORAGE_KEYS } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AnalyzeResponse = {
  analytics: PaymentAnalytics;
  recommendations: RecommendationBundle;
};

export function UploadZone() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "ready">("idle");
  const [sample, setSample] = useState<InvoiceRecord[]>([]);
  const router = useRouter();

  const statusText = useMemo(() => {
    if (status === "uploading") return "Uploading and parsing file...";
    if (status === "analyzing") return "Computing client payment behavior...";
    if (status === "ready") return "Analysis ready. You can open analytics or recommendations.";
    return "Upload your invoice CSV to begin.";
  }, [status]);

  async function onAnalyze() {
    setError("");

    if (!file) {
      setError("Select a CSV file first.");
      return;
    }

    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const invoicesResponse = await fetch("/api/invoices", {
        method: "POST",
        body: formData
      });

      const invoicePayload = (await invoicesResponse.json()) as {
        records?: InvoiceRecord[];
        error?: string;
      };

      if (!invoicesResponse.ok || !invoicePayload.records) {
        setError(invoicePayload.error ?? "Unable to parse invoices.");
        setStatus("idle");
        return;
      }

      setSample(invoicePayload.records.slice(0, 5));

      setStatus("analyzing");

      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ records: invoicePayload.records })
      });

      const analyzePayload = (await analyzeResponse.json()) as AnalyzeResponse & { error?: string };

      if (!analyzeResponse.ok) {
        setError(analyzePayload.error ?? "Unable to analyze records.");
        setStatus("idle");
        return;
      }

      localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(invoicePayload.records));
      localStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify(analyzePayload.analytics));
      localStorage.setItem(STORAGE_KEYS.recommendations, JSON.stringify(analyzePayload.recommendations));

      setStatus("ready");
      router.refresh();
    } catch {
      setError("Unexpected error while processing file. Check format and try again.");
      setStatus("idle");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-sky-300" />
          Upload Invoice Data
        </CardTitle>
        <CardDescription>
          CSV columns supported: client, invoice number, issue date, due date, paid date, amount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <label className="block cursor-pointer rounded-xl border border-dashed border-slate-700 bg-[#0d1117] p-6 text-center transition hover:border-sky-500">
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                setFile(selected);
                setStatus("idle");
                setError("");
              }}
            />
            <FileSpreadsheet className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-200">{file ? file.name : "Choose a CSV file"}</p>
            <p className="mt-2 text-xs text-slate-500">Max size: 5MB</p>
          </label>

          <Button className="w-full" onClick={onAnalyze} disabled={status === "uploading" || status === "analyzing"}>
            {status === "uploading" || status === "analyzing" ? "Processing..." : "Analyze Payment Behavior"}
          </Button>

          <p className="text-sm text-slate-400">{statusText}</p>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          {sample.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="bg-slate-900 text-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-left">Client</th>
                    <th className="px-3 py-2 text-left">Invoice</th>
                    <th className="px-3 py-2 text-left">Amount</th>
                    <th className="px-3 py-2 text-left">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#0d1117] text-slate-200">
                  {sample.map((record) => (
                    <tr key={record.invoiceNumber}>
                      <td className="px-3 py-2">{record.clientName}</td>
                      <td className="px-3 py-2">{record.invoiceNumber}</td>
                      <td className="px-3 py-2">${record.amount.toLocaleString()}</td>
                      <td className="px-3 py-2">{record.paidDate.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/analytics")}>View Analytics</Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/recommendations")}>View Recommendations</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
