"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { recipes } from "../data/recipes";
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

export type AIChatProps = {
  recipeSlug?: string | null;
  initialAgent?: AgentId;
  initialQuestion?: string;
  autoStart?: boolean;
  className?: string;
  fitContainer?: boolean; // When true, fills parent and makes chat window flexible
  greetingText?: string; // Override initial greeting text
  sessionKey?: string; // Persist chat per session key so multiple chats stay separate
  pageContext?: {
    path?: string;
    source?: string;
    section?: string;
    scrollY?: number;
  };
};

export function AIChat({
  recipeSlug,
  initialAgent = "chef",
  initialQuestion,
  autoStart,
  className,
  fitContainer,
  greetingText,
  sessionKey,
  pageContext,
}: AIChatProps) {
  const [input, setInput] = useState<string>(initialQuestion ?? "");
  const [isSending, setIsSending] = useState(false);
  const [agent, setAgent] = useState<AgentId>(initialAgent);
  const defaultWelcome: ChatMessage = {
    id: "welcome",
    author: "ai",
    text:
      greetingText ??
      "I’ll keep it simple. Ask about swaps, time, scaling or nutrition and I’ll adapt the recipes around you.",
    animate: true,
  };
  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcome]);
  const [showGate, setShowGate] = useState(false);

  // Track last auto-start question so we can trigger multiple times
  const lastAutoQRef = useRef<string | null>(null);

  // Load/persist per-session history so chats are separate and sticky
  useEffect(() => {
    if (!sessionKey) return;
    try {
      const raw = localStorage.getItem(`ai_chat_${sessionKey}`);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey]);

  useEffect(() => {
    if (!sessionKey) return;
    try {
      const toStore = JSON.stringify(messages.slice(-100));
      localStorage.setItem(`ai_chat_${sessionKey}`, toStore);
    } catch {}
  }, [messages, sessionKey]);

  const selectedRecipe = useMemo(
    () => recipes.find((r) => r.slug === recipeSlug),
    [recipeSlug]
  );

  const highlightKeywords = useMemo(() => {
    if (!selectedRecipe) return [] as string[];
    const fromTags = (selectedRecipe.tags ?? []).slice(0, 3);
    const fromIngredients = (selectedRecipe.ingredients ?? [])
      .slice(0, 10)
      .flatMap((line) =>
        line
          .toLowerCase()
          .split(/[^a-z]+/i)
          .filter((t) => t.length >= 4)
      );
    const common = new Set([
      "fresh",
      "dried",
      "small",
      "large",
      "chopped",
      "powder",
      "sauce",
      "olive",
      "light",
      "extra",
      "tablespoon",
      "teaspoon",
      "minute",
      "minutes",
      "water",
      "salt",
      "pepper",
    ]);
    const uniq = Array.from(new Set([...fromTags, ...fromIngredients]))
      .filter((t) => !common.has(t))
      .slice(0, 6);
    return uniq;
  }, [selectedRecipe]);

  useEffect(() => {
    if (!autoStart) return;
    const q = (initialQuestion ?? "").trim();
    if (!q) return;
    if (lastAutoQRef.current === q) return;
    lastAutoQRef.current = q;
    void sendMessage(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, initialQuestion]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      author: "user",
      text: trimmed,
    };
    // Capture history to now (before appending the new message)
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
          agent,
          history,
          pageContext,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        author: "ai",
        text: "New chat. What are you making, or what’s missing?",
        animate: true,
      },
    ]);
  };

  const containerClasses = fitContainer ? `h-full flex flex-col ${className ?? ""}` : className ?? "";
  const chatWindowClasses = fitContainer
    ? "rounded-2xl border border-slate-200 bg-white flex flex-col flex-1 min-h-0"
    : "rounded-2xl border border-slate-200 bg-white flex flex-col h-[480px] md:h-[560px]";

  return (
    <section className={containerClasses}>
      {showGate && (
        <SignupGate open={showGate} onClose={() => setShowGate(false)} onVerified={() => setShowGate(false)} />
      )}
      {/* Agent toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="hidden sm:inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 text-xs">
          {([
            ["chef", "Chef"],
            ["nutrition", "Nutrition"],
            ["planner", "Meal planner"],
          ] as [AgentId, string][]).map(([id, label]) => (
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
          className="hidden sm:inline text-[11px] text-slate-500 hover:text-slate-900 underline underline-offset-2"
        >
          Clear chat
        </button>
      </div>

      <p className="hidden sm:block text-[11px] text-slate-500 mb-2">
        <span className="font-medium">{agentLabels[agent]} mode:</span>{" "}
        {agentTaglines[agent]}
      </p>

      {/* Chat window */}
      <div className={chatWindowClasses}>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
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
                  <TypewriterMarkdown
                    text={msg.text}
                    animate={msg.animate}
                    keywords={highlightKeywords}
                  />
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
                const el = e.target; el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,160)+'px';
              }}
              rows={1}
              className="flex-1 resize-none rounded-full border border-slate-300 bg-slate-50 px-3 py-[10px] text-sm text-slate-900 placeholder:text-slate-400 leading-snug focus:outline-none focus:ring-2 focus:ring-slate-500 h-[42px]"
              placeholder={ selectedRecipe ? `Ask about ${selectedRecipe.title}…` : "Ask the AI anything…" }
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
            General cooking & nutrition guidance only – not medical or clinical advice.
          </p>
        </form>
      </div>
    </section>
  );
}

function TypewriterMarkdown({
  text,
  animate,
  keywords,
}: {
  text: string;
  animate?: boolean;
  keywords?: string[];
}) {
  const stylizeText = (input: string) => {
    let out = input;
    // Temperatures like 200C, 200°C, 180 c
    out = out.replace(/\b(\d{2,3})\s?°?\s?[Cc]\b/g, (m) => `\`${m}\``);
    // Times like 20 min, 25 minutes, 1 minute
    out = out.replace(/\b(\d{1,3})\s?(minutes|min|mins)\b/gi, (m) => `\`${m}\``);
    // Highlight up to two keywords strongly
    if (keywords && keywords.length) {
      let used = 0;
      for (const k of keywords) {
        if (used >= 2) break;
        const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`\\b(${escapeRegex(k)})\\b`, "gi");
        if (re.test(out)) {
          out = out.replace(re, "**$1**");
          used++;
        }
      }
    }
    return out;
  };

  const prepared = useMemo(() => stylizeText(text), [text, stylizeText, JSON.stringify(keywords)]);
  const [display, setDisplay] = useState(animate ? "" : prepared);

  useEffect(() => {
    if (!animate) return;
    let i = 0;
    const cps = 1;
    const interval = setInterval(() => {
      i += cps;
      setDisplay(prepared.slice(0, i));
      if (i >= prepared.length) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [prepared, animate]);

  return (
    <div className="ai-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{display}</ReactMarkdown>
    </div>
  );
}
