// Affiliate status auditor. Reports monetisation coverage, programs to apply
// for, stale link checks, and earnings — so we can see at a glance where money
// is being left on the table and what we're owed.
//
// Run from repo root: node cw-content-brain/scripts/audit_affiliates.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const affiliates = JSON.parse(readFileSync(`${ROOT}/src/content/affiliates.json`, "utf8"));
const ledgerPath = `${ROOT}/cw-content-brain/affiliate-ops/ledger.json`;
const ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, "utf8")) : { entries: [] };

const STALE_DAYS = 30;
const daysSince = (d) => (d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : Infinity);

const monetisable = affiliates.filter((a) => a.status !== "blocked");
const active = affiliates.filter((a) => a.status === "active" && a.affiliateUrl);
const gaps = affiliates.filter((a) => a.status !== "active" && a.status !== "blocked");
const knownGaps = gaps.filter((a) => a.hasKnownProgram);
const stale = active.filter((a) => daysSince(a.lastChecked) > STALE_DAYS);
const coverage = monetisable.length ? Math.round((active.length / monetisable.length) * 100) : 0;

const earned = ledger.entries.reduce((s, e) => s + (Number(e.amount) || 0), 0);
const claimed = ledger.entries.filter((e) => e.claimed).reduce((s, e) => s + (Number(e.amount) || 0), 0);
const owed = earned - claimed;

const L = [];
L.push(`# Affiliate Status — live dashboard`);
L.push(`Updated ${new Date().toISOString()} · run \`node cw-content-brain/scripts/audit_affiliates.mjs\``);
L.push("");
L.push(`| Metric | Value |`);
L.push(`|---|---|`);
L.push(`| Monetisable platforms (non-red) | ${monetisable.length} |`);
L.push(`| **Active** (earning links live) | **${active.length}** |`);
L.push(`| Monetisation coverage | **${coverage}%** |`);
L.push(`| Known programs not yet signed up | ${knownGaps.length} |`);
L.push(`| Links overdue a check (>${STALE_DAYS}d) | ${stale.length} |`);
L.push(`| Earnings logged | ${earned.toFixed(2)} |`);
L.push(`| Claimed | ${claimed.toFixed(2)} |`);
L.push(`| **Outstanding (owed to us)** | **${owed.toFixed(2)}** |`);
L.push("");

L.push(`## 🎯 Apply for these (known programs, ranked)`);
const order = { "centralized-exchanges": 0, "crypto-brokers": 1, "hardware-wallets": 2, "grid-dca-bots": 3, "copy-trading": 4, "custodial-wallets": 5 };
knownGaps.sort((a, b) => (order[a.category] ?? 9) - (order[b.category] ?? 9));
L.push(`| Brand | Category | Apply at | Status |`);
L.push(`|---|---|---|---|`);
for (const a of knownGaps) L.push(`| ${a.brand} | ${a.category ?? "-"} | ${a.signupUrl || "_find program_"} | ${a.status} |`);
L.push("");

if (stale.length) {
  L.push(`## ⏰ Re-check these live links`);
  for (const a of stale) L.push(`- ${a.brand} — last checked ${a.lastChecked ?? "never"}`);
  L.push("");
}

L.push(`## ✅ Active programs`);
if (active.length) for (const a of active) L.push(`- ${a.brand} (${a.network || "?"}, ${a.commissionType || "?"})`);
else L.push(`_None yet — this is why revenue is £0. Apply for the programs above and paste the affiliate URLs into src/content/affiliates.json (set status: "active")._`);
L.push("");

mkdirSync(`${ROOT}/cw-content-brain/affiliate-ops`, { recursive: true });
writeFileSync(`${ROOT}/cw-content-brain/affiliate-ops/STATUS.md`, L.join("\n") + "\n");
console.log(L.join("\n"));
