import { differenceInCalendarDays, isValid, parseISO } from "date-fns";

export type InvoiceRecord = {
  clientName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paidDate: string;
  amount: number;
  currency?: string;
};

export type ClientPaymentMetrics = {
  clientName: string;
  invoices: number;
  totalInvoiced: number;
  averageInvoiceAmount: number;
  averageDaysToPay: number;
  averageDaysLate: number;
  onTimeRate: number;
  earlyPaymentRate: number;
  variabilityScore: number;
  recentTrend: "improving" | "stable" | "worsening";
};

export type PaymentAnalytics = {
  summary: {
    invoiceCount: number;
    clientCount: number;
    totalInvoiced: number;
    weightedAverageDaysToPay: number;
    weightedAverageDaysLate: number;
    onTimeRate: number;
    earlyPaymentRate: number;
    lateInvoicesRate: number;
    estimatedDso: number;
  };
  clients: ClientPaymentMetrics[];
  paymentTimeline: Array<{
    month: string;
    averageDaysToPay: number;
    totalCollected: number;
  }>;
};

const FIELD_MAPPINGS = {
  clientName: ["client", "clientname", "customer", "customername", "account", "company"],
  invoiceNumber: ["invoice", "invoicenumber", "invoiceid", "number"],
  issueDate: ["issuedate", "invoice_date", "dateissued", "issued", "invoice date"],
  dueDate: ["duedate", "due_date", "paymentdue", "termsdate", "due date"],
  paidDate: ["paiddate", "paymentdate", "datepaid", "paid_on", "paid date"],
  amount: ["amount", "total", "invoiceamount", "value", "balance"]
} as const;

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findField(
  row: Record<string, unknown>,
  aliases: readonly string[]
): string | number | null {
  const normalizedAliases = new Set(aliases.map((alias) => normalizeKey(alias)));

  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    if (normalizedAliases.has(normalizeKey(key))) {
      return typeof value === "string" || typeof value === "number" ? value : String(value);
    }
  }

  return null;
}

function parseDate(input: string | number | null): string | null {
  if (input === null) {
    return null;
  }

  const raw = String(input).trim();
  if (!raw) {
    return null;
  }

  const direct = parseISO(raw);
  if (isValid(direct)) {
    return direct.toISOString();
  }

  const fallback = new Date(raw);
  if (Number.isNaN(fallback.getTime())) {
    return null;
  }

  return fallback.toISOString();
}

function parseAmount(input: string | number | null): number | null {
  if (input === null) {
    return null;
  }

  const raw = String(input).replace(/[^0-9.-]/g, "");
  const amount = Number.parseFloat(raw);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return amount;
}

function stdDev(values: number[]): number {
  if (values.length <= 1) {
    return 0;
  }

  const avg = values.reduce((acc, value) => acc + value, 0) / values.length;
  const variance =
    values.reduce((acc, value) => acc + (value - avg) ** 2, 0) / (values.length - 1);

  return Math.sqrt(variance);
}

function round(value: number, digits = 2): number {
  const divisor = 10 ** digits;
  return Math.round(value * divisor) / divisor;
}

export function normalizeInvoiceRow(row: Record<string, unknown>): InvoiceRecord | null {
  const clientNameRaw = findField(row, FIELD_MAPPINGS.clientName);
  const invoiceNumberRaw = findField(row, FIELD_MAPPINGS.invoiceNumber);
  const issueDateRaw = findField(row, FIELD_MAPPINGS.issueDate);
  const dueDateRaw = findField(row, FIELD_MAPPINGS.dueDate);
  const paidDateRaw = findField(row, FIELD_MAPPINGS.paidDate);
  const amountRaw = findField(row, FIELD_MAPPINGS.amount);

  const clientName = clientNameRaw ? String(clientNameRaw).trim() : "";
  const invoiceNumber = invoiceNumberRaw ? String(invoiceNumberRaw).trim() : "";
  const issueDate = parseDate(issueDateRaw);
  const dueDate = parseDate(dueDateRaw);
  const paidDate = parseDate(paidDateRaw);
  const amount = parseAmount(amountRaw);

  if (!clientName || !invoiceNumber || !issueDate || !dueDate || !paidDate || amount === null) {
    return null;
  }

  return {
    clientName,
    invoiceNumber,
    issueDate,
    dueDate,
    paidDate,
    amount,
    currency: "USD"
  };
}

