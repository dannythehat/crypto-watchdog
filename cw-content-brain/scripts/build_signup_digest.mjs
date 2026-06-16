// Builds the email-ready "affiliate programs to sign up for" digest from the
// live registry, plus an earnings summary from the ledger. Output is what the
// email Action sends to Danny. Run: node cw-content-brain/scripts/build_signup_digest.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const aff = JSON.parse(readFileSync(`${ROOT}/src/content/affiliates.json`, "utf8"));
const ledgerPath = `${ROOT}/cw-content-brain/affiliate-ops/ledger.json`;
const ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, "utf8")) : { entries: [] };

const toApply = aff.filter((a) => a.status === "needs_signup" && a.signupUrl);
const order = { "centralized-exchanges": 0, "crypto-brokers": 1, "hardware-wallets": 2, "grid-dca-bots": 3, "copy-trading": 4, "custodial-wallets": 5 };
toApply.sort((a, b) => (order[a.category] ?? 9) - (order[b.category] ?? 9) || a.brand.localeCompare(b.brand));

const real = ledger.entries.filter((e) => !e._example);
const earned = real.reduce((s, e) => s + (Number(e.amount) || 0), 0);
const owed = earned - real.filter((e) => e.claimed).reduce((s, e) => s + (Number(e.amount) || 0), 0);

const L = [];
L.push(`# CryptoWatchdog — affiliate sign-up list`);
L.push(`Generated ${new Date().toISOString().slice(0, 10)}`);
L.push(``);
L.push(`Hi Danny — please sign up to the programs below (ranked by earning potential).`);
L.push(`For each one: open the link, apply, then send me your tracking link and I'll wire it into the site. The moment you do, that platform's CTAs start earning.`);
L.push(``);
L.push(`## Sign up for these (${toApply.length})`);
L.push(``);
toApply.forEach((a, i) => {
  L.push(`### ${i + 1}. ${a.brand}`);
  L.push(`- **Apply:** ${a.signupUrl}`);
  L.push(`- **Commission:** ${a.commissionType || "TBC"}`);
  if (a.notes) L.push(`- **Note:** ${a.notes}`);
  L.push(`- **Reply with:** your ${a.brand} affiliate/tracking link`);
  L.push(``);
});
L.push(`## Money status`);
L.push(`- Earnings logged: £${earned.toFixed(2)}`);
L.push(`- Outstanding (owed to us): £${owed.toFixed(2)}`);
L.push(``);
L.push(`Once you've applied to a few, reply with the links — I'll do the rest.`);

mkdirSync(`${ROOT}/marketing-ops/inbox`, { recursive: true });
writeFileSync(`${ROOT}/marketing-ops/inbox/affiliates-to-signup.md`, L.join("\n") + "\n");
console.log(`Digest written: ${toApply.length} programs to sign up for.`);
