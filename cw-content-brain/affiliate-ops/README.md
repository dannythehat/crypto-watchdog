# Affiliate Operations

The goal: turn traffic into revenue, track every click, and never leave owed money unclaimed.

## How money flows
1. Content has CTAs (`<AffiliateCTA>` / the review "Visit" button) → they point at **`/go/<id>`**.
2. `/go/<id>` fires a GA4 `affiliate_click` event, then redirects to the affiliate URL.
3. The reader signs up / buys → the network credits us.
4. We log earnings in `ledger.json` and reconcile against each network dashboard.

## The three files
| File | Purpose |
|---|---|
| `src/content/affiliates.json` | The live registry. One entry per platform. Set `affiliateUrl` + `status:"active"` to switch monetisation on. |
| `affiliate-ops/ledger.json` | Earnings log (per month/network) — drives the "owed to us" figure. |
| `affiliate-ops/STATUS.md` | Auto-generated dashboard (`node cw-content-brain/scripts/audit_affiliates.mjs`). |

## To switch a program ON
1. Apply via the program's `signupUrl` (see STATUS.md "Apply for these").
2. When approved, copy your tracking link into the matching entry in `affiliates.json`:
   ```json
   { "id": "binance", "status": "active", "affiliateUrl": "https://accounts.binance.com/register?ref=YOURCODE",
     "network": "Binance", "commissionType": "Up to 50%", "lastChecked": "2026-06-16" }
   ```
3. Push. Every CTA for that brand is now live and tracked.

## Rules (non-negotiable, brand safety)
- **Never monetise red-rated platforms or warning pages** (`status:"blocked"`, enforced in code).
- Every CTA shows a disclosure (built into `<AffiliateCTA>`).
- Disclose, don't deceive. Ratings are never influenced by commissions.

## Cadence
- **Weekly:** run the auditor; check for dead/expired links (`lastChecked`), add new high-intent content CTAs.
- **Monthly:** log earnings from each network dashboard into `ledger.json`; mark `claimed:true` once paid; chase anything outstanding.
- **Quarterly:** review commission rates; drop underperformers; add new programs.

## Why this exists
Revenue to date: **£0**, with **0% monetisation coverage**. 50 non-red platforms are reviewed; none had a live affiliate link. The fastest path to first revenue is applying for the ranked programs in STATUS.md and pasting the links in.
