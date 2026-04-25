import Papa from "papaparse";
import { NextResponse } from "next/server";

import { normalizeInvoiceRow, type InvoiceRecord } from "@/lib/invoice-analyzer";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB limit." }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        {
          error: `CSV parsing failed: ${parsed.errors[0]?.message ?? "unknown error"}`
        },
        { status: 400 }
      );
    }

    const records: InvoiceRecord[] = [];

    for (const row of parsed.data) {
      const normalized = normalizeInvoiceRow(row);
      if (normalized) {
        records.push(normalized);
      }
    }

    if (records.length === 0) {
      return NextResponse.json(
        {
          error: "No valid invoice rows found. Ensure columns include client, invoice number, dates, and amount."
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      records,
      rowsReceived: parsed.data.length,
      rowsAccepted: records.length,
      rowsRejected: parsed.data.length - records.length
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error while parsing invoices." }, { status: 500 });
  }
}
