// src/app/kitchen/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@components/Reveal";

const AFFILIATE_TAG = "resinaroamzn-21";

type GearItem = {
  title: string;
  body: string;
  query: string;
};

type GearSection = {
  id: string;
  title: string;
  subtitle: string;
  items: GearItem[];
};

const gearSections: GearSection[] = [
  {
    id: "pans",
    title: "Pans for everyday cooking",
    subtitle:
      "Stuff I use for chicken cutlets, pasta sauces and weeknight dinners.",
    items: [
      {
        title: "Non-stick frying pan",
        body: "Wide, not too deep. Lets chicken and veg sit flat and actually brown instead of steaming.",
        query: "non stick frying pan 28cm",
      },
      {
        title: "Heavy stainless steel pan",
        body: "Good for searing meat and making pan sauces. Gets hot, holds heat, lasts years.",
        query: "stainless steel frying pan 28cm",
      },
      {
        title: "Deep sauté pan with lid",
        body: "Perfect for one-pan rice dishes, stews, quick braises and big pasta sauces.",
        query: "saute pan with lid 28cm",
      },
    ],
  },
  {
    id: "baking",
    title: "Trays & baking stuff",
    subtitle:
      "For roast chicken, cookies, apple cake and anything that needs a flat hot surface.",
    items: [
      {
        title: "Heavy baking tray / sheet pan",
        body: "Thick metal so it doesn’t warp. Great for roast potatoes, veg, chicken and cookies.",
        query: "heavy duty baking tray",
      },
      {
        title: "Cooling rack",
        body: "Lets fried food and baked stuff rest without going soggy underneath.",
        query: "cooling rack wire",
      },
      {
        title: "Non-stick cake tin (20cm)",
        body: "Works for apple cake, simple sponges and most small cakes.",
        query: "20cm non stick cake tin",
      },
    ],
  },
  {
    id: "knives",
    title: "Knives & chopping boards",
    subtitle:
      "You don’t need a full set. One good knife, one small one and a stable board.",
    items: [
      {
        title: "Chef’s knife (20cm)",
        body: "Main knife for almost everything: veg, meat, herbs. Feel > brand. Get one you like holding.",
        query: "chefs knife 20cm",
      },
      {
        title: "Small paring knife",
        body: "Handy for garlic, small fruit, trimming meat and little jobs.",
        query: "paring knife",
      },
      {
        title: "Big chopping board",
        body: "Stable, big enough to actually prep on. Wood or plastic is fine.",
        query: "large chopping board",
      },
    ],
  },
  {
    id: "little-upgrades",
    title: "Little upgrades that help a lot",
    subtitle:
      "Not essential, but they make cooking easier and take some guesswork out.",
    items: [
      {
        title: "Instant-read thermometer",
        body: "Helps you stop undercooking or overcooking chicken, beef, anything. Great for fried chicken and roast meat.",
        query: "instant read meat thermometer",
      },
      {
        title: "Digital kitchen scales",
        body: "For baking and getting repeatable results. Much better than guessing cups.",
        query: "digital kitchen scales",
      },
      {
        title: "Silicone spatula",
        body: "Scrapes bowls clean, stirs sauces, doesn’t scratch non-stick. Use it every day.",
        query: "silicone spatula heat resistant",
      },
    ],
  },
];

// Build a simple URL for Amazon search with your affiliate tag
function buildAmazonSearchUrl(query: string) {
  return `https://www.amazon.co.uk/s?k=${encodeURIComponent(
    query
  )}&tag=${AFFILIATE_TAG}&linkCode=ll2&language=en_GB&ref_=as_li_ss_tl`;
}

// JSON-LD for SEO (collection of products)
const structuredData = (() => {
  const items: any[] = [];
  let position = 1;

  for (const section of gearSections) {
    for (const item of section.items) {
      items.push({
        "@type": "ListItem",
        position: position++,
        item: {
          "@type": "Product",
          name: item.title,
          description: item.body,
          url: buildAmazonSearchUrl(item.query),
        },
      });
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Kitchen tools I actually use",
    description:
      "Kitchen tools, pans, trays and small upgrades I actually use at home. Simple, reliable kit for cooking the recipes from giuseppe.food.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items,
    },
  };
})();

