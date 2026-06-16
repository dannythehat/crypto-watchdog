# 🧭 CONTROL — read me FIRST every session

Single source of truth for the CryptoWatchdog marketing/SEO/money mission.
Sessions are ephemeral; this file is the memory. **Read this, act, then UPDATE it.**
Deep context: `cw-content-brain/MARKETING_OPERATING_MODEL.md`.

_Last updated: 2026-06-16 (overnight content sprint)_

## Mission (one line)
Make CryptoWatchdog money via evidence-led content, SEO, links, images, social and affiliates. Not a charity. Never monetise scams. Quality bar: 2,000+ words, images, internal + external/citation links, FAQ, schema. Rank by evidence, never commission.

## Current state (live)
- **Hosting:** Cloudflare (auto-deploys from GitHub `main`). Live URL: crypto-watchdog.<sub>.workers.dev. Domain `cryptowatchdog.net` NOT yet connected.
- **Content source of truth:** `src/content/` (repo-as-CMS). Edit file = publish on next deploy.
- **Blogs:** ~109 published. ~34 pass EEAT. ~15 deep rewrites shipped (waves 1-3). ~75 still to rewrite, worst-first.
- **New money-pages live:** Ledger vs Trezor, Best Crypto Exchange UK, RWA Tokenization (gold/silver/real estate).
- **Affiliates live (10, ~19% coverage):** Kraken, Bitget, Binance, Cryptohopper, Kinesis, Ledger, Trezor, Tangem, MoneyFlare, Aurum. (Kraken link = verify it's the paying affiliate.)

## 🚧 Active blockers
1. **GitHub account suspended / GitHub status RED (2026-06-16 eve).** Cannot push/merge. 3 commits queued locally (Kinesis, smart-contract pass, sitemap/robots). Resolve via support.github.com appeal OR wait for outage to clear, then push.
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
