// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../styles/globals.css";
import { SiteBanner } from "@components/SiteBanner";
import { Footer } from "@components/Footer";
import { NavBar } from "@components/NavBar";

export const metadata: Metadata = {
  title: "giuseppe.food – Recipes & AI kitchen helper",
  description:
    "Easy, stupidly tasty recipes from Giuseppe plus an AI kitchen helper that adapts them to what you’ve actually got at home.",
};

// Nav now centralized in `NavBar` component (brand acts as Home link, secondary links only).

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

          {/* Unified NavBar component (already offset below banner) */}
          <NavBar />

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
