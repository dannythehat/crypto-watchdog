// Generates a premium, aligned, on-brand SVG hero (1200x630) for any article.
// Gradient mesh + glows, brand, category pill, glowing shield emblem, and a glass
// card with a title auto-sized/wrapped to fit (no overflow). No deps.
// Usage: node cw-content-brain/scripts/build_hero_svg.mjs <slug> "<title>" [category] ["subtitle"]

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const [slug, title, category = "CryptoWatchdog", subtitle = "Independent, evidence-led crypto safety reviews"] = process.argv.slice(2);
if (!slug || !title) { console.error('Usage: build_hero_svg.mjs <slug> "<title>" [category] ["subtitle"]'); process.exit(1); }

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// wrap to <= maxLines, choosing a width that balances lines
function wrap(text, max, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

// pick font size so the longest line fits the card (~820px usable at given size)
let lines = wrap(title, 26, 2);
let fontSize = lines.length === 1 ? 52 : 42;
const longest = Math.max(...lines.map((l) => l.length));
if (longest * fontSize * 0.56 > 820) fontSize = Math.floor(820 / (longest * 0.56));
fontSize = Math.max(30, Math.min(fontSize, 56));

const cardY = 432, cardH = 158;
const blockH = lines.length * (fontSize + 8) + 30;
let ty = cardY + (cardH - blockH) / 2 + fontSize;
const titleSpans = lines
  .map((l, i) => `<text x="600" y="${ty + i * (fontSize + 8)}" text-anchor="middle" font-family="'Space Grotesk',Arial,sans-serif" font-size="${fontSize}" font-weight="700" fill="url(#title)" letter-spacing="-0.5">${esc(l)}</text>`)
  .join("\n  ");
const subY = ty + lines.length * (fontSize + 8) + 4;
const cat = esc(category.toUpperCase());
const pillW = Math.max(110, cat.length * 11 + 40);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#080A11"/><stop offset="0.5" stop-color="#0E1426"/><stop offset="1" stop-color="#070912"/></linearGradient>
    <radialGradient id="g1" cx="0.22" cy="0.2" r="0.6"><stop offset="0" stop-color="#2E6BFF" stop-opacity="0.6"/><stop offset="1" stop-color="#2E6BFF" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="0.85" cy="0.3" r="0.55"><stop offset="0" stop-color="#13C29B" stop-opacity="0.4"/><stop offset="1" stop-color="#13C29B" stop-opacity="0"/></radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B8DEF"/><stop offset="1" stop-color="#2E6BFF"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.10"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0.02"/></linearGradient>
    <linearGradient id="title" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C3D0E8"/></linearGradient>
    <filter id="blur" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="50"/></filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="22" stdDeviation="28" flood-color="#000" flood-opacity="0.55"/></filter>
    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1"><path d="M0 157 H1200 M0 315 H1200 M300 0 V630 M600 0 V630 M900 0 V630"/></g>
  <rect x="0" y="0" width="1200" height="5" fill="url(#accent)"/>

  <g transform="translate(80,70)">
    <path d="M0 0 L26 10 L26 26 C26 42 13 50 13 50 C13 50 0 42 0 26 Z" fill="url(#accent)"/>
    <text x="40" y="34" font-family="'Space Grotesk',Arial,sans-serif" font-size="27" font-weight="700" fill="#FFFFFF">Crypto<tspan fill="#5B8DEF">Watchdog</tspan></text>
  </g>
  <g transform="translate(${1120 - pillW},74)">
    <rect width="${pillW}" height="38" rx="19" fill="#2E6BFF" fill-opacity="0.16" stroke="#5B8DEF" stroke-opacity="0.5"/>
    <text x="${pillW / 2}" y="25" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" font-weight="700" letter-spacing="2" fill="#9DBCFF">${cat}</text>
  </g>

  <!-- glowing shield emblem -->
  <g transform="translate(600,235)" filter="url(#glow)">
    <g transform="translate(-70,-92)">
      <path d="M70 0 L140 28 L140 86 C140 150 70 184 70 184 C70 184 0 150 0 86 L0 28 Z" fill="url(#accent)" opacity="0.95"/>
      <path d="M70 18 L122 39 L122 84 C122 132 70 158 70 158 C70 158 18 132 18 84 L18 39 Z" fill="#0B1020"/>
      <path d="M44 88 L62 108 L98 62" stroke="#5B8DEF" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>

  <g filter="url(#soft)">
    <rect x="150" y="${cardY}" width="900" height="${cardH}" rx="24" fill="url(#glass)" stroke="#FFFFFF" stroke-opacity="0.14"/>
    <rect x="150" y="${cardY}" width="900" height="2" fill="#FFFFFF" fill-opacity="0.22"/>
  </g>
  ${titleSpans}
  <text x="600" y="${subY}" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#9AA7C0">${esc(subtitle)}</text>
</svg>
`;

const dir = `${ROOT}/public/blog-images`;
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/${slug}.svg`, svg);
console.log(`Hero written: /blog-images/${slug}.svg`);