export const metadata: Metadata = {
  title: "Kitchen tools I actually use – giuseppe.food",
  description:
    "Kitchen tools, pans, trays and small upgrades I actually use at home. Simple, reliable kit that works for roast chicken, cookies, pasta and more.",
  openGraph: {
    title: "Kitchen tools I actually use – giuseppe.food",
    description:
      "Non-stick pans, baking trays, knives and little upgrades I reach for every week. Plus Amazon links if you want to pick up something similar.",
    type: "website",
    url: "https://giuseppe.food/kitchen",
  },
};

export default function KitchenPage() {
  return (
    <>
      {/* JSON-LD for the gear collection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="space-y-12 md:space-y-16">
        {/* HERO */}
        <section className="relative">
          <Reveal className="space-y-6 text-center lg:text-left max-w-3xl mx-auto lg:mx-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              kitchen
            </p>
            <h1 className="text-2xl md:text-4xl font-semibold leading-tight">
              Kitchen tools I actually use
            </h1>
            <p className="text-sm md:text-base text-slate-600">
              This isn&apos;t a fancy curated list. It&apos;s just the kind of
              pans, trays, knives and small bits I actually use at home to cook
              the recipes on this site.
            </p>
            <p className="text-xs text-slate-500">
              You don&apos;t need all of this. Use what you already have first.
              These links are here if you&apos;re missing something and want
              something simple that works.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link
                href="/recipes"
                className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-xs md:text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Back to recipes
              </Link>
              <a
                href="https://www.instagram.com/giuseppe.food/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-xs md:text-sm font-medium border border-slate-300 text-slate-800 hover:bg-slate-100 transition"
              >
                Watch the cooking videos
                <span aria-hidden className="ml-1 text-[11px]">
                  ↗
                </span>
              </a>
            </div>
            <p className="text-[11px] text-slate-400 text-center lg:text-left">
              Some links on this page are Amazon affiliate links. If you buy
              through them, it might send a tiny bit back to support the
              recipes. Price is the same for you.
            </p>
          </Reveal>
        </section>

        {/* GRID OF SECTIONS */}
        <section className="relative space-y-10">
          {gearSections.map((section) => (
            <Reveal
              key={section.id}
              className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 backdrop-blur px-4 py-5 md:px-6 md:py-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-2 text-center lg:text-left">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold">
                    {section.title}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600 mt-1">
                    {section.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center lg:justify-start">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-slate-50 font-semibold text-[11px]">
                    {section.items.length}
                  </span>
                  <span>ideas in this section</span>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3 max-w-2xl mx-auto lg:max-w-none">
                {section.items.map((item) => (
                  <GearCard key={item.title} item={item} />
                ))}
              </div>
            </Reveal>
          ))}
        </section>

        {/* SMALL FOOTER NOTE */}
        <section>
          <Reveal>
            <div className="border-t border-slate-200 pt-5 text-[11px] text-slate-500 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-center lg:text-left">
              <p>
                If you&apos;re not sure what to buy, start with a solid pan, a
                good board and one sharp knife. That alone makes cooking way
                less annoying.
              </p>
              <Link
                href="/recipes/chicken-cutlets"
                className="inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-[11px] font-medium border border-slate-300 text-slate-800 hover:bg-slate-100 transition self-center lg:self-auto"
              >
                See the chicken cutlets recipe
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}

type GearCardProps = {
  item: GearItem;
};

function GearCard({ item }: GearCardProps) {
  const searchUrl = buildAmazonSearchUrl(item.query);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-white transition shadow-[0_1px_0_rgba(15,23,42,0.02)] p-4 flex flex-col justify-between text-center lg:text-left">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-slate-900">{item.title}</p>
        <p className="text-xs text-slate-600">{item.body}</p>
      </div>
      <div className="mt-3 flex items-center justify-center lg:justify-between">
        <a
          href={searchUrl}
          target="_blank"
          rel="noreferrer nofollow sponsored"
          className="inline-flex items-center text-[11px] font-medium text-sky-700 hover:text-sky-800 underline underline-offset-2"
        >
          View options on Amazon
          <span aria-hidden className="ml-0.5 text-[10px]">↗</span>
        </a>
      </div>
    </div>
  );
}
