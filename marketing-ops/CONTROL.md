# 🧭 CONTROL — read me FIRST every session

Single source of truth for the CryptoWatchdog marketing/SEO/money mission.
Sessions are ephemeral; this file is the memory. **Read this, act, then UPDATE it.**
Deep context: `cw-content-brain/MARKETING_OPERATING_MODEL.md` · Build status: `marketing-ops/SITE_BUILD_PLAN.md`.

_Last updated: 2026-06-17 — LIVE on cryptowatchdog.net via GitLab+Cloudflare_

## Mission (one line)
Make CryptoWatchdog money via evidence-led content, SEO, links, images, social and affiliates. Not a charity. Never monetise scams. Quality bar: 2,000+ words, images, internal + external/citation links, FAQ, schema. Rank by evidence, never commission.

## 🎯 PRODUCT VISION — the 4 reasons people come (canonical, Danny 2026-06-17)
People should visit **daily**. Four pillars:
1. **DAILY NEWS.** Crypto headlines refreshed every day, each with our safety-first "Watchdog take." (`/news` live: live keyless API + curated fallback + homepage strip.)
2. **TOTAL REVIEW COVERAGE.** Review *every* crypto site / exchange / wallet / bot / trader / NFT platform / casino out there. The dream: a user can **search our site for ANY crypto entity** and find our trust-scored verdict (🟢/🟠/🔴 + 0–100 score). → **Needs site SEARCH (not built — high priority).** Keep adding reviews forever.
3. **DAILY OFFERS / FREEBIES.** Airdrops, free drops, free NFTs, sign-up bonuses — and soon crypto betting/casino. Refreshed daily, shown on homepage + relevant category pages (e.g. NFT page). Only vetted / non-red platforms; add affiliate links where we have them. (`/freebies` live + homepage strip.)
4. **HONESTY / SCAM PREVENTION.** People trust us because we're honest and help them avoid scammers. Never monetise red-rated/scam platforms.
Cross-cutting: **news + offers should link to our own content** (reviews, guides) where appropriate.

## 🔁 DAILY OPERATING ROUTINE (the agent's job, every day)
1. **Scan the net** for: (a) fresh crypto news → refresh `/news`; (b) daily offers/airdrops/free NFTs → refresh `/freebies` + relevant category pages; (c) **new crypto sites/traders/platforms worth reviewing**.
2. **New sites:** create a trust-scored, evidence-led review AND **flag the good ones to Danny** so he can secure affiliate deals (email-driven affiliate workflow). He signs up + returns links → agent wires them in.
3. Keep grinding **EEAT rewrites** of weak articles (worst-first, parallel agents).
4. Add **internal links** from news/offers into our content where appropriate.
5. **Verify visually** before claiming done (screenshot pipeline — see Tooling).

