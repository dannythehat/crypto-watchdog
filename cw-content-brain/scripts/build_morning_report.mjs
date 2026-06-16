// Builds Danny's 6am roundup: new/updated content, affiliate status, earnings,
// today's social posts, and what's queued. Emailed by the morning-report Action.
// Run: node cw-content-brain/scripts/build_morning_report.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const today = new Date().toISOString().slice(0, 10);
const read = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);

const aff = read(`${ROOT}/src/content/affiliates.json`, []);
const ledger = read(`${ROOT}/cw-content-brain/affiliate-ops/ledger.json`, { entries: [] });

// content changed in last ~24h (best-effort via git)
let changed = [];
try {
  changed = execSync(`git -C "${ROOT}" log --since="24 hours ago" --name-only --pretty=format: -- src/content/`, { encoding: "utf8" })
    .split("\n").map((s) => s.trim()).filter((s) => s.endsWith(".md"));
  changed = [...new Set(changed)];
} catch { /* no git */ }

const active = aff.filter((a) => a.status === "active" && a.affiliateUrl);
const monetisable = aff.filter((a) => a.status !== "blocked");
const coverage = monetisable.length ? Math.round((active.length / monetisable.length) * 100) : 0;
const toSignup = aff.filter((a) => a.status === "needs_signup" && a.signupUrl).length;
const real = ledger.entries.filter((e) => !e._example);
const earned = real.reduce((s, e) => s + (Number(e.amount) || 0), 0);
const owed = earned - real.filter((e) => e.claimed).reduce((s, e) => s + (Number(e.amount) || 0), 0);

// today's social posts (generate is run before this in the Action)
const sq = read(`${ROOT}/cw-content-brain/social/queue/${today}.json`, { posts: [] });

// optional research notes I drop during sessions
const notesDir = `${ROOT}/marketing-ops/notes`;
let notes = "";
if (existsSync(notesDir)) {
  const latest = readdirSync(notesDir).filter((f) => f.endsWith(".md")).sort().pop();
  if (latest) notes = readFileSync(`${notesDir}/${latest}`, "utf8").trim();
}

const L = [];
L.push(`# ☕ CryptoWatchdog Morning Report — ${today}`);
L.push(``);
L.push(`Morning Danny. Here's where we stand.`);
L.push(``);
L.push(`## 💰 Money`);
L.push(`- Active affiliate links: **${active.length}** · coverage **${coverage}%**`);
L.push(`- Earnings logged: **£${earned.toFixed(2)}** · owed to us: **£${owed.toFixed(2)}**`);
if (real.length) real.slice(-3).forEach((e) => L.push(`  - ${e.month} ${e.brand}: £${Number(e.amount).toFixed(2)}${e.claimed ? " (claimed)" : ""}`));
L.push(`- Clicks/sign-ups: ${process.env.VITE_GA_MEASUREMENT_ID ? "see GA4" : "_connect GA4 to see click + signup numbers here_"}`);
L.push(``);
L.push(`## 📝 Content (last 24h)`);
if (changed.length) changed.forEach((c) => L.push(`- ${c.replace("src/content/", "")}`));
else L.push(`- No content changes logged.`);
L.push(``);
L.push(`## 📣 Posting today (${sq.posts.length})`);
if (sq.posts.length) sq.posts.forEach((p) => L.push(`- [${p.kind}] ${p.url}`));
else L.push(`- Queue not generated yet.`);
L.push(``);
L.push(`## 🎯 Needs you`);
L.push(`- ${toSignup} affiliate programs still to sign up for (see the signup email).`);
const verify = aff.filter((a) => /verify/i.test(a.notes || ""));
if (verify.length) verify.forEach((v) => L.push(`- Verify link: ${v.brand} — ${v.notes}`));
L.push(``);
if (notes) { L.push(`## 🔎 Research notes`); L.push(notes); L.push(``); }
L.push(`— Your marketing master 🐾`);

mkdirSync(`${ROOT}/marketing-ops/reports`, { recursive: true });
writeFileSync(`${ROOT}/marketing-ops/reports/${today}.md`, L.join("\n") + "\n");
console.log(L.join("\n"));
