// Renders a content .md file to a self-contained, on-brand HTML preview so
// articles can be read (tables, images, links and all) before the site deploys.
// SVG images under /blog-images are inlined so the file works standalone.
// Usage: node cw-content-brain/scripts/render_preview.mjs src/content/blog/<slug>.md

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const input = process.argv[2];
if (!input) { console.error("Usage: render_preview.mjs <path-to-md>"); process.exit(1); }
const raw = readFileSync(resolve(ROOT, input), "utf8");

// front matter
let data = {}, body = raw;
if (raw.startsWith("---\n")) {
  const end = raw.indexOf("\n---", 4);
  for (const l of raw.slice(4, end).split("\n")) { const i = l.indexOf(":"); if (i > -1) { try { data[l.slice(0, i).trim()] = JSON.parse(l.slice(i + 1).trim()); } catch { data[l.slice(0, i).trim()] = l.slice(i + 1).trim(); } } }
  body = raw.slice(end + 4).replace(/^\n+/, "");
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const imgSrc = (src) => {
  if (src.startsWith("/blog-images/")) {
    const p = `${ROOT}/public${src}`;
    if (existsSync(p) && p.endsWith(".svg")) return "data:image/svg+xml;base64," + Buffer.from(readFileSync(p)).toString("base64");
  }
  return src;
};

function inline(t) {
  return esc(t)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, a, u) => `<img alt="${a}" src="${imgSrc(u)}"/>`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, x, u) => `<a href="${u}">${x}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

const lines = body.replace(/\r\n/g, "\n").split("\n");
const out = [];
let para = [], list = null;
const flushP = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
const flushL = () => { if (list) { out.push(`<ul>${list.map((i) => `<li>${inline(i)}</li>`).join("")}</ul>`); list = null; } };
const flush = () => { flushP(); flushL(); };
const splitRow = (r) => r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());

for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  if (t === "") { flush(); continue; }
  if (t.includes("|") && /^\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)+\|?$/.test((lines[i + 1] || "").trim())) {
    flush();
    const head = splitRow(t); i++;
    const rows = [];
    while (i + 1 < lines.length && lines[i + 1].includes("|") && lines[i + 1].trim() !== "") { i++; rows.push(splitRow(lines[i].trim())); }
    out.push(`<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
    continue;
  }
  if (/^(-{3,}|\*{3,})$/.test(t)) { flush(); out.push("<hr/>"); continue; }
  const h = t.match(/^(#{1,6})\s+(.*)$/);
  if (h) { flush(); const lv = Math.min(Math.max(h[1].length, 2), 6); out.push(`<h${lv}>${inline(h[2])}</h${lv}>`); continue; }
  if (/^>\s?/.test(t)) { flush(); out.push(`<blockquote>${inline(t.replace(/^>\s?/, ""))}</blockquote>`); continue; }
  if (/^[-*]\s+/.test(t)) { flushP(); (list = list || []).push(t.replace(/^[-*]\s+/, "")); continue; }
  flushL(); para.push(t);
}
flush();

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(data.title || basename(input))}</title>
<style>
:root{--blue:#2662D9}
body{font-family:Inter,system-ui,Arial,sans-serif;max-width:760px;margin:0 auto;padding:40px 20px;color:#14181f;line-height:1.65}
h1,h2,h3{font-family:'Space Grotesk',Arial,sans-serif;color:#0c0e14;line-height:1.25}
h1{font-size:2rem;margin:.2em 0 .1em} h2{font-size:1.5rem;margin:1.6em 0 .4em} h3{font-size:1.2rem;margin:1.3em 0 .3em}
.cat{color:var(--blue);font-weight:700;letter-spacing:2px;font-size:.8rem;text-transform:uppercase}
p{margin:.6em 0;color:#33404f} a{color:var(--blue)} strong{color:#14181f}
img{max-width:100%;height:auto;border-radius:12px;border:1px solid #e5e8ee;margin:1.2em 0;display:block}
table{border-collapse:collapse;width:100%;margin:1.4em 0;font-size:.95rem}
th,td{border:1px solid #e5e8ee;padding:9px 12px;text-align:left;vertical-align:top}
th{background:#f2f3f5} blockquote{border-left:4px solid var(--blue);margin:1em 0;padding:.4em 1em;background:#f7f9fc;color:#4b5563}
hr{border:none;border-top:1px solid #e5e8ee;margin:2em 0} code{background:#f2f3f5;padding:2px 6px;border-radius:5px;font-size:.9em}
.hero{width:100%;border-radius:14px;margin:0 0 1em}.banner{background:#fff8e6;border:1px solid #f0d98c;border-radius:10px;padding:10px 14px;font-size:.85rem;color:#6b5b16;margin-bottom:1.5em}
</style></head><body>
<div class="banner">📄 Local preview (not yet deployed). Live URL after deploy: <strong>cryptowatchdog.net/blog/${esc(data.slug || "")}</strong></div>
${data.image_url ? `<img class="hero" alt="${esc(data.title || "")}" src="${imgSrc(data.image_url)}"/>` : ""}
<div class="cat">${esc(data.category || "")}</div>
<h1>${esc(data.title || "")}</h1>
${out.join("\n")}
</body></html>`;

mkdirSync(`${ROOT}/marketing-ops/previews`, { recursive: true });
const outPath = `${ROOT}/marketing-ops/previews/${basename(input).replace(/\.md$/, "")}.html`;
writeFileSync(outPath, html);
console.log(outPath);
