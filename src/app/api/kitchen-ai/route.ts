// src/app/api/kitchen-ai/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { recipes } from "../../../data/recipes";
import { getClientIp } from "../../../server/ip";
import {
  checkLimit,
  isBanned,
  recordViolation,
  banIp,
} from "../../../server/rate-limit";
import {
  buildKitchenSystemPrompt,
  type AgentId,
  type PageContext,
} from "../../../server/kitchen-prompt";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ensure Node runtime for compatibility with the OpenAI SDK in dev
export const runtime = "nodejs";

type HistoryMessage = {
  role: string;
  content: string;
};

type KitchenAiRequestBody = {
  message: string;
  history?: HistoryMessage[];
  recipeSlug?: string | null;
  agent?: AgentId;
  pageContext?: PageContext;
};

export async function POST(req: NextRequest) {
  try {
    // IP checks and per-IP rate limits
    const ip = getClientIp(req);
    if (await isBanned(ip)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft paywall/gate: allow up to 5–7 AI replies per day unless verified
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

    const body = (await req.json().catch(() => null)) as
      | KitchenAiRequestBody
      | null;

    if (!body || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const userMessage = body.message;

    const history = Array.isArray(body.history)
      ? body.history.filter(
          (m) => typeof m?.role === "string" && typeof m?.content === "string"
        )
      : [];

    const recipeSlug =
      typeof body.recipeSlug === "string" ? body.recipeSlug : null;

    const pageContext: PageContext | undefined =
      typeof body.pageContext === "object" && body.pageContext !== null
        ? body.pageContext
        : undefined;

    const agent: AgentId =
      body.agent === "nutrition" || body.agent === "planner"
        ? body.agent
        : "chef"; // default to chef mode

    const recipe = recipeSlug
      ? recipes.find((r) => r.slug === recipeSlug)
      : null;

    // Friendly local-dev fallback: if no API key, return a mock reply so UI
    // formatting and the typewriter effect can be tested without credentials.
    if (!process.env.OPENAI_API_KEY) {
      const mock = `Here’s how I’d keep it short and useful: ${
        recipe ? `${recipe.title}: ` : ""
      }"${userMessage}" — I’d give you 1–2 solid options and the key step to do next. Want me to be more detailed or keep it brief?`;
      return NextResponse.json({ reply: mock }, { status: 200 });
    }

    const systemPrompt = buildKitchenSystemPrompt({
      agent,
      recipe: recipe ?? null,
      pageContext,
    });

    const messagesPayload = [
      { role: "system" as const, content: systemPrompt },
      ...history.slice(-20).map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })),
      { role: "user" as const, content: userMessage },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messagesPayload,
      temperature: agent === "chef" ? 0.7 : 0.6, // slightly toned-down for tighter replies
      max_tokens: 220,
    });

    let reply =
      completion.choices[0]?.message?.content?.trim() ??
      "I couldn't generate a response just now. Try asking again in a moment.";

    // Post-process to fix any bare /<slug> into /recipes/<slug> and encourage clickable links
    try {
      const slugs = recipes.map((r) => r.slug).join("|");

      if (slugs) {
        const re = new RegExp(
          `(^|[^/])\\/(${slugs})(?=[^a-z0-9-]|$)`,
          "gi"
        );
        reply = reply.replace(re, (_m, p1, p2) => `${p1}/recipes/${p2}`);

        // Clean any accidental double replacement
        reply = reply.replace(/\/recipes\/recipes\//g, "/recipes/");

        // Wrap bare /recipes/<slug> in Markdown so it's clickable
        const bare = new RegExp(
          `(^|\\s)(\\/recipes\\/(?:${slugs}))(?=\\s|[\\.,;!?\\)]|$)`,
          "gi"
        );
        reply = reply.replace(bare, (_m, p1, p2) => `${p1}[${p2}](${p2})`);
      }
    } catch {
      // If post-processing fails, just return the raw reply
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("kitchen-ai error", err);
    return NextResponse.json(
      { error: "Something went wrong talking to the AI." },
      { status: 500 }
    );
  }
}
