// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../styles/globals.css";
import { SiteBanner } from "@components/SiteBanner";
import { Footer } from "@components/Footer";

export const metadata: Metadata = {
  title: "giuseppe.food – Recipes & AI kitchen helper",
  description:
    "Easy, stupidly tasty recipes from Giuseppe plus an AI kitchen helper that adapts them to what you’ve actually got at home.",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recipes" },
  { href: "/ai", label: "AI Kitchen" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <div className="min-h-screen flex flex-col">
          {/* Site-wide banner above nav */}
          <SiteBanner />

          {/* Top nav */}
          <header className="sticky top-10 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
            <nav className="container-base flex items-center justify-between h-16">
              {/* Brand */}
              <Link
                href="/"
                className="text-lg md:text-xl font-semibold tracking-tight text-slate-900"
              >
                Homepage
              </Link>

              {/* Socials (middle on mobile) */}
              <div className="flex items-center gap-2 ml-3">
                <a
                  href="https://www.instagram.com/ggg002g"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white h-8 w-8 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
                >
                  {/* Instagram icon */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                      ry="5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
                  </svg>
                </a>

                <a
                  href="https://www.tiktok.com/@gggg0002g"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white h-8 w-8 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
                >
                  {/* TikTok icon */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path d="M16.75 5.25c.45.48.98.9 1.57 1.23.54.31 1.13.52 1.74.62v2.22a5.7 5.7 0 0 1-3.31-1.09v5.87c0 3.11-2.52 5.65-5.63 5.65A5.64 5.64 0 0 1 5.5 14.3c0-3.11 2.54-5.63 5.65-5.63.26 0 .52.02.77.06v2.32a3.4 3.4 0 0 0-.77-.09 3.33 3.33 0 0 0-3.32 3.34 3.33 3.33 0 0 0 3.32 3.34 3.33 3.33 0 0 0 3.32-3.34V3.75h2.26v1.5z" />
                  </svg>
                </a>
              </div>

              {/* Main nav (far right, always visible; hide "Home" on mobile) */}
              <ul className="flex items-center gap-5 text-sm font-medium ml-auto">
                <li>
                  <Link
                    href="/recipes"
                    className="text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    Recipes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai"
                    className="text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    AI Kitchen
                  </Link>
                </li>
              </ul>
            </nav>
          </header>

          {/* Page content */}
          <main className="flex-1">
            <div className="container-base py-10 md:py-16">{children}</div>
          </main>

            {/* Footer */}
          <Footer />
        </div>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
