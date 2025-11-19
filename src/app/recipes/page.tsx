// src/app/recipes/page.tsx
import Link from "next/link";
import { recipes } from "../../data/recipes";
import RecipeCover from "@components/RecipeCover";
import { Reveal } from "@components/Reveal";

function badgeForRecipe(recipe: { title: string; tags: string[]; timeMinutes?: number }) {
  const tags = new Set((recipe.tags || []).map((t) => t.toLowerCase()));
  const time = recipe.timeMinutes ?? 0;
  if (tags.has("quick") || (!!time && time <= 25)) return "Weeknight quick";
  if (tags.has("slow") || (!!time && time >= 75)) return "Slow + low";
  if (tags.has("baking") || tags.has("dessert") || tags.has("cookies") || recipe.title.toLowerCase().includes("cake"))
    return "Bake at home";
  if (tags.has("pasta")) return "Pasta night";
  if (tags.has("rice")) return "Rice • one‑pan";
  if (tags.has("fried")) return "Crunchy & hot";
  if (tags.has("beef")) return "Proper comfort";
  return "Watch & cook";
}

export default function RecipesPage() {
  return (
    <div className="space-y-8">
      <Reveal className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-semibold">Recipes</h1>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl">
          full recipes below, good luck.
        </p>
      </Reveal>

      {/* Later we can add filters / search here */}
      {/* <div className="flex gap-3 text-sm text-slate-600">...</div> */}

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe, idx) => (
          <Reveal key={recipe.slug} delay={idx * 50}>
            <Link
              href={`/recipes/${recipe.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 hover:shadow-sm transition flex flex-col"
            >
            {/* Thumbnail */}
            <div className="relative">
              <RecipeCover
                alt={recipe.title}
                thumbnail={recipe.thumbnail}
                videoUrl={recipe.videoUrl}
                className="group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
              <div className="pointer-events-none absolute bottom-3 left-3 right-3">
                <p className="text-[11px] font-medium text-slate-100/95 mb-1">
                  {badgeForRecipe(recipe)}
                </p>
                <h2 className="text-white text-lg font-semibold drop-shadow">
                  {recipe.title}
                </h2>
              </div>
            </div>

            {/* Meta */}
            <div className="flex-1 flex flex-col gap-3 p-4">
              <p className="text-sm text-slate-600 line-clamp-2">
                {recipe.shortDescription}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto justify-center md:justify-start">
                {recipe.timeMinutes && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    {recipe.timeMinutes} min
                  </span>
                )}
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            </Link>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
