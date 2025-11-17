// src/app/recipes/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { recipes } from "../../../data/recipes";
import { InstagramEmbed } from "@components/InstagramEmbed";
import { RecipeVideoPlayer } from "@components/RecipeVideoPlayer";

type RecipePageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export default function RecipePage({ params }: RecipePageProps) {
  const recipe = recipes.find((r) => r.slug === params.slug);

  if (!recipe) {
    notFound();
  }

  return (
    <article className="space-y-10">
      {/* Top section: title + meta */}
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <Link href="/recipes" className="hover:text-slate-700">
            ← All recipes
          </Link>
          <span>·</span>
          <span>From social video</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-semibold">{recipe.title}</h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl">
            {recipe.shortDescription}
          </p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-center text-[11px]">
            {recipe.timeMinutes && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                {recipe.timeMinutes} min
              </span>
            )}
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Video + content layout */}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
        {/* Left column – video + steps */}
        <div className="space-y-8">
          {/* Video embed */}
          {recipe.videoUrl ? (
            <RecipeVideoPlayer
              videoUrl={recipe.videoUrl}
              instagramUrl={recipe.instagramUrl}
              poster={recipe.thumbnail}
            />
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-700">
                Watch the original video
              </h2>
              <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                <InstagramEmbed permalink={recipe.instagramUrl} />
              </div>
              <p className="text-xs text-slate-500">
                If the embed doesn&apos;t load, you can{" "}
                <a
                  href={recipe.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  open the recipe on Instagram
                </a>
                .
              </p>
            </div>
          )}

          {/* Method */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Method</h2>
            <ol className="space-y-3 text-sm md:text-base text-slate-700 list-decimal list-inside">
              {recipe.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right column – ingredients + AI helper */}
        <div className="space-y-8">
          {/* Ingredients */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-lg font-semibold">Ingredients</h2>
            <ul className="space-y-1.5 text-sm text-slate-700 text-center md:text-left">
              {recipe.ingredients.map((item, index) => (
                <li key={index} className="flex gap-2 justify-center md:justify-start">
                  <span className="hidden md:inline-block mt-1 h-1 w-1 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI helper box (UI only for now) */}
          <div className="rounded-2xl border border-slate-900/10 bg-slate-900 text-slate-50 p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Ask the AI about this</h2>
              <p className="text-xs text-slate-300">
                Tell it what you forgot to buy, what you don&apos;t like, or how
                much time you actually have. The AI only knows my recipes and
                will try to adapt this one around you.
              </p>
            </div>

            {/* Simple form that sends the question to /ai as a query param */}
            <form action="/ai" method="GET" className="space-y-3">
              <input type="hidden" name="recipe" value={recipe.slug} />
              <textarea
                name="q"
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
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Quick ideas
              </p>
              <ul className="space-y-1 text-xs text-slate-200">
                <li>• “I forgot to buy _____, what can I swap it for?”</li>
                <li>• “I don&apos;t like mushrooms, how can I change this?”</li>
                <li>• “Make this lighter but still filling.”</li>
                <li>• “Adapt this to serve 5 people instead of 2.”</li>
              </ul>
              <p className="text-[10px] text-slate-400 pt-1">
                The AI is for general cooking guidance only, not medical or
                clinical nutrition advice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
