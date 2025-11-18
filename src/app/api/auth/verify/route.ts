import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as { code?: string } | null;
    const code = (body?.code ?? "").trim();
    if (!/^[0-9]{4}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const cookieCode = req.cookies.get("ai_gate_code")?.value ?? "";
    const token = req.cookies.get("ai_gate_token")?.value ?? "";
    if (!cookieCode || !token) {
      return NextResponse.json({ error: "No pending verification" }, { status: 400 });
    }

    if (cookieCode !== code) {
      return NextResponse.json({ error: "Incorrect code" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    // Mark verified for this browser
    res.cookies.set("ai_verified", "1", { httpOnly: false, sameSite: "lax", secure: true, path: "/", maxAge: 30 * 24 * 3600 });
    // Clear temporary cookies
    res.cookies.set("ai_gate_code", "", { path: "/", maxAge: 0 });
    res.cookies.set("ai_gate_token", "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
  }
}
