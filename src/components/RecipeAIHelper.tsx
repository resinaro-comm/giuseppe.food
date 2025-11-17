"use client";

import { useEffect, useRef, useState } from "react";
import { AIChat } from "@components/AIChat";

type Props = {
  slug: string;
  recipeTitle: string;
};

export function RecipeAIHelper({ slug, recipeTitle }: Props) {
  const [question, setQuestion] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [initialQ, setInitialQ] = useState<string | undefined>(undefined);
  const chatRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "I forgot to buy garlic, what can I do instead?",
    "I don't like mushrooms, how can I change this recipe?",
    "Make this lighter but still filling.",
    "Adapt this to serve 5 people instead of 2.",
  ];

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    setInitialQ(trimmed);
    setShowChat(true);
  };

  useEffect(() => {
    if (showChat && chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showChat]);

  return (
    <div className="space-y-6">
      {/* Helper card */}
      <div className="rounded-2xl border border-slate-900/10 bg-slate-900 text-slate-50 p-5 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Ask the AI about this</h2>
          <p className="text-xs text-slate-300">
            Tell it what you forgot to buy, what you don't like, or how much time you actually have. The AI only knows my recipes and will try to adapt this one around you.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder='e.g. "I forgot to buy garlic, what can I do?"'
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-900 hover:bg-slate-100 transition"
          >
            Ask the AI
          </button>
        </form>

        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Quick ideas</p>
          <ul className="space-y-1 text-xs text-slate-200">
            {quickPrompts.map((qp) => (
              <li key={qp}>
                <button
                  type="button"
                  className="underline underline-offset-2 decoration-slate-500 hover:text-white"
                  onClick={() => setQuestion(qp)}
                >
                  • {qp}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-slate-400 pt-1">
            The AI is for general cooking guidance only, not medical or clinical nutrition advice.
          </p>
        </div>
      </div>

      {/* Inline chat appears below (mobile and desktop) */}
      {showChat && (
        <div ref={chatRef}>
          <AIChat
            className=""
            recipeSlug={slug}
            initialQuestion={initialQ}
            autoStart
          />
        </div>
      )}
    </div>
  );
}
