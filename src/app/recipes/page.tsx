// src/app/recipes/page.tsx
import Link from "next/link";
import { recipes } from "../../data/recipes";
import RecipeCover from "@components/RecipeCover";
import { Reveal } from "@components/Reveal";
import { RecipeCard } from "@components/RecipeCard";

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
            <RecipeCard
              href={{ pathname: "/recipes/[slug]", query: { slug: recipe.slug } }}
              slug={recipe.slug}
              title={recipe.title}
              description={recipe.shortDescription}
              thumbnail={recipe.thumbnail}
              tags={recipe.tags}
              timeMinutes={recipe.timeMinutes}
              variant="list"
              badge={badgeForRecipe(recipe)}
              index={idx}
              source="recipes-list"
            />
          </Reveal>
        ))}
      </section>
    </div>
  );
}
