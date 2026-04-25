import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

type PaidCustomer = {
  email: string;
  source: string;
  eventId?: string;
  purchasedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(PURCHASES_FILE);
  } catch {
    await fs.writeFile(PURCHASES_FILE, "[]", "utf8");
  }
}

export async function readPaidCustomers(): Promise<PaidCustomer[]> {
  await ensureDataFile();

  try {
    const raw = await fs.readFile(PURCHASES_FILE, "utf8");
    const parsed = JSON.parse(raw) as PaidCustomer[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export async function hasPaidCustomer(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  const customers = await readPaidCustomers();
  return customers.some((customer) => customer.email.toLowerCase() === normalized);
}

export async function upsertPaidCustomer(
  email: string,
  source: string,
  eventId?: string
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return;
  }

  const customers = await readPaidCustomers();
  const existing = customers.find((customer) => customer.email === normalized);

  if (existing) {
    existing.purchasedAt = new Date().toISOString();
    existing.source = source;
    if (eventId) {
      existing.eventId = eventId;
    }
  } else {
    customers.push({
      email: normalized,
      source,
      eventId,
      purchasedAt: new Date().toISOString()
    });
  }

  await fs.writeFile(PURCHASES_FILE, JSON.stringify(customers, null, 2), "utf8");
}

function parseStripeSignature(signatureHeader: string) {
  const values = signatureHeader
    .split(",")
    .map((part) => part.trim())
    .map((part) => {
      const [key, value] = part.split("=");
      return { key, value };
    });

  const timestamp = values.find((entry) => entry.key === "t")?.value;
  const signatures = values
    .filter((entry) => entry.key === "v1")
    .map((entry) => entry.value)
    .filter(Boolean) as string[];

  return { timestamp, signatures };
}

export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  return signatures.some((signature) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  });
}
