// Generates a premium, on-brand SVG hero image for an article (1200x630, OG size).
// Gradient mesh + glow, brand glyph, category pill, shield watermark. No deps.
// Usage: node cw-content-brain/scripts/build_hero_svg.mjs <slug> "<title>" [category]

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const [slug, title, category = "CryptoWatchdog"] = process.argv.slice(2);
if (!slug || !title) { console.error('Usage: build_hero_svg.mjs <slug> "<title>" [category]'); process.exit(1); }

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, max = 22, maxLines = 3) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; }
    else cur = (cur + " " + w).trim();
    if (lines.length === maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines.slice(0, maxLines);
}

const lines = wrap(title);
const startY = 360 - (lines.length - 1) * 38;
const titleSpans = lines
  .map((l, i) => `<text x="80" y="${startY + i * 76}" font-family="'Space Grotesk',Arial,sans-serif" font-size="62" font-weight="700" fill="#FFFFFF" letter-spacing="-0.5">${esc(l)}</text>`)
  .join("\n  ");
const cat = esc(category.toUpperCase());
const pillW = Math.max(140, cat.length * 15 + 48);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0A0C12"/>
      <stop offset="0.55" stop-color="#10162A"/>
      <stop offset="1" stop-color="#0A0C12"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.18" r="0.6">
      <stop offset="0" stop-color="#2662D9" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#2662D9" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#2662D9"/>
      <stop offset="1" stop-color="#5B8DEF"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="6" fill="url(#accent)"/>
  <!-- shield watermark -->
  <g transform="translate(815,150) scale(7)" opacity="0.06">
    <path d="M30 0 L60 12 L60 36 C60 62 30 78 30 78 C30 78 0 62 0 36 L0 12 Z" fill="#5B8DEF"/>
  </g>
  <!-- brand -->
  <g transform="translate(80,84)">
    <path d="M0 0 L30 12 L30 30 C30 50 15 60 15 60 C15 60 0 50 0 30 Z" fill="url(#accent)"/>
    <text x="46" y="40" font-family="'Space Grotesk',Arial,sans-serif" font-size="32" font-weight="700" fill="#FFFFFF">Crypto<tspan fill="#5B8DEF">Watchdog</tspan></text>
  </g>
  <!-- category pill -->
  <g transform="translate(80,210)">
    <rect width="${pillW}" height="44" rx="22" fill="#2662D9" fill-opacity="0.16" stroke="#2662D9" stroke-opacity="0.5"/>
    <text x="24" y="29" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="2" fill="#7FA7F5">${cat}</text>
  </g>
  ${titleSpans}
  <line x1="80" y1="540" x2="180" y2="540" stroke="url(#accent)" stroke-width="4" stroke-linecap="round"/>
  <text x="80" y="578" font-family="Arial,sans-serif" font-size="22" fill="#9AA4B8">Independent, evidence-led crypto safety reviews</text>
</svg>
`;

const dir = `${ROOT}/public/blog-images`;
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/${slug}.svg`, svg);
console.log(`Hero written: /blog-images/${slug}.svg`);
