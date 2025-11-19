// src/app/api/kitchen-ai/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { recipes } from "../../../data/recipes";
import { NextResponse as _ } from "next/server"; // keep import to avoid unused removal in some bundlers
import { getClientIp } from "../../../server/ip";
import { checkLimit, isBanned, recordViolation, banIp } from "../../../server/rate-limit";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ensure Node runtime for compatibility with the OpenAI SDK in dev
export const runtime = "nodejs";

type AgentId = "chef" | "nutrition" | "planner";

// Core behaviour that all agents share
const BASE_SYSTEM_PROMPT = `
You are "Giuseppe's Kitchen AI", an expert cooking assistant.

General rules:
- You know Giuseppe's recipes very well and think like a professional chef who also understands home kitchens.
 Explain things clearly and concretely. Default to one tight paragraph: 3–6 short sentences, max ~100 words.
 If the user explicitly asks for more detail, you can add a second paragraph.
 Sound natural and human. Use contractions. Do not use headings like "Summary" or lists unless the user asks for them.
 Use LIGHT inline emphasis to keep it lively: bold 1–3 key words or phrases, italicise 1 short term you want to underscore, and wrap 1–2 short keywords in backticks if it helps them stand out. Do not overdo it.
- Offer only the 1–2 strongest options/swaps unless more are explicitly requested.
- If steps are requested, keep them compact (max 3 steps) and still conversational.
- NEVER give medical or clinical nutrition advice. You can talk about general nutrition only.
- Prefer metric units (g, ml) and simple spoons/cups where helpful.
- If something is unsafe (raw chicken, undercooked meat, bad food handling), warn the user and give a safer option.
Tone:
- Calm, relaxed, nonchalant. Minimal words. No hype or filler. No exclamation marks.
- Say only what’s necessary. Precise and practical.
- End with ONE short, relevant follow-up question only when it moves things forward.
- Do not say you are an AI or include boilerplate disclaimers.
`.trim();

function buildRecipeCatalog() {
  try {
    const lines: string[] = [];
    for (const r of recipes) {
      const time = typeof r.timeMinutes === "number" ? `${r.timeMinutes}m` : "?m";
      const tags = r.tags?.slice(0, 5).join(", ") ?? "";
      // Include first few ingredients to give the model signal without huge tokens
      const ingredients = (r.ingredients ?? []).slice(0, 5).join(", ");
      lines.push(`- ${r.title} (/recipes/${r.slug}) · ${time} · ${tags}${ingredients ? ` · ${ingredients}` : ""}`);
    }
    return lines.join("\n");
  } catch {
    return "";
  }
}

// Extra flavour per agent
const AGENT_PROMPTS: Record<AgentId, string> = {
  chef: `
You are in CHEF MODE.

Focus:
- Perfecting flavour, texture, and technique.
- Offering pro tips (browning, deglazing, heat control, resting meat, etc.).
- Suggesting smart substitutions that keep flavour close to the original cuisine.
Tone:
- Confident pro chef, but relaxed and encouraging.
`.trim(),

  nutrition: `
You are in NUTRITION MODE.

Focus:
- General nutrition quality of the dish (protein, fibre, fats, heaviness vs. lightness).
- Suggesting swaps to make things higher-protein, lighter, or more balanced.
- Explaining trade-offs in SIMPLE language (e.g. "this will be a bit higher in carbs, but lower in fat").
Important limits:
- Do NOT give any medical advice, diagnoses, or plans for health conditions.
- If the user mentions specific medical issues, tell them kindly to speak to a qualified professional.
`.trim(),

  planner: `
You are in MEAL PLANNER MODE.

Focus:
- Helping the user plan across multiple meals or days.
- Using Giuseppe's recipes as building blocks ("have this roast chicken tonight, use leftovers for ...").
- Scaling recipes up/down for different servings and batching.
- Suggesting sensible ordering of cooking steps to save time and washing up.
`.trim(),
};

