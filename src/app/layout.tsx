// src/app/layout.tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "../styles/globals.css";
import { SiteBanner } from "@components/SiteBanner";
import { Footer } from "@components/Footer";
import { NavBar } from "@components/NavBar";
import { AIChatWidget } from "@components/AIChatWidget";

export const metadata: Metadata = {
  title: "giuseppe.food – Recipes & AI kitchen helper",
  description:
    "Easy, stupidly tasty recipes from Giuseppe plus an AI kitchen helper that adapts them to what you’ve actually got at home.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-body">
        <div className="flex min-h-screen flex-col">
          {/* Top banner + nav */}
          <SiteBanner />
          <NavBar />

          {/* Page content */}
          <main className="flex-1">
            <div className="container-base py-8 md:py-12 lg:py-16">
              {children}
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>

        {/* Floating AI helper lives at document level so it's independent of page layout */}
        <AIChatWidget />

        {/* Telemetry */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
