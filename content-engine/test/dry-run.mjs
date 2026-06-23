// Content Automation Engine — offline dry-run (doc 06 Phase 1 "Acceptance").
//
// Runs with NO network, NO Cloudflare, NO wrangler. It loads the REAL schema.sql
// and seed.sql into an in-memory SQLite DB (node:sqlite, Node 22+) and asserts the
// non-negotiable compliance gates from doc 05 against the SAME gates.js the Worker
// and dashboard use. This is the proof the machinery is correct before ignition.
//
//   Run: node --experimental-sqlite content-engine/test/dry-run.mjs
//
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  canApprove,
  canPublish,
  resolvePublishableAffiliates,
  parseVerdict,
} from "../src/lib/gates.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

let passed = 0;
let failed = 0;
const fails = [];
function check(name, cond) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; fails.push(name); console.log(`  ✗ ${name}`); }
}

// ── Load schema + seed into an in-memory DB ────────────────────────────────
const db = new DatabaseSync(":memory:");
db.exec(readFileSync(path.join(root, "schema.sql"), "utf8"));
db.exec(readFileSync(path.join(root, "seed.sql"), "utf8"));

const getItem = (id) =>
  db.prepare("SELECT * FROM content_queue WHERE id = ?").get(id);
const affiliatesById = Object.fromEntries(
  db.prepare("SELECT * FROM affiliates").all().map((a) => [a.id, a]),
);

console.log("\n[1] Schema + seed load");
check("brands table seeded (2 brands)",
  db.prepare("SELECT COUNT(*) n FROM brands").get().n === 2);
check("Little Tiny Treasures is OFF (is_active=0)",
  db.prepare("SELECT is_active FROM brands WHERE id='littletinytreasures'").get().is_active === 0);
check("Crypto Watchdog is ON (is_active=1)",
  db.prepare("SELECT is_active FROM brands WHERE id='cryptowatchdog'").get().is_active === 1);
check("queue seeded with 4 PENDING_REVIEW items",
  db.prepare("SELECT COUNT(*) n FROM content_queue WHERE status='PENDING_REVIEW'").get().n === 4);
check("affiliates seeded INACTIVE (none active)",
  db.prepare("SELECT COUNT(*) n FROM affiliates WHERE is_active=1").get().n === 0);

console.log("\n[2] Approval gates (doc 03 / doc 05)");
// Warning: no affiliate, no verdict needed → approvable.
check("warning (no affiliate) is APPROVABLE",
  canApprove(getItem("q_seed_warning_1")).ok === true);
// News: low-risk, no affiliate → approvable.
check("news (no affiliate) is APPROVABLE",
  canApprove(getItem("q_seed_news_1")).ok === true);
// Review with planned affiliate, no verdict → NOT approvable (needs verdict).
check("review WITHOUT verdict is NOT approvable",
  canApprove(getItem("q_seed_review_1")).ok === false);
// Deal with planned affiliate, disclosure not applied → NOT approvable.
check("deal with affiliate but no disclosure is NOT approvable",
  canApprove(getItem("q_seed_deal_1")).ok === false);

console.log("\n[3] RED verdict strips affiliate links (doc 05 firewall)");
// Simulate setting a RED verdict on the review.
db.prepare("UPDATE content_queue SET human_verdict=? WHERE id=?")
  .run(JSON.stringify({ rating: "RED", note: "withdrawal issues" }), "q_seed_review_1");
{
  const item = getItem("q_seed_review_1");
  check("RED verdict parses", parseVerdict(item)?.rating === "RED");
  check("RED verdict → ZERO publishable affiliate links",
    resolvePublishableAffiliates(item, affiliatesById).length === 0);
}

console.log("\n[4] Trust threshold + active-affiliate gate");
// Set GREEN verdict, but affiliate still INACTIVE → still no links.
db.prepare("UPDATE content_queue SET human_verdict=? WHERE id=?")
  .run(JSON.stringify({ rating: "GREEN", note: "passed" }), "q_seed_review_1");
check("GREEN verdict but INACTIVE affiliate → still ZERO links",
  resolvePublishableAffiliates(getItem("q_seed_review_1"), affiliatesById).length === 0);
// Activate the affiliate (simulating Danny switching it on later).
const affActive = { ...affiliatesById };
affActive["aff_cw_cloudbet"] = { ...affiliatesById["aff_cw_cloudbet"], is_active: 1 };
check("GREEN verdict + ACTIVE affiliate (GREEN min_trust) → 1 link survives",
  resolvePublishableAffiliates(getItem("q_seed_review_1"), affActive).length === 1);
// ORANGE verdict fails the GREEN min_trust threshold.
db.prepare("UPDATE content_queue SET human_verdict=? WHERE id=?")
  .run(JSON.stringify({ rating: "ORANGE", note: "ok-ish" }), "q_seed_review_1");
check("ORANGE verdict < GREEN min_trust → link does NOT survive",
  resolvePublishableAffiliates(getItem("q_seed_review_1"), affActive).length === 0);

console.log("\n[5] Publish gates (doc 05 hard gates)");
// Reset review to GREEN + APPROVED but WITHOUT disclosure → must be blocked.
db.prepare("UPDATE content_queue SET human_verdict=?, status='APPROVED', disclosure_applied=0 WHERE id=?")
  .run(JSON.stringify({ rating: "GREEN", note: "passed" }), "q_seed_review_1");
check("APPROVED review w/ surviving link but NO disclosure → publish BLOCKED",
  canPublish(getItem("q_seed_review_1"), affActive).ok === false);
// Apply disclosure → now publishable.
db.prepare("UPDATE content_queue SET disclosure_applied=1 WHERE id=?").run("q_seed_review_1");
check("APPROVED review w/ surviving link + disclosure=1 → publish ALLOWED",
  canPublish(getItem("q_seed_review_1"), affActive).ok === true);
// A non-APPROVED item can never publish.
check("PENDING_REVIEW item is NOT publishable",
  canPublish(getItem("q_seed_news_1"), affActive).ok === false);
// Warning with no affiliate, once APPROVED, publishes without a disclosure requirement.
db.prepare("UPDATE content_queue SET status='APPROVED' WHERE id=?").run("q_seed_warning_1");
check("APPROVED warning (no affiliate) → publish ALLOWED (no disclosure needed)",
  canPublish(getItem("q_seed_warning_1"), affActive).ok === true);

console.log("\n[6] Status lifecycle persists");
db.prepare("UPDATE content_queue SET status='PUBLISHED', published_at=datetime('now') WHERE id=?")
  .run("q_seed_warning_1");
check("status transition to PUBLISHED persists",
  getItem("q_seed_warning_1").status === "PUBLISHED");
db.prepare(
  "INSERT INTO publish_log (id, queue_id, brand_id, channel, result, detail) VALUES (?,?,?,?,?,?)",
).run("plog_1", "q_seed_warning_1", "cryptowatchdog", "website", "OK", "dry-run");
check("publish_log row writes",
  db.prepare("SELECT COUNT(*) n FROM publish_log").get().n === 1);

db.close();

console.log(`\n──────────────────────────────\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("FAILED:", fails.join("; "));
  process.exit(1);
}
console.log("ALL ACCEPTANCE CHECKS PASSED ✅ (machinery only — nothing published)");
