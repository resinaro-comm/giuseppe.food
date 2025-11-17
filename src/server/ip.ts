import { NextRequest } from "next/server";

// Best-effort IP extraction that works on Vercel and locally
export function getClientIp(req: NextRequest): string {
  // next/server exposes req.ip in many deploy targets
  const direct = (req as any).ip as string | undefined;
  if (direct) return direct;

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    // Format: client, proxy1, proxy2
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "0.0.0.0"; // fallback
}
