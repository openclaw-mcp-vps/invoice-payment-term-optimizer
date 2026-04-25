import { NextResponse } from "next/server";

import {
  analyzeInvoiceRecords,
  normalizeInvoiceRow,
  type InvoiceRecord,
  type PaymentAnalytics
} from "@/lib/invoice-analyzer";
import { generatePaymentRecommendations, type RecommendationBundle } from "@/lib/payment-optimizer";

type AnalyzeRequest = {
  records?: Array<InvoiceRecord | Record<string, unknown>>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;

    if (!Array.isArray(body.records) || body.records.length === 0) {
      return NextResponse.json({ error: "records array is required." }, { status: 400 });
    }

    const normalizedRecords: InvoiceRecord[] = [];

    for (const row of body.records) {
      if (
        row &&
        typeof row === "object" &&
        "clientName" in row &&
        "invoiceNumber" in row &&
        "issueDate" in row &&
        "dueDate" in row &&
        "paidDate" in row &&
        "amount" in row
      ) {
        normalizedRecords.push(row as InvoiceRecord);
      } else {
        const normalized = normalizeInvoiceRow(row as Record<string, unknown>);
        if (normalized) {
          normalizedRecords.push(normalized);
        }
      }
    }

    if (normalizedRecords.length === 0) {
      return NextResponse.json({ error: "No valid records available for analysis." }, { status: 400 });
    }

    const analytics: PaymentAnalytics = analyzeInvoiceRecords(normalizedRecords);
    const recommendations: RecommendationBundle = generatePaymentRecommendations(analytics);

    return NextResponse.json({
      analytics,
      recommendations,
      recordsProcessed: normalizedRecords.length
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error while generating analysis." }, { status: 500 });
  }
}
