"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback } from "react";
import type { Route } from "next";
import type { UrlObject } from "url";

type RecipeCardProps = {
  href: Route | UrlObject;
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
  timeMinutes?: number;
  variant?: "hero" | "featured" | "list";
  badge?: string;
  index?: number; // position for analytics
  source?: string; // page source context
};

export function RecipeCard({
  href,
  slug,
  title,
  description,
  thumbnail,
  tags = [],
  timeMinutes,
  variant = "list",
  badge,
  index,
  source = "unknown"
}: RecipeCardProps) {
  const onClick = useCallback(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("analytics:card-click", {
          detail: { slug, href, index, source }
        })
      );
    } catch {}
  }, [slug, href, index, source]);

  // Aspect ratios per variant
  const aspectClass = variant === "hero" ? "aspect-square" : variant === "featured" ? "aspect-[3/4]" : "aspect-[4/5]";

  const baseClasses = "click-surface group relative flex flex-col rounded-2xl overflow-hidden border bg-white/90 backdrop-blur cursor-pointer focus-ring transition hover:border-slate-300 hover:shadow-sm";
  const borderColor = variant === "hero" ? "border-slate-200" : "border-slate-200";

  return (
    <Link
      href={href}
      data-recipe={slug}
      onClick={onClick}
      aria-label={`${title} recipe card`}
      className={`${baseClasses} ${borderColor}`}
    >
      {/* Media */}
      <div className={`relative w-full ${aspectClass} bg-slate-100`}>        
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, 100vw"
            className="object-cover"
            priority
            loading="eager"
          />
        )}
        {/* Gradient + text overlay (non-interactive) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 space-y-1">
          {badge && (
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-200">{badge}</p>
          )}
          <h3 className={`font-semibold drop-shadow text-white ${variant === "hero" ? "text-lg md:text-xl" : "text-xs md:text-sm line-clamp-2"}`}>{title}</h3>
          {variant === "hero" && description && (
            <p className="text-[11px] text-slate-100 line-clamp-2">{description}</p>
          )}
        </div>
      </div>

      {/* Meta / description area */}
      <div className={`flex flex-col ${variant === "hero" ? "p-4 md:p-5 space-y-3 border-t border-slate-100" : "flex-1 gap-2 p-3"}`}>
        {variant !== "hero" && description && (
          <p className="text-[13px] text-slate-600 line-clamp-2">{description}</p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 text-[10px] justify-center md:justify-start">
          {typeof timeMinutes === "number" && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{timeMinutes} min</span>
          )}
          {tags.slice(0, variant === "featured" ? 2 : 3).map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}