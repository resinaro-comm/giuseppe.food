import { NextResponse, NextRequest } from "next/server";
import { getClientIp } from "./src/server/ip";
import { isBanned, checkLimit, recordViolation, banIp } from "./src/server/rate-limit";

export const config = {
  // Apply to everything under the site; you can narrow this if needed
  matcher: ["/(.*)"],
};

export async function middleware(req: NextRequest) {
  const ip = getClientIp(req);

  // Block if banned
  if (await isBanned(ip)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Lightweight pageview limiter (very generous) to deter scraping
  // 300 requests per 5 minutes per IP worldwide; adjust as you like.
  // Skip static assets to reduce noise.
  const pathname = req.nextUrl.pathname || "/";
  const isAsset = pathname.startsWith("/_next/") || pathname.startsWith("/videos/") || pathname.startsWith("/images/") || pathname.startsWith("/favicon");
  if (!isAsset && req.method === "GET") {
    const key = `pv:${ip}:300s`;
    const { allowed, current } = await checkLimit(key, 300, 300);
    if (!allowed) {
      // escalate if extremely chatty: auto-ban for 1 hour after repeated overages
      const strikes = await recordViolation(ip, 600);
      if (strikes >= 3) {
        await banIp(ip, 3600);
      }
      return new NextResponse("Too many requests", { status: 429 });
    }
  }

  const res = NextResponse.next();
  res.headers.set("x-client-ip", ip);
  return res;
}
