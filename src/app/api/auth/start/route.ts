import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "../../../../server/ip";
import { checkLimit } from "../../../../server/rate-limit";

export const runtime = "nodejs";

function random4Digit() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const EMAIL_RE = /.+@.+\..+/;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Basic abuse protection: 5 code requests per hour per IP
    const lim = await checkLimit(`auth:start:${ip}`, 5, 3600);
    if (!lim.allowed) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }

    const body = await req.json().catch(() => null) as { email?: string } | null;
    const email = (body?.email ?? "").trim();

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const code = random4Digit();

    // Issue a simple session token tied to this browser via cookie
    const token = crypto.randomUUID();
    const res = NextResponse.json({ ok: true, devCode: process.env.NODE_ENV !== "production" ? code : undefined });
    // Store the code in a short-lived, signed-like cookie pair (lightweight)
    // For production, replace with a proper database/redis and send the code via email/SMS.
    res.cookies.set("ai_gate_token", token, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 10 * 60 });
    res.cookies.set("ai_gate_code", code, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 10 * 60 });
    // Also store provided contact values client-readable for convenience (optional)
  res.cookies.set("ai_gate_email", email, { sameSite: "lax", secure: true, path: "/", maxAge: 10 * 60 });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Failed to start verification" }, { status: 500 });
  }
}
