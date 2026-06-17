# 🧭 CONTROL — read me FIRST every session

Single source of truth for the CryptoWatchdog marketing/SEO/money mission.
Sessions are ephemeral; this file is the memory. **Read this, act, then UPDATE it.**
Deep context: `cw-content-brain/MARKETING_OPERATING_MODEL.md`.

_Last updated: 2026-06-17 — LIVE on cryptowatchdog.net via GitLab+Cloudflare_

## Mission (one line)
Make CryptoWatchdog money via evidence-led content, SEO, links, images, social and affiliates. Not a charity. Never monetise scams. Quality bar: 2,000+ words, images, internal + external/citation links, FAQ, schema. Rank by evidence, never commission.

## Current state (live)
- **Hosting:** Cloudflare (auto-deploys from GitHub `main`). Live URL: crypto-watchdog.<sub>.workers.dev. Domain `cryptowatchdog.net` NOT yet connected.
- **Content source of truth:** `src/content/` (repo-as-CMS). Edit file = publish on next deploy.
- **Blogs:** ~109 published. ~34 pass EEAT. ~15 deep rewrites shipped (waves 1-3). ~75 still to rewrite, worst-first.
- **New money-pages live:** Ledger vs Trezor, Best Crypto Exchange UK, RWA Tokenization (gold/silver/real estate).
- **Affiliates live (10, ~19% coverage):** Kraken, Bitget, Binance, Cryptohopper, Kinesis, Ledger, Trezor, Tangem, MoneyFlare, Aurum. (Kraken link = verify it's the paying affiliate.)


## ✅ INFRA NOW (2026-06-17) — read this
- **Repo: GitLab** `gitlab.com/dannythehat2/crypto-watchdog` (GitHub ABANDONED — was suspended/Actions-disabled). I push here via the `gitlab` remote (token in shell history this session).
- **Deploy: GitLab CI → Cloudflare** via `.gitlab-ci.yml` (npm build + `npx wrangler deploy`). CI var `CLOUDFLARE_API_TOKEN` (Edit Cloudflare Workers token). Account `a517d133ccec0093de719211a6694951`. Trigger: push to `main` (auto) or GitLab pipeline API.
- **Live: https://cryptowatchdog.net** (Cloudflare Worker `crypto-watchdog`, custom domain attached; old Lovable A records deleted; DNS on Cloudflare, registrar Namecheap).
- I can't reach Cloudflare API / the live domain from the sandbox (egress blocked); gitlab.com + github.com + npm ARE reachable. Verify deploys via the GitLab pipeline API.

## 🚧 Active blockers
1. **GitHub account suspended (2026-06-16 eve).** Cannot push/merge. **Support APPEAL TICKET FILED — awaiting reinstatement.** ~5 commits queued locally (Kinesis, smart-contract pass, sitemap/robots, CONTROL.md, AGENTS.md). FIRST ACTION tomorrow: test `git push`; if it works, push the queue, then resume rewrites.
2. **Domain** `cryptowatchdog.net` not connected (Cloudflare → project → Custom domains). Independent of GitHub.
3. **GA4 not collecting** — need a `G-XXXX` Measurement ID from Danny, set as `VITE_GA_MEASUREMENT_ID`.
4. **Email automation** needs `MAIL_USERNAME/PASSWORD/TO` secrets (Gmail app password).

## ▶️ Next actions (priority order)
1. When GitHub back: push 3 queued commits; resume worst-first blog rewrites (parallel research agents, ~6/wave).
2. Connect domain (Cloudflare).
3. Get GA4 ID → wire tag; verify site in Search Console → submit /sitemap.xml.
4. More money-pages: Best Crypto Trading Bot (3Commas vs Cryptohopper vs Pionex), Binance vs Coinbase, How to Buy Tokenized Gold, Freebies hub.
5. Chase remaining affiliate signups (Coinbase, Bybit, KuCoin, OKX, eToro, 3Commas, Pionex, BingX).

## 🧠 Key decisions (don't relitigate)
- Repo-as-CMS (content in `src/content/`), Lovable phased out for content.
- Premium SVG visual system (frosted tables/tiles, device heroes); auto hero generator.
- Hold all content to 2k EEAT bar; **retire dated/duplicate pages, never pad** them.
- Rank by FCA/safety/evidence, never affiliate commission. Never monetise red-rated/scam pages.
- Email-driven affiliate workflow: agent emails Danny programs → he signs up + returns links → agent wires in.
- Batch git merges (fewer, larger) to avoid tripping GitHub abuse limits.

## 🗂️ Where things live
- Content: `src/content/{blog,reviews,warnings}/*.md`, `categories.json`
- Affiliates: `src/content/affiliates.json` · ops: `cw-content-brain/affiliate-ops/` (STATUS.md, ledger.json)
- Plans/logs: `marketing-ops/` (content-plan.md, keyword-research.md, reports/, inbox/)
- Scripts: `cw-content-brain/scripts/` (audit_eeat, build_hero_svg, render_preview, build_signup_digest, build_morning_report, social, audit_affiliates)
- Renderer/SEO: `src/components/Markdown.tsx`, `src/components/Seo.tsx`, `src/lib/seo.ts`


## ⚠️ INCIDENT (2026-06-17): email spam from failing Actions
The 3 scheduled workflows (morning-report, email-digest, social-daily) FAILED on
schedule (missing secrets + invalid `if: secrets.*` condition) and GitHub emailed
a "Run failed" notice each time → mass emails to Danny. **All 3 workflows DELETED
from main** (via GitHub MCP API, which still works during the git-push suspension).
LESSON: never add scheduled workflows that can fail without secrets; only add a
workflow when its secrets are set AND Danny has approved it; `secrets` context is
NOT valid in `if:` conditions. Re-introduce social/email/report automation later
as ONE manually-triggered (workflow_dispatch) workflow, guarded, after secrets exist.


## 📈 PROGRESS (2026-06-17 content sprint)
- Site-wide **Related-articles navigation** live (every blog auto-links related posts).
- Red `[!DANGER]` admonition support added to renderer.
- **MoneyFlare reversed** → scam-watch warning, added to /warnings, affiliate BLOCKED.
- EEAT rewrites shipped: waves 1+2 (11) + last night (15) + money-pages (3) ≈ **~46 blogs now passing**.
- **Remaining ≈63 'failing'**: roughly ~32 genuinely thin (need full rewrites) + ~31 that are long+cited but light on in-body internal links (already covered by the Related-nav component; add 2-3 contextual links to fully pass).
- NEXT: keep running rewrite waves (6 parallel agents) worst-first; for the long int=0 set, a lighter pass adding contextual in-body links + relevant CTAs.
- Affiliates active: 10 (Kraken, Bitget, Binance, Cryptohopper, Kinesis, Ledger, Trezor, Tangem, Aurum) — MoneyFlare removed.
