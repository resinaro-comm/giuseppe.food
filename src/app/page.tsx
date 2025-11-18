// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { recipes } from "../data/recipes";
import { Reveal } from "@components/Reveal";

export default function HomePage() {
  // Choose explicit hero and featured items
  const heroRecipe =
    recipes.find((r) => r.slug === "chicken-cutlets") ?? recipes[0];
  const featuredSlugs = [
    "matcha-cookies",
    "beef-braciole",
    "chicken-strips",
  ];
  const featured = recipes.filter((r) => featuredSlugs.includes(r.slug));

  return (
    <div className="relative -mt-12 md:mt-0 space-y-20">
      {/* Decorative background gradients */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundColor: "#F8FAFC",
          backgroundImage:
            "radial-gradient(70% 55% at -10% -10%, rgba(59,130,246,0.10), transparent 60%), radial-gradient(70% 55% at 110% 0%, rgba(236,72,153,0.09), transparent 60%), radial-gradient(65% 55% at 50% 120%, rgba(16,185,129,0.09), transparent 60%)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "120% 120%, 120% 120%, 120% 120%",
          backgroundPosition: "left top, right 10% top, center bottom",
        }}
      />
      {/* HERO */}
      <section className="relative grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-center">
        <Reveal className="space-y-6 text-center md:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            giuseppe.food
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
            Short videos,
            <br className="hidden md:block" />
            {" "}
            <span className="underline decoration-slate-400/70 underline-offset-4">full</span> recipes.
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto md:mx-0">
            Every dish from my socials with proper ingredients and steps.
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Link
              href="/recipes"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Browse recipes
            </Link>
            <Link
              href="/ai"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium border border-slate-300 text-slate-800 hover:bg-slate-100 transition"
            >
              Try the AI helper
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Recipes are added from my latest videos as they
            go live.
          </p>
        </Reveal>

        {/* Hero recipe / social card */}
        {heroRecipe && (
          <Reveal>
            <Link
              href={`/recipes/${heroRecipe.slug}`}
              className="group relative rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm overflow-hidden flex flex-col w-full max-w-xs mx-auto lg:ml-auto lg:mr-0"
            >
              <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                <Image
                  src={heroRecipe.thumbnail as string}
                  alt={heroRecipe.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-200">
                    From my socials
                  </p>
                  <h2 className="text-lg md:text-xl font-semibold text-white drop-shadow">
                    {heroRecipe.title}
                  </h2>
                  <p className="text-[11px] text-slate-100 line-clamp-2">
                    {heroRecipe.shortDescription}
                  </p>
                </div>
              </div>

              <div className="p-4 md:p-5 space-y-3 border-t border-slate-100">
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 justify-center md:justify-start">
                  {heroRecipe.timeMinutes && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium">
                      {heroRecipe.timeMinutes} min
                    </span>
                  )}
                  {heroRecipe.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Tap to see full recipe</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>AI helper ready</span>
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="relative">
        <Reveal className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-center md:text-left">How it works</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3 max-w-xl mx-auto md:max-w-none">
          <Reveal className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4 space-y-2 text-center md:text-left" delay={50}>
            <p className="text-xs font-semibold text-slate-500">STEP 1</p>
            <h3 className="font-medium">Find the dish</h3>
            <p className="text-sm text-slate-600">
              See something you like in a short? Search or tap through to the
              full written recipe here.
            </p>
          </Reveal>
          <Reveal className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4 space-y-2 text-center md:text-left" delay={120}>
            <p className="text-xs font-semibold text-slate-500">STEP 2</p>
            <h3 className="font-medium">Cook it properly</h3>
            <p className="text-sm text-slate-600">
              Exact ingredients, steps and timing — no more pausing the video
              20 times to catch what happened.
            </p>
          </Reveal>
          <Reveal className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4 space-y-2 text-center md:text-left" delay={180}>
            <p className="text-xs font-semibold text-slate-500">STEP 3</p>
            <h3 className="font-medium">Ask the AI to adapt</h3>
            <p className="text-sm text-slate-600">
              Forgot something, don&apos;t like an ingredient, or cooking for
              more people? The AI tweaks my recipes around you.
            </p>
          </Reveal>
        </div>
        {/* Subtle divider */}
        <div className="mt-10 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </section>

      {/* LATEST / FEATURED RECIPES */}
      <section className="relative space-y-6">
        <Reveal className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">Latest from the kitchen</h2>
          <Link href="/recipes" className="text-xs font-medium text-slate-600 hover:text-slate-900">
            View all recipes
          </Link>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((recipe) => (
            <Reveal
              key={recipe.slug}
            >
              <Link
                href={`/recipes/${recipe.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white/90 backdrop-blur overflow-hidden hover:border-slate-300 hover:shadow-sm transition flex flex-col"
              >
                <div className="relative w-full aspect-[3/4] bg-slate-100 overflow-hidden">
                  <Image
                    src={recipe.thumbnail as string}
                    alt={recipe.title}
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-200 mb-1">
                      VIDEO RECIPE
                    </p>
                    <h3 className="text-xs md:text-sm font-semibold text-white line-clamp-2 drop-shadow">
                      {recipe.title}
                    </h3>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2 p-3">
                  <p className="text-[13px] text-slate-600 line-clamp-2">
                    {recipe.shortDescription}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 text-[10px] justify-center md:justify-start">
                    {recipe.timeMinutes && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                        {recipe.timeMinutes} min
                      </span>
                    )}
                    {recipe.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* AI CALLOUT */}
      <section className="relative">
        <Reveal className="rounded-3xl border border-slate-200 bg-slate-900 text-slate-50 px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between gap-6 text-center md:text-left">
          <div className="space-y-3 max-w-xl mx-auto md:mx-0">
            <h2 className="text-xl md:text-2xl font-semibold">
              Your AI kitchen helper
            </h2>
            <p className="text-sm md:text-base text-slate-200">
              Tell it what&apos;s in your fridge, how much time you&apos;ve got,
              and roughly what you&apos;re aiming for. It uses my recipes to
              suggest and adapt meals around you — not random internet food.
            </p>
            <p className="text-[11px] text-slate-400">
              Not medical or clinical nutrition advice. Just a smarter way to
              actually use the recipes you see on my socials.
            </p>
          </div>
          <Link
            href="/ai"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium bg-white text-slate-900 hover:bg-slate-100 transition self-center md:self-auto"
          >
            Open AI Kitchen
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
