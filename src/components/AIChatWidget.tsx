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
      className="fixed right-3 bottom-3 md:right-6 md:bottom-6 z-[70] flex flex-col items-end gap-2"
      aria-live="polite"
    >
      {/* Chat panel */}
      {open && (
        <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-2xl w-[min(92vw,22rem)] h-[60vh] md:w-[22rem] md:h-[28rem] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="text-xs font-medium text-slate-700">AI Kitchen</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
              aria-label="Minimise"
            >
              ×
            </button>
          </div>
          <div className="flex-1 p-2">
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
      )}

      {/* Launcher button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white h-11 w-11 shadow-2xl shadow-slate-900/30 text-lg hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          aria-label="Open AI Kitchen chat"
          aria-expanded={open}
        >
          💬
        </button>
      )}
    </div>
  );

  return createPortal(contents, document.body);
}
