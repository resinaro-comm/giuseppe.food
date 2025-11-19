"use client";

import { useMemo, useState } from "react";
import { recipes } from "@components/../data/recipes";

type Props = {
  slug: string;
  recipeTitle: string;
};

export function RecipeAIHelper({ slug, recipeTitle }: Props) {
  const [question, setQuestion] = useState("");

  // Look up the full recipe to tailor prompts
  const recipe = useMemo(() => recipes.find((r) => r.slug === slug), [slug]);
  const keyIngredients = useMemo(() => {
    const src = (recipe?.ingredients ?? [])
      .map((i) => i.toLowerCase())
      .filter((i) => !/salt|pepper|water|oil|olive|butter|herb|spice|season|sugar|flour|egg/i.test(i));
    return Array.from(new Set(src)).slice(0, 4);
  }, [recipe]);

  const quickPrompts = useMemo(() => {
    const t = recipeTitle;
    const ingA = keyIngredients[0];
    const ingB = keyIngredients[1];
    const time = recipe?.timeMinutes;
    const prompts: string[] = [];
    if (ingA) prompts.push(`No ${ingA} – swap?`);
    if (ingB) prompts.push(`${ingB} dislike – change?`);
    prompts.push("Lighter version?");
    prompts.push("Scale to 5?");
    if (typeof time === "number" && time > 0) {
      const target = Math.max(15, Math.min(45, time));
      prompts.push(`${target} min only – shortcut?`);
    }
    return prompts.slice(0, 5);
  }, [recipeTitle, keyIngredients, recipe]);

  const openWidget = (q: string) => {
    const trimmed = q.trim();
    const detail: { recipeSlug: string; question?: string; source?: string; section?: string } = { recipeSlug: slug };
    if (trimmed) detail.question = trimmed;
    detail.source = "recipe-helper";
    detail.section = "Got a question";
    try {
      (window as any).__aiWidgetOpen?.(detail);
    } catch {}
    window.dispatchEvent(new CustomEvent("ai-widget:open", { detail }));
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    openWidget(question);
    // Leave the question in the input for user to adjust later if they reopen the helper
  };

  return (
    <div className="space-y-6">
      {/* Helper card */}
      <div className="relative z-30 pointer-events-auto rounded-2xl border border-slate-900/10 bg-slate-900 text-slate-50 p-5 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Got a question?</h2>
          <p className="text-xs text-slate-300">
            Swaps, time, scaling for {recipeTitle}. Keep it simple.
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Quick ideas</p>
          <ul className="space-y-1 text-xs text-slate-200">
            {quickPrompts.map((qp) => (
              <li key={qp}>
                <button
                  type="button"
                  className="underline underline-offset-2 decoration-slate-500 hover:text-white"
                  onClick={() => {
                    setQuestion(qp);
                    const detail = { recipeSlug: slug, question: qp, source: "recipe-helper", section: "Quick ideas" } as const;
                    try { (window as any).__aiWidgetOpen?.(detail as any); } catch {}
                    window.dispatchEvent(new CustomEvent("ai-widget:open", { detail }));
                  }}
                >
                  • {qp}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => openWidget(question)}
            className="mt-3 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-900 hover:bg-slate-100 transition"
          >
            Ask the AI
          </button>
          <p className="text-[10px] text-slate-400 pt-1">
            General cooking guidance only – not medical or clinical nutrition advice.
          </p>
        </div>
      </div>

      {/* Chat now happens in the floating widget so it persists across pages */}
    </div>
  );
}
