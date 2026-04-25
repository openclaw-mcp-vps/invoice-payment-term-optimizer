import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hasAccess = request.cookies.get("ipt_paid")?.value === "1";
  const path = request.nextUrl.pathname;

  if (!hasAccess && (path.startsWith("/dashboard") || path === "/api/invoices" || path === "/api/analyze")) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Paid access required." }, { status: 403 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("paywall", "1");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/invoices", "/api/analyze"]
};
