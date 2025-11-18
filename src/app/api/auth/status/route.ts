import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const verified = req.cookies.get("ai_verified")?.value === "1";
  return NextResponse.json({ verified });
}
