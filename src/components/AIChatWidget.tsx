// src/components/AIChatWidget.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const AIChat = dynamic(
  () => import("@components/AIChat").then((m) => m.AIChat),
  { ssr: false }
);

type PageContext = {
  path?: string;
  source?: string;
  section?: string;
  scrollY?: number;
};

type OpenEventDetail = {
  recipeSlug?: string;
  question?: string;
  source?: string;
  section?: string;
};

export function AIChatWidget() {
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [recipeSlug, setRecipeSlug] = useState<string | undefined>(undefined);
  const [initialQ, setInitialQ] = useState<string | undefined>(undefined);
  const [pageCtx, setPageCtx] = useState<PageContext | undefined>(undefined);

  // Optional: hide on /ai in case you re-add a full page later
  const hidden = pathname?.startsWith("/ai") ?? false;

  // Only render via portal after we’re on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for global open events from anywhere in the app
  useEffect(() => {
    const openFromDetail = (detail?: OpenEventDetail) => {
      setOpen(true);

      if (detail?.recipeSlug) setRecipeSlug(detail.recipeSlug);
      if (typeof detail?.question === "string") setInitialQ(detail.question);

      if (typeof window !== "undefined") {
        setPageCtx({
          path: pathname ?? window.location.pathname,
          source: detail?.source,
          section: detail?.section,
          scrollY: window.scrollY,
        });
      }
    };

    const handler = (e: Event) => {
      const ce = e as CustomEvent<OpenEventDetail>;
      openFromDetail(ce.detail);
    };

    window.addEventListener("ai-widget:open", handler as EventListener);
    (window as any).__aiWidgetOpen = openFromDetail;

    return () => {
      window.removeEventListener("ai-widget:open", handler as EventListener);
      try {
        delete (window as any).__aiWidgetOpen;
      } catch {
        // ignore
      }
    };
  }, [pathname]);

  if (!mounted || hidden) return null;

  const contents = (
    <div
      className="fixed z-[70] flex flex-col items-end gap-2"
      style={{
        right:
          "calc(env(safe-area-inset-right, 0px) + 1rem)",
        bottom:
          "calc(env(safe-area-inset-bottom, 0px) + var(--ai-widget-bottom-offset, 1.25rem))",
      }}
      aria-live="polite"
    >
      {/* Chat panel: keep mounted so state persists; allow internal scroll */}
      <div
        className={`flex flex-col rounded-2xl border border-slate-800/20 bg-white/95 backdrop-blur shadow-2xl shadow-slate-900/20 w-[min(92vw,22rem)] max-h-[75vh] transition-all duration-150 ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-1 scale-[0.98] pointer-events-none"
        }`}
        style={{ height: open ? 'min(26rem,75vh)' : 'min(22rem,75vh)' }}
        aria-hidden={!open}
      >
          {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50 bg-slate-900/95 text-slate-50">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-medium tracking-tight">AI Kitchen</span>
              <span className="text-[10px] text-slate-300">
                Chef · Nutrition · Planner
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-600/70 text-slate-50 hover:bg-slate-800"
            aria-label="Minimise AI chat"
          >
            –
          </button>
        </div>

        {/* Chat body */}
        <div className="flex-1 min-h-0 bg-slate-50/80 p-2 overflow-hidden">
          <AIChat
            className="h-full"
            fitContainer
            greetingText="I’ll keep it simple. Ask about swaps, time, scaling or nutrition and I’ll adapt the recipes around you."
            sessionKey="widget"
            recipeSlug={recipeSlug}
            initialQuestion={initialQ}
            autoStart={!!initialQ}
            pageContext={pageCtx}
          />
        </div>
      </div>

      {/* Launcher button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 h-10 text-xs font-semibold shadow-2xl shadow-slate-900/30 hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          aria-label="Open AI Kitchen chat"
          aria-expanded={open}
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px]">
            💬
          </span>
          <span>Ask the AI</span>
        </button>
      )}
    </div>
  );

  return createPortal(contents, document.body);
}
