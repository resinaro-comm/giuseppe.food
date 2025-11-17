"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSearchParams } from "next/navigation";
import { recipes } from "../../data/recipes";

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
    "Batching, leftovers and turning Giuseppe’s dishes into simple plans for a few days.",
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
        "## AI kitchen\n\nI’ll keep it simple and to the point. Ask about swaps, time, or scaling and I’ll adapt Giuseppe’s recipes around you.\n\nWhat are you cooking or stuck on?",
      animate: true,
    },
  ]);

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
        }),
      });

      const data = res.ok ? await res.json().catch(() => null) : null;

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

  const quickPrompts = [
    "I forgot to buy garlic, what can I do instead?",
    "I don't like mushrooms, how can I change this recipe?",
    "Make this lighter but still filling.",
    "Adapt this to serve 5 people instead of 2.",
    "I only have 20 minutes – what’s the closest recipe to this that I can make?",
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
      {/* Left: chat */}
      <section className="space-y-4">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-semibold">
                AI kitchen helper
              </h1>
              <p className="text-sm md:text-base text-slate-600 max-w-xl">
                Ask me how to use Giuseppe’s recipes in real life – missing
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
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                className="flex-1 resize-none rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
                placeholder={
                  selectedRecipe
                    ? `Ask about ${selectedRecipe.title}…`
                    : "Ask the AI kitchen assistant anything…"
                }
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium text-white bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed hover:bg-slate-800 transition"
              >
                {isSending ? "Sending…" : "Send"}
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
                  From Giuseppe&apos;s socials. The AI will try to keep you as
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

        {/* Quick prompts */}
        <div className="rounded-2xl border border-slate-200 bg-slate-900 text-slate-50 p-5 space-y-3">
          <h2 className="text-sm font-semibold">Quick ideas</h2>
          <p className="text-xs text-slate-300">
            Tap one to drop it into the chat box, then tweak it to match what
            you&apos;ve got.
          </p>
          <div className="flex flex-col gap-2">
            {quickPrompts.map((qp) => (
              <button
                key={qp}
                type="button"
                onClick={() => handleQuickPrompt(qp)}
                className="text-left text-xs rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 hover:bg-slate-800 transition"
              >
                {qp}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 pt-1">
            The AI knows Giuseppe&apos;s recipes and general cooking knowledge,
            not your medical history.
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