export async function POST(req: NextRequest) {
  try {
    // IP checks and per-IP rate limits
    const ip = getClientIp(req);
    if (await isBanned(ip)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft paywall/gate: allow up to 5 AI replies per day unless verified
    const isVerified = req.cookies.get("ai_verified")?.value === "1";
    if (!isVerified) {
      const gate = await checkLimit(`gate:msgs:${ip}`, 7, 24 * 3600);
      if (!gate.allowed) {
        return NextResponse.json(
          { error: "signup_required", requireSignup: true },
          { status: 429 }
        );
      }
    }

    // Per-minute and per-day caps for the AI endpoint
    const minuteKey = `ai:pm:${ip}`;
    const minute = await checkLimit(minuteKey, 10, 60); // 10/min
    if (!minute.allowed) {
      const strikes = await recordViolation(ip, 600);
      if (strikes >= 3) await banIp(ip, 3600); // 1h ban after 3 bursts
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(minute.limit),
            "X-RateLimit-Remaining": String(minute.remaining),
            "X-RateLimit-Window": "60",
          },
        }
      );
    }

    const dayKey = `ai:pd:${ip}`;
    const day = await checkLimit(dayKey, 100, 24 * 3600); // 100/day
    if (!day.allowed) {
      await banIp(ip, 24 * 3600); // hard-ban 24h if they cross daily quota
      return new NextResponse(
        JSON.stringify({ error: "Daily quota reached" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(day.limit),
            "X-RateLimit-Remaining": String(day.remaining),
            "X-RateLimit-Window": String(24 * 3600),
          },
        }
      );
    }

  const body = await req.json().catch(() => null);

    if (!body || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const userMessage = body.message as string;
    const history = Array.isArray(body.history)
      ? (body.history as Array<{ role: string; content: string }>)
          .filter((m) => typeof m?.role === "string" && typeof m?.content === "string")
      : [];
    const recipeSlug =
      typeof body.recipeSlug === "string" ? body.recipeSlug : null;
    const pageContext = typeof body.pageContext === "object" && body.pageContext !== null ? body.pageContext as { path?: string; source?: string; section?: string; scrollY?: number } : undefined;
    const agent: AgentId =
      body.agent === "nutrition" || body.agent === "planner"
        ? body.agent
        : "chef"; // default to chef mode

    const recipe = recipeSlug ? recipes.find((r) => r.slug === recipeSlug) : null;

    // Friendly local-dev fallback: if no API key, return a mock reply so UI
    // formatting and the typewriter effect can be tested without credentials.
    if (!process.env.OPENAI_API_KEY) {
      const mock = `Here’s how I’d keep it short and useful: ${recipe ? `${recipe.title}: ` : ""}"${userMessage}" — I’d give you 1–2 solid options and the key step to do next. Want me to be more detailed or keep it brief?`;
      return NextResponse.json({ reply: mock }, { status: 200 });
    }

    const systemPrompt = `
${BASE_SYSTEM_PROMPT}

Active agent:
${AGENT_PROMPTS[agent]}

  LINKING & URLS:
  - When you mention a recipe that appears in the catalog below, always include a Markdown link to its page using the relative path: /recipes/<slug>.
  - Example: [Chicken Cutlets](/recipes/chicken-cutlets). If the user asks for a link, include the Markdown link and the bare URL.
  - Do not invent URLs. Only use slugs present in the catalog.

SITE RECIPE CATALOG (only answer using items listed here; do NOT invent recipes):
${buildRecipeCatalog()}

Current recipe context (if any):

${
  recipe
    ? `
TITLE: ${recipe.title}
TAGS: ${recipe.tags.join(", ")}
TIME: ${recipe.timeMinutes ?? "unknown"} minutes

INGREDIENTS:
${recipe.ingredients.map((i) => `- ${i}`).join("\n")}

STEPS:
${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
`
    : "No specific recipe was provided."
}

PAGE CONTEXT (use to tailor answers; don't restate unless helpful):
PATH: ${pageContext?.path ?? "unknown"}
SOURCE: ${pageContext?.source ?? "unknown"}
SECTION: ${pageContext?.section ?? "unknown"}
SCROLL_Y: ${typeof pageContext?.scrollY === 'number' ? String(pageContext?.scrollY) : "unknown"}
`.trim();

    const messagesPayload = [
      { role: "system" as const, content: systemPrompt },
      ...history
        .slice(-20)
        .map((m) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: m.content as string,
        })),
      { role: "user" as const, content: userMessage },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messagesPayload,
      temperature: agent === "chef" ? 0.7 : 0.6, // slightly toned-down for tighter replies
      max_tokens: 260,
    });

    let reply =
      completion.choices[0]?.message?.content?.trim() ??
      "I couldn't generate a response just now. Try asking again in a moment.";

    // Post-process to fix any bare /<slug> into /recipes/<slug> and encourage clickable links
    try {
      const slugs = recipes.map((r) => r.slug).join("|");
      if (slugs) {
        const re = new RegExp(`(^|[^/])\\/(${slugs})(?=[^a-z0-9-]|$)`, "gi");
        reply = reply.replace(re, (_m, p1, p2) => `${p1}/recipes/${p2}`);
        // Clean any accidental double replacement
        reply = reply.replace(/\/recipes\/recipes\//g, "/recipes/");

        // Wrap bare /recipes/<slug> in Markdown so it's clickable
        const bare = new RegExp(`(^|\\s)(\\/recipes\\/(?:${slugs}))(?=\\s|[\\.,;!\?\)]|$)`, "gi");
        reply = reply.replace(bare, (_m, p1, p2) => `${p1}[${p2}](${p2})`);
      }
    } catch {}

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("kitchen-ai error", err);
    return NextResponse.json(
      { error: "Something went wrong talking to the AI." },
      { status: 500 }
    );
  }
}
