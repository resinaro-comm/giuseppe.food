"use client";
// src/components/navbar.tsx
import Link from "next/link";

// Only show secondary links; brand acts as Home link.
const navItems = [
  { href: "/recipes", label: "Recipes" },
] as const;

export function NavBar() {
  return (
    <header className="sticky top-10 z-40 w-full backdrop-blur bg-white/80 border-b border-slate-200">
      <nav className="container-base h-12 flex items-center justify-between">
        {/* Brand */}
        {/* Brand doubles as Home link */}
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-slate-900"
        >
          giuseppe.food
        </Link>

        <div className="flex items-center gap-4">
          {/* Main nav */}
          <ul className="flex items-center gap-5 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-slate-700 hover:text-slate-900 transition-colors text-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Social buttons */}
          <div className="flex items-center gap-2">
            <a
              href="https://www.instagram.com/ggg002g"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white h-7 w-7 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
              aria-label="Instagram"
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
              href="https://www.tiktok.com/@giuseppe.food"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white h-7 w-7 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
              aria-label="TikTok"
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
        </div>
      </nav>
    </header>
  );
}