## Current state (live)
- **Repo: GitLab** `gitlab.com/dannythehat2/crypto-watchdog` (GitHub ABANDONED — was suspended/Actions-disabled). Push via `gitlab` remote → `main`.
- **Deploy: GitLab CI → Cloudflare** (`.gitlab-ci.yml`: npm build + `npx wrangler deploy`). CI var `CLOUDFLARE_API_TOKEN` (Edit-Workers token). Account `a517d133ccec0093de719211a6694951`. Push to `main` = auto-deploy (~2 min). Verify via GitLab pipeline API.
- **Live: https://cryptowatchdog.net** (Cloudflare Worker `crypto-watchdog`, custom domain connected, DNS on Cloudflare, registrar Namecheap).
- **Content source of truth:** `src/content/` (repo-as-CMS). Edit file = publish next deploy.
- **Sandbox egress is allowlisted:** gitlab.com + github.com + npm reachable; Cloudflare API, the live domain, pollinations.ai, cryptocurrency.cv, Google Fonts, Playwright CDN are BLOCKED from sandbox. (So AI images / live news only render in the *visitor's* browser, not mine.)

## 🧱 What's BUILT (2026-06-17 big build)
- **13 category hub pages** via `src/content/hubs.ts` + `CategoryHub.tsx` (route `/:hubSlug`): ai-finance, crypto-exchanges, crypto-wallets, copy-trading, defi-platforms, crypto-trading-bots, **tokenized-assets, nft-marketplaces, crypto-cards, blockchains, crypto-staking, cloud-mining, crypto-recovery**. Each: endorsed/caution/avoid PlatformCards (trust rings + affiliate CTAs), FAQ, schema, AI hero image. PLUS the flagship **/crypto-casinos** (bespoke `CryptoCasinos.tsx` = the premium TEMPLATE: featured pick + comparison table w/ Welcome-Offer column + Claim CTAs + responsible-gambling box w/ mascot speech bubble + help-org links). `casinos.ts` keeps offer text updatable while `affiliateUrl` stays stable.
- **Deferred hubs:** Airdrops (= Freebies/offers system), Stablecoins (= guide cluster). Next: roll the casino-template polish (featured pick, comparison table, offers/claim CTAs) across the 13 CategoryHub pages.
- **Hub buyer's guides:** every hub has a 1,100+ word expandable SEO guide in `src/content/hub-guides/<slug>.md` (loaded via `getHubGuide`, rendered in a "Read the full guide" expander). Template now matches casino page (featured pick + comparison table + type-groups + methodology + guide). Page keyword map is in each hub's `keyword`/`metaTitle`. Easiest ranking wins = scam/safety pages (cloud-mining, crypto-recovery, AI scams); "best X" pages are competitive → lean on long-tail + trust-score USP.
- **/news** — live feed via free keyless API `cryptocurrency.cv/api/news` (`src/hooks/useLiveNews.ts`, crypto-filtered, falls back to curated `src/content/news.ts`). Homepage strip + nav.
- **/freebies** — vetted offers (`src/content/offers.ts`, `OfferCard`). Homepage strip + nav.
- **Visual system:** `AuroraBackdrop` (animated, optional Pollinations FLUX hero image at low opacity w/ CSS fallback), `WatchdogMascot` (SVG, moods approve/caution/alert/scan). Homepage category grid uses distinct lucide icons (NOT repeated mascots).
- **Rating labels:** "Trusted / Caution / High Risk" (was the meme-y "Seems Legit" — killed).
- **Blogs:** ~117. ~95 pass EEAT after this session's waves (12 rewritten today). Duplicate Telegram post unpublished.
- **Affiliates (10):** Kraken, Bitget, Binance, Cryptohopper, Kinesis, Ledger, Trezor, Tangem, MoneyFlare(BLOCKED-scam), Aurum.

## 🛠️ Tooling — SCREENSHOT-VERIFY before claiming visual work done
- Headless Chromium works in-sandbox via npm-bundled binary (Playwright CDN is blocked):
  `npm i -D @sparticuz/chromium@149 puppeteer-core@24` (devDeps reverted after use to keep CI lean).
- Serve built site: run `npx vite preview --port 4173 --host 127.0.0.1` as a **background** task (dies if run foreground).
- Screenshot scripts: `_shotsec.mjs` (per-section, clean), `_shot3.mjs` (dark-mode fullpage). gitignored (`_*.mjs`).
- ⚠️ fullPage capture + heavy `blur-[120px]` = blank-gap artifact; capture per-section or per-viewport instead. Emulate `prefers-color-scheme: dark` (site default for users is dark).

## 🌙 OVERNIGHT JOB (2026-06-17, Danny → "redo all articles, don't stop")
Redo ALL 109 published blogs in the CALMER house voice (`VOICE.md`) + full EEAT:
2,000+ words, primary keyword, 3+ real external citations, 3+ internal links, a
"## Frequently asked questions" section, and at least ONE markdown comparison
TABLE each. Worst/thinnest first (see `node` inventory). Process in waves of ~8
parallel agents; commit+push after each wave (`git add src/content/blog/` → push
gitlab HEAD:main). DON'T STOP until all done. Visuals: tables (verified) + hero
image_url; "graphs" = data tables; do NOT use blind AI images (must be able to
review). Watch cannibalisation in the scam/seed-phrase/token-vetting clusters —
give each a distinct keyword; flag true dupes for Danny (don't unpublish without OK).
THEN: screenshot EVERY article via the puppeteer pipeline and review each — nothing
ships unless it's genuinely good. Report progress each milestone.

## ▶️ Next actions (priority)
1. **SITE SEARCH** (pillar #2) — search box → find our verdict for any platform. HIGH.
2. Keep EEAT rewrites worst-first (~20 thin blogs left). Fix `non-custodial-smart-contract` citations (agent miscounted).
3. **NFT hub/page** + wire offers to it. Then **crypto betting/casino** category (reviews + affiliates) — "another build soon."
4. Daily news/offers refresh (repo-driven commits; later a guarded automation).
5. GA4 ID (`VITE_GA_MEASUREMENT_ID`) from Danny; Search Console access → submit sitemap.
6. Hero focal visual + reviews-list premium tiles + spacing/typography polish pass.

## 🧠 Key decisions (don't relitigate)
- **HOUSE VOICE is locked — see `marketing-ops/VOICE.md`. Write EVERYTHING to it** (witty with edge, human, British; roast scammers, never victims; banned AI-filler list). All content (hubs, guides, reviews, blog, warnings, homepage) is being humanised to this voice.
- **BRAND MASCOT = the CryptoWatchdog DOBERMAN dog** (BLUE/silver version, the correct brand colour — not the gold one). NEVER a robot. Self-hosted transparent PNG at `public/cryptowatchdog-logo.png`, served via `BRAND_IMG` in `WatchdogMascot.tsx` (used by navbar Logo, hero mascots, favicon, OG image, JSON-LD). Swap that one file to update everywhere.
- Repo-as-CMS (`src/content/`), Lovable phased out for content.
- Rank by FCA/safety/evidence, never affiliate commission. Never monetise red-rated/scam pages. No "guaranteed"/"risk-free", no price predictions.
- Hold content to 2k EEAT bar; retire dated/duplicate pages, never pad.
- Email-driven affiliate workflow: agent emails Danny programs → he signs up + returns links → agent wires in.
- Connectors chosen (keyless, wired into site directly, no setup): **Pollinations FLUX** (images), **Free Crypto News API** (news).
- **Verify visually (screenshot) before claiming visual work is done.** (Danny: "stop guessing.")
- Batch git commits sensibly (GitHub abuse-limit lesson); push to GitLab `main`.

## ⚠️ INCIDENT (2026-06-17): email spam from failing Actions
3 scheduled workflows (morning-report, email-digest, social-daily) FAILED without secrets → GitHub emailed a failure notice each run → mass emails to Danny. **All 3 DELETED.** LESSON: never add scheduled workflows that can fail without secrets; `secrets` context is NOT valid in `if:`; reintroduce automation only as ONE guarded `workflow_dispatch` after secrets exist + Danny approves.

## 🗂️ Where things live
- Content: `src/content/{blog,reviews,warnings}/*.md`, `categories.json`, `hubs.ts`, `news.ts`, `offers.ts`
- Affiliates: `src/content/affiliates.json` · ops: `cw-content-brain/affiliate-ops/`
- Plans/logs: `marketing-ops/` (SITE_BUILD_PLAN.md, content-plan.md, keyword-research.md)
- Components: `src/components/` (Markdown, Seo, AuroraBackdrop, WatchdogMascot, PlatformCard, OfferCard, NewsCard, RatingBadge)
- SEO: `src/lib/seo.ts`

## 🌙 OVERNIGHT PROGRESS (2026-06-17 ~23:00)
- DONE (full EEAT redo + calmer voice + table, committed/live): wave 1 (8) + wave 2 (8) = 16 blogs. Plus earlier: 13 hub guides + 6 blogs humanised+toned. Homepage humanised.
- **MoneyFlare FIXED** (Danny flagged): review flipped green/95 → RED/8, removed from /ai-finance trusted, scam warning surfaced, ALL promo + affiliate link + rich_content blob stripped. Was actively promoting a debunked scam — now safe.
- REMAINING: ~61 published blogs still need the calmer-voice/humanise pass (most already pass EEAT + have tables; keep their citations/tables, just rewrite prose to VOICE.md). Get next list via the `node` "remaining" inventory (filter updated_at != 2026-06-17).
- ⚠️ SHARED USAGE/SESSION LIMIT hit ~22:50 UTC (resets ~23:40 UTC / "11:40pm UTC"). 3 subagents were cut off at the end but their files were saved. If new agents fail with "session limit", PAUSE launches and resume after reset.
- Workflow per article: agent reads VOICE.md, rewrites body in calmer voice, keeps facts/links/citations/tables/FAQ/keyword, >=2000 words, zero banned phrases; commit `git add src/content/blog/` → push gitlab HEAD:main.
- STILL TODO after blogs: screenshot-review every article; humanise hub intros+FAQs (hubs.ts) + casino page copy; fix broken internal link in due-diligence blog (/blog/how-to-vet-a-new-crypto-token → real slug ...-launch-and-avoid-getting-rekt-2026-04-29).

## ✅ CONTENT REDO COMPLETE (2026-06-18)
- ALL published blogs redone in calmer house voice (VOICE.md) + full EEAT. Quality sweep: 101 published, 0 issues (2000+ words, comparison table, citations, links, FAQ, zero banned/AI-filler each).
- DEDUP done: 8 near-dup programmatic-SEO blogs unpublished + 301-redirected to strongest sibling (see public/_redirects). 109 → 101 non-competing posts.
- MoneyFlare: review red/8, off AI-Finance trusted, scam warning surfaced, all promo/affiliate stripped.
- NO CRON exists. /news = live client-side fetch (auto, cryptocurrency.cv, curated fallback in news.ts). /freebies offers = STATIC (offers.ts) — only change on commit. Danny chose "leave as-is for now" (2026-06-18) — do NOT build automation unless asked.
- NEXT (when asked): GA4 (`VITE_GA_MEASUREMENT_ID`), Search Console + submit sitemap, casino affiliates (email Danny signup links), SITE SEARCH (pillar #2), roll casino-template polish across hubs, screenshot spot-checks.

## ✅ AURUM NEYRO ARTICLE PUBLISHED + SITE-WIDE IMAGE/LINK FIXES (2026-06-18)
- **Aurum Neyro investigation LIVE**: `/blog/aurum-neyro-bot-review-is-aurum-a-scam` — Danny's first-hand, evidence-led review (BscScan payment, ~38.7M paying wallet, PancakeSwap V3 Burn/Collect, BSC-USD, Hacken audit + SolidityScan 95.88). Facts/verdict kept as Danny wrote them; only house voice + structure added. Has evidence table, Hacken findings graphic, verified/unverified panels, FAQ, sources, Aurum CTAs + classroom invite ("sign up, say 'Danny invited me'"). Wired into /ai-finance, /copy-trading, /crypto-trading-bots relatedPosts + aurum-foundation review + sitemap.
- **16 supplied assets → /public/aurum/**: phone chrome + competitor ad bands cropped off BscScan shots; each framed as a browser-window evidence exhibit. Crop tool = bundled @sparticuz/chromium canvas (no sharp/imagemagick in sandbox). Screenshot review = tiled viewport capture (puppeteer fullPage repeats the fixed navbar — DON'T use fullPage; tile by scroll instead).
- **RENDERER UPGRADE**: `src/components/Markdown.tsx` now renders trusted block-level HTML (figures/CTA cards/panels) instead of escaping it. Tailwind config now scans `src/content/**` so classes used only in markdown are generated. This is why HTML cards in older articles/reviews finally render.
- **FIXED 32 broken images** across 7 old articles (heroes repointed to real assets; some inline remapped to real /aurum/ images; rest + their figure/caption blocks removed). 0 broken images remain site-wide.
- **FIXED internal links site-wide** (193 across 72 files): /categories/* → root hub slugs; renamed blog/warning slugs corrected; never-built pages (/education, /ai-evaluator, /scam-guides, /token-checker, /comparisons, /methodology, /editorial-policy, /affiliate-disclosure, /rwa-tokenization, /contact) → nearest real route. Validator: 0 broken (only a /reviews/some-slug example in a README remains, not rendered).
- **Aurum affiliate** record updated to backoffice referral link `https://backoffice.aurum.foundation/u/PKK5U0` + classroom note. NOTE: these never-built pages (methodology/editorial-policy/affiliate-disclosure/scam-guides/education/ai-evaluator/token-checker/comparisons) are STILL not real routes — repointed for now; build them when asked.
