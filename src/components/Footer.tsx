import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur">
      <div className="container-base w-full py-8 flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between gap-6 text-xs md:text-sm text-slate-600 text-center md:text-left">
        {/* Brand + tagline */}
        <div className="space-y-1">
          <p className="font-medium text-slate-800">
            © {year} giuseppe.food
          </p>
          <p>Recipes &amp; AI kitchen helper.</p>
        </div>

        {/* Links + contact + socials */}
        <div className="flex flex-col md:items-end gap-2">
          {/* Quick nav */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-end">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <span className="text-slate-400">·</span>
            <Link href="/recipes" className="hover:text-slate-900">
              Recipes
            </Link>
            <span className="text-slate-400">·</span>
            <Link href="/ai" className="hover:text-slate-900">
              AI Kitchen
            </Link>
          </div>

          {/* Contact */}
          <p className="text-[11px] md:text-xs text-slate-500">
            Collabs &amp; business:{" "}
            <a
              href="mailto:contact@giuseppe.food"
              className="underline underline-offset-2 hover:text-slate-900"
            >
              contact@giuseppe.food
            </a>
          </p>

          {/* Socials */}
          <div className="flex items-center justify-center md:justify-end gap-2 pt-1">
            <a
              href="https://www.instagram.com/ggg002g"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white h-7 w-7 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
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
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white h-7 w-7 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="currentColor"
              >
                <path d="M16.75 5.25c.45.48.98.9 1.57 1.23.54.31 1.13.52 1.74.62v2.22a5.7 5.7 0 0 1-3.31-1.09v5.87c0 3.11-2.52 5.65-5.63 5.65A5.64 5.64 0 0 1 5.5 14.3c0-3.11 2.54-5.63 5.65-5.63.26 0 .52.02.77.06v2.32a3.4 3.4 0 0 0-.77-.09 3.33 3.33 0 0 0-3.32 3.34 3.33 3.33 0 0 0 3.32 3.34 3.33 3.33 0 0 0 3.32-3.34V3.75h2.26v1.5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
