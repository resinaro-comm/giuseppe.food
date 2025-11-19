#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const out = { tags: [], time: undefined, ts: 1.5 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const [k, vRaw] = a.startsWith('--') ? a.split('=') : [a, undefined];
    const v = vRaw ?? argv[i + 1];
    const nextIsValue = vRaw === undefined;
    switch (true) {
      case /^--slug(=|$)/.test(a): out.slug = v; if (nextIsValue) i++; break;
      case /^--title(=|$)/.test(a): out.title = v; if (nextIsValue) i++; break;
      case /^(--url|--instagram)(=|$)/.test(a): out.url = v; if (nextIsValue) i++; break;
      case /^--description(=|$)/.test(a): out.description = v; if (nextIsValue) i++; break;
      case /^--tags(=|$)/.test(a): out.tags = (v || '').split(',').map(s => s.trim()).filter(Boolean); if (nextIsValue) i++; break;
      case /^--time(=|$)/.test(a): out.time = Number(v); if (nextIsValue) i++; break;
      case /^--timestamp(=|$)/.test(a): out.ts = Number(v); if (nextIsValue) i++; break;
      default: break;
    }
  }
  return out;
}

function hasCmd(cmd) {
  try { execSync(`${cmd} --version`, { stdio: 'ignore' }); return true; } catch { return false; }
}

function resolveYtDlp() {
  const localVenv = path.resolve(process.cwd(), '.venv', 'bin', 'yt-dlp');
  if (fs.existsSync(localVenv)) return localVenv;
  if (hasCmd('yt-dlp')) return 'yt-dlp';
  // Fallback: python -m yt_dlp
  return 'python3 -m yt_dlp';
}

function ensureDirs() {
  fs.mkdirSync(path.resolve('public', 'videos'), { recursive: true });
  fs.mkdirSync(path.resolve('public', 'images'), { recursive: true });
}

function run(cmd, opts={}) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function addRecipeToTs({ slug, title, description, tags, time, instagramUrl }) {
  const file = path.resolve('src', 'data', 'recipes.ts');
  let src = fs.readFileSync(file, 'utf8');
  const marker = /export const recipes: Recipe\[] = \[/;
  if (!marker.test(src)) throw new Error('Could not find recipes array in src/data/recipes.ts');

  const recipeObj = `{
    slug: ${JSON.stringify(slug)},
    title: ${JSON.stringify(title)},
    thumbnail: ${JSON.stringify(`/images/${slug}.jpg`)},
    shortDescription: ${JSON.stringify(description || `${title} with a simple, tasty dressing.`)},
    ${Number.isFinite(time) ? `timeMinutes: ${time},\n    ` : ''}tags: ${JSON.stringify(tags && tags.length ? tags : ['quick','weeknight'])},
    instagramUrl: ${JSON.stringify(instagramUrl)},
    videoUrl: ${JSON.stringify(`/videos/${slug}.mp4`)},
    ingredients: [],
    steps: [],
  }`;

  // Insert before the closing array bracket
  const closeIdx = src.lastIndexOf('];');
  if (closeIdx === -1) throw new Error('Could not find end of recipes array.');
  const before = src.slice(0, closeIdx).trimEnd();
  const after = src.slice(closeIdx);
  const needsComma = before.endsWith('}') ? ',' : '';
  const next = `${before}${needsComma}\n  ${recipeObj}\n${after}`;
  fs.writeFileSync(file, next, 'utf8');
}

(function main(){
  const args = parseArgs(process.argv);
  if (!args.slug || !args.title || !args.url) {
    console.log('Usage: npm run recipe:add -- --slug avocado-salad --title "Avocado Salad" --url https://www.instagram.com/reel/XXXX/ [--description "..."] [--tags salad,quick] [--time 10] [--timestamp 1.5]');
    process.exit(1);
  }
  ensureDirs();
  const slug = args.slug;
  const yt = resolveYtDlp();
  const videoPath = path.resolve('public', 'videos', `${slug}.mp4`);
  const imagePath = path.resolve('public', 'images', `${slug}.jpg`);

  // 1) Download
  run(`${yt} ${JSON.stringify(args.url)} -o ${JSON.stringify(videoPath)} --no-progress --no-warnings`);

  // 2) Prepare/transcode for iOS + faststart (reuse existing script)
  run(`node scripts/prepare-videos.mjs`);

  // 3) Generate 4:5 cover (center-cropped from vertical video)
  const ts = isNaN(args.ts) ? 1.5 : Math.max(0, Number(args.ts));
  const vf = "crop=in_w:in_w*5/4:0:(in_h-in_w*5/4)/2,scale=1200:1500";
  run(`ffmpeg -loglevel warning -y -ss ${ts} -i ${JSON.stringify(videoPath)} -vf ${JSON.stringify(vf)} -frames:v 1 ${JSON.stringify(imagePath)}`);

  // 4) Inject recipe skeleton into TS data
  addRecipeToTs({
    slug,
    title: args.title,
    description: args.description,
    tags: args.tags,
    time: args.time,
    instagramUrl: args.url,
  });

  console.log(`\nDone. Added/updated assets:\n- ${path.relative(process.cwd(), videoPath)}\n- ${path.relative(process.cwd(), imagePath)}\nAnd injected recipe into src/data/recipes.ts`);
})();
