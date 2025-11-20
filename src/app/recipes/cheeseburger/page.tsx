// src/app/recipes/cheeseburger/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { recipes } from "../../../data/recipes";
import { Reveal } from "@components/Reveal";

const RECIPE_SLUG = "cheeseburger";

const recipe = recipes.find((r) => r.slug === RECIPE_SLUG);

if (!recipe) {
  throw new Error(`Recipe with slug "${RECIPE_SLUG}" not found in recipes.ts`);
}

export const metadata: Metadata = {
  title: `${recipe.title} – giuseppe.food`,
  description:
    "Smash-style cheeseburger with crisp edges, melted cheese and a soft bun.",
  openGraph: {
    title: `${recipe.title} – giuseppe.food`,
    description:
      "Smash-style cheeseburger with crisp edges, melted cheese and a soft bun.",
    type: "article",
    url: `https://giuseppe.food/recipes/${RECIPE_SLUG}`,
    images: recipe.thumbnail
      ? [
          {
            url: recipe.thumbnail,
            alt: recipe.title,
          },
        ]
      : undefined,
  },
};

function minutesToIsoDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return undefined;
  return `PT${Math.round(minutes)}M`;
}

export default function CheeseburgerPage() {
  if (!recipe) {
    notFound();
  }

  const totalTimeIso = minutesToIsoDuration(recipe.timeMinutes);

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.shortDescription,
    image: recipe.thumbnail
      ? [`https://giuseppe.food${recipe.thumbnail}`]
      : undefined,
    author: {
      "@type": "Person",
      name: "Giuseppe",
    },
    recipeCategory: "Main course",
    recipeCuisine: "Burger",
    totalTime: totalTimeIso,
    keywords: recipe.tags.join(", "),
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.steps.map((step) => ({
      "@type": "HowToStep",
      text: step,
    })),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://giuseppe.food/recipes/${RECIPE_SLUG}`,
    },
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />

      {/* Wire up the "Ask the AI" button */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              if (typeof window === 'undefined') return;
              window.addEventListener('click', function (event) {
                var target = event.target;
                if (!(target instanceof HTMLElement)) return;
                var btn = target.closest('[data-ai-open="${RECIPE_SLUG}"]');
                if (!btn) return;
                event.preventDefault();
                window.dispatchEvent(new CustomEvent('ai-widget:open', {
                  detail: { recipeSlug: '${RECIPE_SLUG}', source: 'recipe-page' }
                }));
              });
            })();
          `,
        }}
      />

      <div className="space-y-10 md:space-y-16">
        {/* HERO */}
        <section>
          <Reveal className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
            {/* Left */}
            <div className="space-y-5 text-center md:text-left">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Recipe
              </p>
              <h1 className="text-2xl md:text-4xl font-semibold leading-tight">
                {recipe.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[11px] text-slate-600">
                {typeof recipe.timeMinutes === "number" && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium">
                    {recipe.timeMinutes} min
                  </span>
                )}
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto md:mx-0">
                Thin, smashed patties with crispy edges, melted cheese and a
                soft bun. Simple to put together, big takeaway-level payoff.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  type="button"
                  data-ai-open={RECIPE_SLUG}
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Ask the AI to adapt this recipe
                </button>
                {recipe.instagramUrl && (
                  <a
                    href={recipe.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs md:text-sm font-medium border border-slate-300 text-slate-800 hover:bg-slate-100 transition"
                  >
                    Watch the video on Instagram
                    <span aria-hidden className="ml-1 text-[11px]">↗</span>
                  </a>
                )}
              </div>

              <p className="text-[11px] text-slate-500">
                Cooking for more people, different pan, air fryer fries on the
                side? Ask the AI and it&apos;ll line everything up for you.
              </p>
            </div>

            {/* Right: image */}
            <div className="max-w-md mx-auto w-full">
              <div className="group relative rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm overflow-hidden">
                <div className="relative w-full aspect-[4/3] bg-slate-100">
                  {recipe.thumbnail && (
                    <Image
                      src={recipe.thumbnail}
                      alt={recipe.title}
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Smash-style burger
                  </p>
                  <p className="text-xs text-slate-600">
                    High heat, quick cook, cheese melted straight on the patty
                    – that&apos;s the whole move.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* INGREDIENTS + STEPS */}
        <section>
          <Reveal className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)] items-start">
            {/* Ingredients */}
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl font-semibold">Ingredients</h2>
              <p className="text-xs text-slate-500">
                This is the base burger. The AI can help you add sauces, onions,
                bacon or anything else you like.
              </p>
              <ul className="space-y-1.5 text-sm text-slate-800">
                {recipe.ingredients.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[7px] h-[3px] w-[3px] rounded-full bg-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Method */}
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl font-semibold">Method</h2>
              <ol className="space-y-3 text-sm text-slate-800">
                {recipe.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold leading-none text-white">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
              <p className="text-[11px] text-slate-500">
                For smash burgers you want the pan hot and you don&apos;t move
                the patty much. If you&apos;re unsure on cooking times for your
                thickness, ask the AI to walk you through it.
              </p>
            </div>
          </Reveal>
        </section>

        {/* GEAR / AFFILIATES */}
        <section>
          <Reveal className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
              <h2 className="text-lg md:text-xl font-semibold">
                Gear that helps (optional)
              </h2>
              <p className="text-[11px] text-slate-500 max-w-md">
                You can make burgers in any pan. These just help get that nice
                crust and quick melt.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <GearCard
                title="Cast-iron or heavy pan"
                body="Holds heat well so you get crispy edges on the patties."
                query="cast iron skillet"
              />
              <GearCard
                title="Sturdy spatula"
                body="Helps you smash the patties flat and flip them cleanly."
                query="metal burger spatula"
              />
              <GearCard
                title="Instant-read thermometer"
                body="Optional, but handy if you want exact doneness every time."
                query="instant read meat thermometer"
              />
            </div>

            <p className="text-[10px] text-slate-400">
              These are Amazon affiliate links. If you buy through them, it
              might send a tiny bit back to support the recipes. Price is the
              same for you.
            </p>
          </Reveal>
        </section>

        {/* FAQ / TIPS */}
        <section>
          <Reveal className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold">
              Quick questions
            </h2>
            <div className="space-y-3 text-sm text-slate-800">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                <p className="font-medium text-slate-900">
                  What fat % beef should I use?
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  Around 20% fat is ideal for smash burgers. If your mince is
                  leaner, the AI can help you adjust cooking and toppings so it
                  still eats juicy.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                <p className="font-medium text-slate-900">
                  How do I toast the buns right?
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  Light butter in the same pan and a quick toast until golden.
                  Ask the AI to time it with your patties so everything is ready
                  together.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Back link */}
        <section>
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
              <p className="text-xs text-slate-500">
                Want more comfort food after this? There are pasta, chicken and
                slow-cook recipes on the main page.
              </p>
              <Link
                href="/recipes"
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium border border-slate-300 text-slate-800 hover:bg-slate-100 transition"
              >
                Back to all recipes
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}

type GearCardProps = {
  title: string;
  body: string;
  query?: string;
};

function GearCard({ title, body, query }: GearCardProps) {
  const searchTerm = query || title;
  const searchUrl = `https://www.amazon.co.uk/s?k=${encodeURIComponent(
    searchTerm
  )}&tag=resinaroamzn-21&linkCode=ll2&language=en_GB&ref_=as_li_ss_tl`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 flex flex-col justify-between">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-600">{body}</p>
      </div>
      <div className="mt-3">
        <a
          href={searchUrl}
          target="_blank"
          rel="noreferrer nofollow sponsored"
          className="inline-flex items-center text-[11px] font-medium text-sky-700 hover:text-sky-800 underline underline-offset-2"
        >
          View on Amazon
          <span aria-hidden className="ml-0.5 text-[10px]">↗</span>
        </a>
      </div>
    </div>
  );
}
