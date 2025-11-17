# giuseppe.food

Modern Next.js 14 + TypeScript + Tailwind app for recipes and an upcoming AI kitchen helper.

## Tech Stack
- Next.js 14 (App Router, `src` directory)
- TypeScript
- Tailwind CSS
- ESLint (next/core-web-vitals)
- Vercel Analytics + Speed Insights

## Development
```bash
npm install
npm run dev
```
App runs on http://localhost:3000

## Structure
```
src/
  app/
    layout.tsx      # Root layout with nav, footer, analytics
    page.tsx        # Landing page
    recipes/page.tsx
    ai/page.tsx     # AI chat placeholder
  components/
    NavBar.tsx
    Footer.tsx
  styles/
    globals.css
  lib/recipes/
    dummy.ts        # Placeholder recipe data
```

## Adding Recipes
Put real recipe data (JSON or modules) inside `src/lib/recipes/` and create dynamic routes later under `src/app/recipes/[slug]/page.tsx`.

## AI Integration
Later: add an API route in `src/app/api/ai/route.ts` using edge runtime + streaming, and wire it to the chat UI in `src/app/ai/page.tsx`.

## Deployment
Deploy on Vercel. Analytics and Speed Insights components are already included in the root layout.

## License
Proprietary (adjust as needed).
