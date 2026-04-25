import { NextResponse } from "next/server";

import { upsertPaidCustomer, verifyStripeWebhookSignature } from "@/lib/lemonsqueezy";

type StripeEvent = {
  id: string;
  type: string;
  data?: {
    object?: {
      customer_email?: string;
      customer_details?: {
        email?: string;
      };
      receipt_email?: string;
      billing_details?: {
        email?: string;
      };
    };
  };
};

function extractEmail(event: StripeEvent): string | null {
  const object = event.data?.object;
  const email =
    object?.customer_details?.email ?? object?.customer_email ?? object?.receipt_email ?? object?.billing_details?.email;

  return email ? email.toLowerCase().trim() : null;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }

  const rawBody = await request.text();

  const isValidSignature = verifyStripeWebhookSignature(rawBody, signature, secret);
  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as StripeEvent;

  if (
    event.type === "checkout.session.completed" ||
    event.type === "payment_link.payment_completed" ||
    event.type === "invoice.paid"
  ) {
    const email = extractEmail(event);

    if (!email) {
      return NextResponse.json({ received: true, ignored: "No customer email found." });
    }

    await upsertPaidCustomer(email, "stripe", event.id);
  }

  return NextResponse.json({ received: true });
}
