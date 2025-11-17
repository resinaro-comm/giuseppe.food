import Link from "next/link";

export function SiteBanner() {
  const text = "Trying to contact me? DM me on Instagram — click here →";
  return (
    <div className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900 text-slate-100 h-10">
      {/* fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-900 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-900 to-transparent z-10" />

      <Link href="https://www.instagram.com/ggg002g" target="_blank" className="block h-full">
        <div className="overflow-hidden h-full">
          <div className="flex h-full items-center whitespace-nowrap animate-marquee hover:[animation-play-state:paused] gap-12 text-sm font-medium">
            <span>{text}</span>
            <span aria-hidden>{text}</span>
            <span aria-hidden>{text}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
