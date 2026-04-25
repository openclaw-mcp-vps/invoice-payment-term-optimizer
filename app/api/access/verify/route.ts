import { NextResponse } from "next/server";

import { hasPaidCustomer } from "@/lib/lemonsqueezy";

type VerifyPayload = {
  email?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as VerifyPayload;
    const email = payload.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const hasPaid = await hasPaidCustomer(email);

    if (!hasPaid) {
      return NextResponse.json(
        {
          error:
            "No completed purchase found for this email yet. If you just paid, wait for webhook delivery and retry."
        },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ message: "Purchase verified. Dashboard access unlocked." });
    response.cookies.set("ipt_paid", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Unexpected server error during verification." }, { status: 500 });
  }
}
