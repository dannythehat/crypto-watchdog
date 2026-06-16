// Generates an on-brand SVG hero image for an article (1200x630, OG size).
// On-brand, scalable, zero dependencies — no Canva/network needed.
// Usage: node cw-content-brain/scripts/build_hero_svg.mjs <slug> "<title>" [category]

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const [slug, title, category = "CryptoWatchdog"] = process.argv.slice(2);
if (!slug || !title) { console.error('Usage: build_hero_svg.mjs <slug> "<title>" [category]'); process.exit(1); }

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// naive word-wrap to ~18 chars/line, max 4 lines
function wrap(text, max = 18, maxLines = 4) {
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
const startY = 320 - (lines.length - 1) * 34;
const titleSpans = lines.map((l, i) => `<text x="80" y="${startY + i * 68}" font-family="'Space Grotesk', Arial, sans-serif" font-size="56" font-weight="700" fill="#FFFFFF">${esc(l)}</text>`).join("\n  ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0C0E14"/>
      <stop offset="1" stop-color="#141A2B"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="12" height="630" fill="#2662D9"/>
  <!-- brand -->
  <g transform="translate(80,90)">
    <path d="M0 0 L34 0 L34 22 C34 38 18 46 17 46 C16 46 0 38 0 22 Z" fill="#2662D9"/>
    <text x="48" y="32" font-family="'Space Grotesk', Arial, sans-serif" font-size="30" font-weight="700" fill="#FFFFFF">Crypto<tspan fill="#2662D9">Watchdog</tspan></text>
  </g>
  <text x="80" y="200" font-family="Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="3" fill="#2662D9">${esc(category.toUpperCase())}</text>
  ${titleSpans}
  <text x="80" y="560" font-family="Arial, sans-serif" font-size="22" fill="#8a93a6">Independent, evidence-led crypto safety reviews</text>
</svg>
`;

const dir = `${ROOT}/public/blog-images`;
mkdirSync(dir, { recursive: true });
const out = `${dir}/${slug}.svg`;
writeFileSync(out, svg);
console.log(`Hero written: /blog-images/${slug}.svg`);