export function analyzeInvoiceRecords(records: InvoiceRecord[]): PaymentAnalytics {
  if (records.length === 0) {
    return {
      summary: {
        invoiceCount: 0,
        clientCount: 0,
        totalInvoiced: 0,
        weightedAverageDaysToPay: 0,
        weightedAverageDaysLate: 0,
        onTimeRate: 0,
        earlyPaymentRate: 0,
        lateInvoicesRate: 0,
        estimatedDso: 0
      },
      clients: [],
      paymentTimeline: []
    };
  }

  const validRecords = records.filter((record) => {
    const issue = new Date(record.issueDate);
    const due = new Date(record.dueDate);
    const paid = new Date(record.paidDate);
    return Number.isFinite(issue.getTime()) && Number.isFinite(due.getTime()) && Number.isFinite(paid.getTime());
  });

  const byClient = new Map<string, InvoiceRecord[]>();
  for (const record of validRecords) {
    const list = byClient.get(record.clientName) ?? [];
    list.push(record);
    byClient.set(record.clientName, list);
  }

  const clients: ClientPaymentMetrics[] = [];

  for (const [clientName, clientRecords] of byClient.entries()) {
    const daysToPay = clientRecords.map((record) =>
      differenceInCalendarDays(new Date(record.paidDate), new Date(record.issueDate))
    );

    const daysLate = clientRecords.map((record) =>
      differenceInCalendarDays(new Date(record.paidDate), new Date(record.dueDate))
    );

    const totalInvoiced = clientRecords.reduce((sum, record) => sum + record.amount, 0);
    const onTimeCount = daysLate.filter((value) => value <= 0).length;
    const earlyCount = daysLate.filter((value) => value < 0).length;

    const sortedByPaidDate = [...clientRecords].sort(
      (a, b) => new Date(a.paidDate).getTime() - new Date(b.paidDate).getTime()
    );

    const recentChunk = sortedByPaidDate.slice(-Math.min(3, sortedByPaidDate.length));
    const baselineChunk = sortedByPaidDate.slice(
      0,
      Math.max(sortedByPaidDate.length - recentChunk.length, 1)
    );

    const recentAvgLate =
      recentChunk.reduce(
        (sum, record) =>
          sum + differenceInCalendarDays(new Date(record.paidDate), new Date(record.dueDate)),
        0
      ) / recentChunk.length;

    const baselineAvgLate =
      baselineChunk.reduce(
        (sum, record) =>
          sum + differenceInCalendarDays(new Date(record.paidDate), new Date(record.dueDate)),
        0
      ) / baselineChunk.length;

    const recentDelta = recentAvgLate - baselineAvgLate;

    clients.push({
      clientName,
      invoices: clientRecords.length,
      totalInvoiced: round(totalInvoiced),
      averageInvoiceAmount: round(totalInvoiced / clientRecords.length),
      averageDaysToPay: round(daysToPay.reduce((sum, value) => sum + value, 0) / daysToPay.length),
      averageDaysLate: round(daysLate.reduce((sum, value) => sum + value, 0) / daysLate.length),
      onTimeRate: round(onTimeCount / clientRecords.length, 4),
      earlyPaymentRate: round(earlyCount / clientRecords.length, 4),
      variabilityScore: round(stdDev(daysLate), 2),
      recentTrend: recentDelta <= -2 ? "improving" : recentDelta >= 2 ? "worsening" : "stable"
    });
  }

  const totalInvoiced = validRecords.reduce((sum, record) => sum + record.amount, 0);
  const weightedAverageDaysToPay =
    validRecords.reduce((sum, record) => {
      const days = differenceInCalendarDays(new Date(record.paidDate), new Date(record.issueDate));
      return sum + days * record.amount;
    }, 0) / totalInvoiced;

  const weightedAverageDaysLate =
    validRecords.reduce((sum, record) => {
      const days = differenceInCalendarDays(new Date(record.paidDate), new Date(record.dueDate));
      return sum + days * record.amount;
    }, 0) / totalInvoiced;

  const onTimeCount = validRecords.filter(
    (record) => differenceInCalendarDays(new Date(record.paidDate), new Date(record.dueDate)) <= 0
  ).length;

  const earlyCount = validRecords.filter(
    (record) => differenceInCalendarDays(new Date(record.paidDate), new Date(record.dueDate)) < 0
  ).length;

  const lateCount = validRecords.length - onTimeCount;

  const timelineMap = new Map<string, { totalDaysToPay: number; count: number; totalCollected: number }>();

  for (const record of validRecords) {
    const month = record.paidDate.slice(0, 7);
    const bucket = timelineMap.get(month) ?? { totalDaysToPay: 0, count: 0, totalCollected: 0 };
    bucket.totalDaysToPay += differenceInCalendarDays(new Date(record.paidDate), new Date(record.issueDate));
    bucket.count += 1;
    bucket.totalCollected += record.amount;
    timelineMap.set(month, bucket);
  }

  const paymentTimeline = [...timelineMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, bucket]) => ({
      month,
      averageDaysToPay: round(bucket.totalDaysToPay / bucket.count),
      totalCollected: round(bucket.totalCollected)
    }));

  return {
    summary: {
      invoiceCount: validRecords.length,
      clientCount: byClient.size,
      totalInvoiced: round(totalInvoiced),
      weightedAverageDaysToPay: round(weightedAverageDaysToPay),
      weightedAverageDaysLate: round(weightedAverageDaysLate),
      onTimeRate: round(onTimeCount / validRecords.length, 4),
      earlyPaymentRate: round(earlyCount / validRecords.length, 4),
      lateInvoicesRate: round(lateCount / validRecords.length, 4),
      estimatedDso: round(weightedAverageDaysToPay)
    },
    clients: clients.sort((a, b) => b.totalInvoiced - a.totalInvoiced),
    paymentTimeline
  };
}
