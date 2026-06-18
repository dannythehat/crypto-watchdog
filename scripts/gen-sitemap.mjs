// Auto-generates public/sitemap.xml from the content files + known routes.
// Runs automatically before every build (npm "prebuild" hook), so the sitemap
// never goes stale as reviews/blogs/warnings/casinos are added or removed.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://cryptowatchdog.net";
const today = new Date().toISOString().slice(0, 10);

const fm = (file) => {
  const t = fs.readFileSync(file, "utf8");
  const m = t.match(/^---\n([\s\S]*?)\n---/);
  const block = m ? m[1] : "";
  const g = (k) => (block.match(new RegExp(`^${k}:\\s*(.*)$`, "m")) || [])[1]?.trim().replace(/^"|"$/g, "");
  return {
    published: (g("published") || "true") !== "false",
    noindex: (g("noindex") || "") === "true",
    lastmod: ((g("updated_at") || g("published_at") || today) + "").slice(0, 10) || today,
  };
};

const dir = (d) => {
  const p = path.join(root, "src/content", d);
  return fs.existsSync(p) ? fs.readdirSync(p).filter((f) => f.endsWith(".md")) : [];
};

const urls = [];
const add = (loc, lastmod = today) => urls.push({ loc: BASE + loc, lastmod });

// Static + landing routes
["", "/reviews", "/blog", "/warnings", "/news", "/freebies", "/about", "/submit",
 "/crypto-casinos", "/ai-finance", "/crypto-trading", "/methodology",
 "/editorial-policy", "/affiliate-disclosure", "/contact", "/scam-guides", "/education"]
  .forEach((r) => add(r));

// Category hubs (from hubs.ts slugs)
const hubsTxt = fs.readFileSync(path.join(root, "src/content/hubs.ts"), "utf8");
[...hubsTxt.matchAll(/\n    slug: "([^"]+)"/g)].forEach((m) => add("/" + m[1]));

// Content collections
for (const [d, prefix] of [["reviews", "/reviews/"], ["blog", "/blog/"], ["warnings", "/warnings/"]]) {
  for (const f of dir(d)) {
    const slug = f.replace(/\.md$/, "");
    const meta = fm(path.join(root, "src/content", d, f));
    if (meta.published && !meta.noindex) add(prefix + slug, meta.lastmod);
  }
}

// De-dupe by loc
const seen = new Set();
const unique = urls.filter((u) => (seen.has(u.loc) ? false : seen.add(u.loc)));

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  unique.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`;

fs.writeFileSync(path.join(root, "public/sitemap.xml"), xml);
console.log(`[sitemap] wrote ${unique.length} URLs`);
