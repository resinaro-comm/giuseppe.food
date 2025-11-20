// src/app/recipes/quick-rice-chicken/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { recipes } from "../../../data/recipes";
import { Reveal } from "@components/Reveal";

const RECIPE_SLUG = "quick-rice-chicken";

const recipe = recipes.find((r) => r.slug === RECIPE_SLUG);

if (!recipe) {
  throw new Error(`Recipe with slug "${RECIPE_SLUG}" not found in recipes.ts`);
}

export const metadata: Metadata = {
  title: `${recipe.title} – giuseppe.food`,
  description:
    "One-pan chicken and rice cooked in its own roasted pepper–tomato sauce. Crispy chicken on top, soft rice underneath.",
  openGraph: {
    title: `${recipe.title} – giuseppe.food`,
    description:
      "One-pan chicken and rice cooked in its own roasted pepper–tomato sauce. Crispy chicken on top, soft rice underneath.",
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

export default function QuickRiceChickenPage() {
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
                Chicken simmered to make its own stock, roasted peppers and
                tomatoes blended into sauce, then everything turns into a pan of
                rice with crispy chicken on top.
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
                Need to feed more people, use a different rice or cook it in the
                oven? Ask the AI and it can adjust times, amounts and method.
              </p>
            </div>

            {/* Image */}
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
                    One-pan chicken & rice
                  </p>
                  <p className="text-xs text-slate-600">
                    Deep flavour from roasting and blending the peppers and
                    tomatoes, without loads of extra steps.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* INGREDIENTS + STEPS */}
        <section>
          <Reveal className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)] items-start">
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl font-semibold">Ingredients</h2>
              <p className="text-xs text-slate-500">
                The exact veg size isn&apos;t precious here. Keep the liquid
                roughly right and the AI can help you scale it up or down.
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
                Try not to stir the rice too much once it&apos;s simmering.
                Leave it alone so it cooks evenly and doesn&apos;t go mushy.
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
                Any big pan with a lid works. These are just nice to have if you
                cook this kind of thing often.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <GearCard
                title="Wide lidded pan"
                body="A wide pan lets the rice cook in an even layer instead of a deep pile."
                query="large non stick saute pan with lid"
              />
              <GearCard
                title="Blender or food processor"
                body="Makes it easy to blitz the roasted peppers, tomatoes and garlic into a smooth sauce."
                query="jug blender for sauces"
              />
              <GearCard
                title="Heat-resistant spatula"
                body="Helps scrape out every bit of sauce and stir without scratching the pan."
                query="heat resistant silicone spatula"
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
                  Can I use a different rice?
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  Yes, but the liquid and time change. You can use basmati,
                  jasmine or long grain – just ask the AI to adjust the water
                  and timing for the rice you have.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                <p className="font-medium text-slate-900">
                  How do I stop the bottom burning?
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  Keep the heat low once it&apos;s simmering, lid on, and don&apos;t
                  let it boil hard. If you&apos;re unsure, ask the AI for an oven
                  version where the rice finishes in the oven instead.
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
                If you like this, there are more chicken and rice-type recipes
                waiting on the main page.
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
