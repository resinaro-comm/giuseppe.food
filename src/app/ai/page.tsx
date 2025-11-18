"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSearchParams } from "next/navigation";
import { recipes } from "../../data/recipes";
import { SignupGate } from "@components/SignupGate";

type Author = "user" | "ai";
type AgentId = "chef" | "nutrition" | "planner";

type ChatMessage = {
  id: string;
  author: Author;
  text: string;
  animate?: boolean;
};

const agentLabels: Record<AgentId, string> = {
  chef: "Chef",
  nutrition: "Nutrition",
  planner: "Meal planner",
};

const agentTaglines: Record<AgentId, string> = {
  chef: "Flavour, technique & swaps that still taste like the original cuisine.",
  nutrition:
    "Higher protein, lighter/heavier options, more balanced plates – no medical advice.",
  planner:
    "Batching, leftovers and turning these dishes into simple plans for a few days.",
};

export default function AiKitchenPage() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("q") || "";
  const recipeSlug = searchParams.get("recipe");

  const [input, setInput] = useState(initialQuestion);
  const [isSending, setIsSending] = useState(false);
  const [agent, setAgent] = useState<AgentId>("chef");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      author: "ai",
      text:
        "I’ll keep it simple. Ask about swaps, time, or scaling and I’ll adapt the recipes around you.\n\nWhat are you cooking or stuck on?",
      animate: true,
    },
  ]);
  const [showGate, setShowGate] = useState(false);

  const selectedRecipe = useMemo(
    () => recipes.find((r) => r.slug === recipeSlug),
    [recipeSlug]
  );

  useEffect(() => {
    if (initialQuestion) {
      setInput(initialQuestion);
    }
  }, [initialQuestion]);

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        author: "ai",
        text:
          "New chat. Keep it simple. What are you making, or what’s missing?",
        animate: true,
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      author: "user",
      text: trimmed,
    };

    // Capture history up to now (before adding the new user message)
    const history = messages.map((m) => ({
      role: m.author === "user" ? "user" : "assistant",
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/kitchen-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          recipeSlug: selectedRecipe?.slug ?? null,
          agent, // this lets the API know which "mode" to use
          history,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 429 && (data?.requireSignup || data?.error === "signup_required")) {
          setShowGate(true);
          setIsSending(false);
          return;
        }
        throw new Error(data?.error || "The AI service returned an error. Please retry in a moment.");
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        author: "ai",
        text:
          data?.reply && typeof data.reply === "string"
            ? data.reply
            : res.ok
            ? "I couldn't generate a proper answer. Try again."
            : "The AI service returned an error. Please retry in a moment.",
        animate: true,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const aiMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        author: "ai",
        text:
          "Network or server error. Check your connection / API key and try again shortly.",
        animate: true,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Build dynamic quick prompts (swap, scale, time, flavor, leftovers)
  const quickPrompts = useMemo(() => {
    const generic = [
      "Only chicken thighs, pasta, tinned tomatoes & 20 min – what can I make?",
      "No oven today – which recipe adapts well to stove only?",
      "Scale a dish for 6 without wrecking seasoning?",
      "Turn leftovers into a next-day pasta or wrap?",
      "Make a lighter version that still tastes proper?",
    ];
    if (!selectedRecipe) return generic.slice(0, 5);
    const ing = (selectedRecipe.ingredients || [])
      .map((i) => i.toLowerCase())
      .filter(
        (i) =>
          !/salt|pepper|water|oil|olive|butter|season|spice|herb|sugar|flour|egg|baking|powder|fresh/i.test(
            i
          )
      );
    const uniqIng = Array.from(new Set(ing)).slice(0, 6);
    const base: string[] = [];
    if (uniqIng[0]) base.push(`No ${uniqIng[0]} – swap that keeps flavour?`);
    if (uniqIng[1]) base.push(`Can't find ${uniqIng[1]} – closest alternative?`);
    base.push("Make this lighter but still satisfying.");
    base.push("Serve 5 instead of 2 – scaling + pan size?");
    if (selectedRecipe.timeMinutes) {
      const t = selectedRecipe.timeMinutes;
      const crunch = t <= 25 ? Math.max(12, Math.round(t * 0.6)) : 20;
      base.push(`Only ${crunch} min – shortcut steps?`);
    } else {
      base.push("Only 20 min – fastest similar recipe?");
    }
    base.push("Leftovers ideas / next meal?");
    // Shuffle lightly for variation
    const shuffled = [...base].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  }, [selectedRecipe]);

  const [qpSet, setQpSet] = useState<string[]>(quickPrompts);
  useEffect(() => setQpSet(quickPrompts), [quickPrompts]);
  const refreshQuickPrompts = () => {
    // Force rebuild by randomizing order again
    setQpSet((prev) => [...prev].sort(() => Math.random() - 0.5));
  };
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
      {showGate && (
        <SignupGate
          open={showGate}
          onClose={() => setShowGate(false)}
          onVerified={() => setShowGate(false)}
        />
      )}
      {/* Left: chat */}
      <section className="space-y-4">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-semibold">
                AI kitchen helper
              </h1>
              <p className="text-sm md:text-base text-slate-600 max-w-xl">
                Ask me how to use these recipes in real life – missing
                ingredients, swaps, lighter or heavier versions, scaling for
                guests, or planning a few meals ahead.
              </p>
            </div>
          </div>

          {/* Agent toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 text-xs">
              {(
                [
                  ["chef", "Chef"],
                  ["nutrition", "Nutrition"],
                  ["planner", "Meal planner"],
                ] as [AgentId, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAgent(id)}
                  className={`px-3 py-1 rounded-full transition ${
                    agent === id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-slate-500 hover:text-slate-900 underline underline-offset-2"
            >
              Clear chat
            </button>
          </div>

          <p className="text-[11px] text-slate-500 max-w-xl">
            <span className="font-medium">{agentLabels[agent]} mode:</span>{" "}
            {agentTaglines[agent]}
          </p>
        </header>

        {/* Chat window */}
        <div className="rounded-2xl border border-slate-200 bg-white flex flex-col h-[480px] md:h-[560px]">
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.author === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={
                    msg.author === "user"
                      ? "max-w-[76%] rounded-2xl rounded-br-sm bg-slate-900 text-slate-50 px-4 py-2.5 text-sm"
                      : "max-w-[76%] rounded-2xl rounded-bl-sm bg-slate-100 text-slate-900 px-4 py-2.5 text-sm"
                  }
                >
                    {msg.author === "ai" ? (
                      <TypewriterMarkdown text={msg.text} animate={msg.animate} />
                    ) : (
                      msg.text
                    )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  const el = e.target;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
                }}
                rows={1}
                className="flex-1 resize-none rounded-full border border-slate-300 bg-slate-50 px-3 py-[10px] text-sm text-slate-900 placeholder:text-slate-400 leading-snug focus:outline-none focus:ring-2 focus:ring-slate-500 h-[42px]"
                placeholder={selectedRecipe ? `Ask about ${selectedRecipe.title}…` : "Ask the AI anything…"}
                style={{height:'42px', overflow:'hidden'}}
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="inline-flex items-center justify-center rounded-full px-5 h-[42px] text-xs font-medium text-white bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed hover:bg-slate-800 transition"
              >
                {isSending ? "…" : "Send"}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              General cooking &amp; nutrition guidance only – not medical or
              clinical advice.
            </p>
          </form>
        </div>
      </section>

      {/* Right: recipe context + quick prompts */}
      <aside className="space-y-6">
        {/* Recipe context */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Recipe context
          </h2>
          {selectedRecipe ? (
            <>
              <div className="space-y-1">
                <p className="text-sm font-medium">{selectedRecipe.title}</p>
                <p className="text-xs text-slate-500">
                  From social video. The AI will try to keep you as
                  close to this recipe as possible while adapting around you.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {selectedRecipe.timeMinutes && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    {selectedRecipe.timeMinutes} min
                  </span>
                )}
                {selectedRecipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-600">
                You can change recipe by opening a different one on the Recipes
                page and hitting &quot;Ask the AI&quot; from there.
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-600">
              No specific recipe selected. You can still ask general questions
              like &quot;I&apos;ve only got chicken thighs, pasta and tinned
              tomatoes, 25 minutes – what can I make from your recipes?&quot;
            </p>
          )}
        </div>

        {/* Quick prompts (upgraded) */}
        <div className="rounded-2xl border border-slate-200 bg-slate-900 text-slate-50 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">Quick ideas</h2>
              <p className="text-[11px] text-slate-300 leading-relaxed max-w-xs">
                Substitutions, speed, scaling, leftovers. Tap to drop it in – then tweak it to match what you actually have.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshQuickPrompts}
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800/60 h-8 w-8 text-[11px] hover:bg-slate-700 transition"
              aria-label="Shuffle suggestions"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 4h5l2 3-2 3H4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 4h-5l-2 3 2 3h5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 20h5l8-12h5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="grid gap-2">
            {qpSet.map((qp) => (
              <button
                key={qp}
                type="button"
                onClick={() => handleQuickPrompt(qp)}
                className="group relative text-left rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2.5 text-[11.5px] leading-snug hover:border-slate-600 hover:bg-slate-800 transition shadow-sm"
              >
                <span className="block pr-4 text-slate-200 group-hover:text-white">{qp}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 pt-1">
            General cooking knowledge only – not medical advice.
          </p>
        </div>
      </aside>
    </div>
  );
}

function TypewriterMarkdown({
  text,
  animate,
}: {
  text: string;
  animate?: boolean;
}) {
  const [display, setDisplay] = useState(animate ? "" : text);

  useEffect(() => {
    if (!animate) return;
    let i = 0;
    const cps = 1; // slightly slower, calm vibe
    const interval = setInterval(() => {
      i += cps;
      setDisplay(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [text, animate]);

  return (
    <div className="ai-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{display}</ReactMarkdown>
    </div>
  );
}
