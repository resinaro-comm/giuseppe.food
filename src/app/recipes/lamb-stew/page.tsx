// src/app/recipes/lamb-stew/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { recipes } from "../../../data/recipes";
import { Reveal } from "@components/Reveal";

const RECIPE_SLUG = "lamb-stew";

const recipe = recipes.find((r) => r.slug === RECIPE_SLUG);

if (!recipe) {
  throw new Error(`Recipe with slug "${RECIPE_SLUG}" not found in recipes.ts`);
}

export const metadata: Metadata = {
  title: `${recipe.title} – giuseppe.food`,
  description:
    "Slow-simmered lamb stew with soft onions, rich stock and proper depth of flavour.",
  openGraph: {
    title: `${recipe.title} – giuseppe.food`,
    description:
      "Slow-simmered lamb stew with soft onions, rich stock and proper depth of flavour.",
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

export default function LambStewPage() {
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
    recipeCuisine: "Comfort food",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />

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
                This is a low-and-slow pot of lamb, onions, stock and tomatoes.
                You brown it, deglaze it, then let time pull the flavour
                together.
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
                Cooking for more people, using a slow cooker or switching to
                beef? Ask the AI and it&apos;ll rework the timings and amounts.
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
                    Slow lamb stew
                  </p>
                  <p className="text-xs text-slate-600">
                    Think soft lamb, rich gravy and a bowl that basically
                    demands bread or mash on the side.
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
                Use shoulder or any stewing cut – anything that likes a long,
                gentle cook.
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
                Let it simmer gently. If it&apos;s boiling hard, turn the heat
                down and give it more time. The AI can help you adjust liquid if
                it looks too thick or too thin.
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
                A heavy pot is your best friend here, but use whatever you
                already have. This is just comfort food, not restaurant kit.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <GearCard
                title="Heavy casserole / Dutch oven"
                body="Keeps the heat steady and gives you a deep, even simmer."
                query="cast iron dutch oven casserole pot"
              />
              <GearCard
                title="Ladle"
                body="Handy for skimming fat and serving without spills."
                query="stainless steel soup ladle"
              />
              <GearCard
                title="Sturdy wooden spoon"
                body="Good for scraping the tasty browned bits off the bottom."
                query="wooden spoon cooking set"
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
                  Can I cook this in a slow cooker?
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  Yes. Brown the lamb and onions first, then move everything to
                  the slow cooker with stock and tomatoes. Ask the AI to convert
                  this to a slow-cooker version with timings for your setting.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                <p className="font-medium text-slate-900">
                  What do I serve it with?
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  Mash, rice, couscous, bread – they all work. If you want a
                  full plate idea (veg, sides, portions), the AI can build one
                  for you.
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
                In the mood for something faster after this? There are plenty of
                quick recipes on the main page.
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
