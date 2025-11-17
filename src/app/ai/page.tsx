"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { recipes } from "../../data/recipes";

type Author = "user" | "ai";

type ChatMessage = {
  id: string;
  author: Author;
  text: string;
};

export default function AiKitchenPage() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("q") || "";
  const recipeSlug = searchParams.get("recipe");

  const [input, setInput] = useState(initialQuestion);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      author: "ai",
      text:
        "Hey, I’m Giuseppe’s AI kitchen helper. Ask me how to adapt his recipes to what you’ve actually got: missing ingredients, swaps, lighter versions, extra portions, all that.",
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
      // Placeholder API call – you’ll implement /api/kitchen-ai separately.
      const res = await fetch("/api/kitchen-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          recipeSlug: selectedRecipe?.slug ?? null,
        }),
      });

      let aiText =
        "I’m still being wired up behind the scenes – this is a placeholder response. Soon I’ll adapt Giuseppe’s recipes around your ingredients, time and preferences.";

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.reply && typeof data.reply === "string") {
          aiText = data.reply;
        }
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        author: "ai",
        text: aiText,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const aiMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        author: "ai",
        text:
          "Something went wrong sending that to the AI. Check your connection and try again, or ask again in a second.",
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
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold">
            AI kitchen helper
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-xl">
            Ask me how to use Giuseppe’s recipes in real life – missing
            ingredients, swaps, making it lighter or heavier, scaling up for
            guests, or building a simple plan around what you’ve got.
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
                  {msg.text}
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
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                className="flex-1 resize-none rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
                placeholder={
                  selectedRecipe
                    ? `Ask about ${selectedRecipe.title}…`
                    : "Ask anything about Giuseppe’s recipes…"
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
              This is general cooking guidance, not medical or clinical nutrition
              advice.
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
              tomatoes, 25 minutes, what can I make from your recipes?&quot;
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
            The AI only has access to Giuseppe&apos;s recipes, not the whole
            internet.
          </p>
        </div>
      </aside>
    </div>
  );
}
