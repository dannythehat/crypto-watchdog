# CryptoWatchdog Content Brain

## START HERE: Watchdog HQ Master Blueprint Lock

Future AI/Codex work must read these canonical docs before proposing or building new phases:

- [Watchdog HQ Master Blueprint](docs/WATCHDOG_HQ_MASTER_BLUEPRINT.md)
- [Watchdog HQ Build Roadmap Status](docs/WATCHDOG_HQ_BUILD_ROADMAP_STATUS.md)

These documents lock the Watchdog HQ vision, safety mode, lifecycle, department model, agent hierarchy, review workflow, and build roadmap/status tracker. If a future task conflicts with them, pause and ask Danny before building.

Validate the blueprint lock with:

```bash
npm run content:blueprint-lock-validate
```

Phase 1 creates a self-contained Node/TypeScript content operating layer for CryptoWatchdog. It defines the editorial model, risk language, content schemas, prompt templates, audit scripts, draft tooling, and review workflow needed to produce trustworthy drafts without touching the Lovable app or Supabase data.

Phase 1A upgrades discovery to sitemap-first crawling. CryptoWatchdog.net is a Vite/React/Supabase single-page app, so raw HTML fetches may return the React app shell rather than fully rendered article content. Sitemap URLs are still useful for inventory, SEO metadata checks, link reporting, and update planning, but full content analysis requires a read-only content snapshot or a later browser-rendered crawler. No Supabase writes are performed by this tool.

Phase 1B adds a read-only local content snapshot layer. The content brain can analyse Supabase-shaped JSON exports placed in `data/content_snapshot/` without connecting to Supabase, writing to Supabase, editing site content, or publishing anything.

Phase 1C adds an optional owner-controlled Supabase export helper. It is disabled by default, uses local environment variables only, exports configured tables into local JSON files, and never writes back to Supabase.

The audit reports now include confidence and false-positive-risk fields. Findings are possible issues, not confirmed defects, and should be triaged before any Priority Action Queue or content change is created.

The Priority Action Queue ranks possible fixes using confidence, false-positive risk, severity, issue type, and page-level combinations. It does not edit or publish anything.

Rendered Page Verifier v1 optionally checks live rendered React pages against queue findings so injected disclosures, links, metadata, and page components can reduce false positives before exact fixes are assigned. It does not edit pages, publish content, or write to Supabase.

Phase 2A adds a read-only Metadata Engine v1. It analyses local snapshot content and rendered verifier facts when available, then produces draft-only metadata suggestions for human review. It does not edit pages, publish content, write to Supabase, or verify claims.

Phase 2B adds a read-only Internal Link Placement Brain v1. It analyses local snapshot content and suggests draft-only internal link opportunities between reviews, blog posts, warnings, and category pages. It does not edit pages, publish content, or write to Supabase.

Phase 2C adds a read-only Affiliate Vault and Affiliate Placement Brain v1. It stores local owner-approved affiliate programme records and suggests draft-only affiliate placement opportunities with disclosure, expiry, and risk checks. It does not edit pages, publish content, write to Supabase, or add live affiliate links.

Phase 2D adds a read-only Offer Expiry / Deal Tracker v1. It reads the Affiliate Vault and classifies affiliate offers as current, expiring, expired, stale, paused, blocked, or needing review. It does not expose raw affiliate URLs, edit pages, publish content, or write to Supabase.

Phase 2E adds a read-only Search Console Connector v1. It imports local Google Search Console CSV/JSON exports, normalises SEO performance records, and suggests draft-only review opportunities without live Google authentication. It never writes to Google, Supabase, or live pages.

Phase 2F adds a read-only GA4 Analytics Connector v1. It imports local GA4 CSV/JSON exports, normalises page and engagement performance records, and suggests draft-only review opportunities without live Google authentication. It never writes to Google, Supabase, or live pages.

Phase 2G adds a read-only SEO Intelligence Brain v1. It combines local metadata, internal link, affiliate, offer, Search Console, GA4, and rendered verifier reports into a prioritised draft action queue. It never applies changes, writes to Supabase or Google, edits live pages, or publishes content.

Phase 2H adds a read-only Research & Duplicate Guard v1. It reviews proposed local content ideas against existing content snapshots before drafting, flags duplicate/cannibalisation/evidence risks, and never performs live web verification in v1.

Phase 2I adds a read-only Agent Registry v1. It maps the current and planned Watchdog HQ AI workforce into named agents, departments, hierarchy levels, reporting lines, responsibilities, allowed actions, blocked actions, and approval requirements. It is a report-only registry, not an execution system.

Phase 2J adds a read-only Master Command Queue v1. It combines available local reports into a Watchdog HQ morning dashboard for Danny, separating safe draft work, approval-needed work, blocked risks, monitor-only items, performance changes, money opportunities, and department manager summaries. It is report-only and never applies, approves, publishes, or edits live content.

Phase 2K adds a read-only Fix Draft Generator v1. It reads the Master Command Queue and supporting local reports to prepare safe draft-only fix suggestions, such as metadata drafts, internal link drafts, image alt text drafts, evidence checklists, research briefs, and approval-only affiliate CTA drafts. It never edits content, writes to Supabase, publishes, or creates live patches.

Phase 2L adds a read-only Preview Diff Engine v1. It reads Fix Draft Suggestions and local snapshot context to produce simulated textual previews of proposed changes before anything is approved or applied. It is preview-only/report-only and never creates patch files, update payloads, live edits, Supabase writes, or publishing actions.

Phase 2M adds a read-only Approval Queue v1. It turns preview diffs, draft suggestions, and command queue items into a local decision list for Danny. It is approval-planning only: it may recommend a decision type, but it never marks anything approved, applies changes, edits files, creates patches or update payloads, writes to Supabase, or publishes.

Phase 2N adds a read-only Master AI Manager Daily Brief v1. It reads the local Watchdog HQ reports and produces a plain-English executive summary of what matters today, including priorities, department manager briefs, risk notes, opportunity notes, and safe next actions. It is report-only and never approves, applies, publishes, edits live content, creates patches, creates update payloads, writes to Supabase, or calls APIs.

Phase 2O adds a read-only Quality Control Manager v1. It reviews local worker-agent and manager outputs before they reach Danny or the Master AI Manager, checking safety, usefulness, evidence, brand fit, duplication, approval flags, status stages, and manager-to-manager escalation needs. It is report-only and never approves, applies, publishes, edits live content, creates patches, creates update payloads, writes to Supabase, or calls APIs.

Phase 2P adds a read-only Manager Escalation Router v1. It formalises manager-to-manager routing inside Watchdog HQ so department managers can route items sideways before anything reaches Danny. It recommends routing only, keeps the Detected -> Suspected -> Verified -> Recommended -> Approved -> Applied model explicit, and never approves, applies, publishes, edits live content, creates patches, creates update payloads, writes to Supabase, or calls APIs.

Phase 2Q adds a read-only Daily Run Orchestrator v1. It runs the safe local planning/report commands in sequence so Danny does not need to manage each command manually. It excludes live crawlers, Supabase export, Search Console import, GA4 import, rendered verification, publishing, apply, and live-site commands, and it stops on the first failure.

Phase 2R adds a read-only Daily Report Pack Builder v1. It collects the key local Watchdog HQ reports into one Danny-ready daily pack for human review and future dashboard input. It summarises counts, statuses, priorities, top decision items, blocked/risky items, monitor-only items, and money opportunities without copying huge raw reports or approving/applying anything.

Phase 2S adds a read-only Dashboard Data Export Layer v1. It converts the Daily Report Pack into small local JSON files for future Watchdog HQ dashboard tabs. It is not the dashboard UI, and it never approves, applies, publishes, edits live content, creates patches, creates update payloads, writes to Supabase, or calls APIs.

Phase 2T adds a read-only Dashboard Contract Validator v1. It checks the local dashboard JSON files before any future dashboard UI reads them, validating required fields, safe approval/apply states, and URL safety. It is not the dashboard UI and never auto-fixes dashboard files.

Phase 2U adds a read-only Watchdog HQ Department Roadmap & Agent Coverage Map v1. It maps every major department/tab, current coverage, missing capabilities, planned manager agents, planned worker agents, dashboard data coverage, and recommended build order. It is planning-only and does not create functional agents or dashboard UI.

Phase 2V adds a local-only Watchdog HQ Dashboard Shell v1. It reads ignored dashboard JSON files from `data/dashboard/` and generates a static local HTML viewer at `data/local-dashboard/index.html`. It is not the live CryptoWatchdog website and does not touch the Lovable app, Supabase, or live website files.

Phase 2W adds a local-only Dashboard Launcher / Preview Runner + Smoke Test v1. It prints the local dashboard HTML path and ile:// URL for Danny, and adds a smoke test that checks the generated shell still shows the required read-only safety markers and no unsafe apply/publish/Supabase wording.

Phase 2X adds a local-only Dashboard UI Contract Guard v1. It validates the generated dashboard HTML text/section contract before Danny reviews it, confirms the read-only safety language is visible, and rejects unsafe approval/apply/publishing/Supabase markers. It is not browser automation and never touches the live website.

Source Watchlist v1 adds a read-only local planning/report layer for future Watchdog HQ source monitoring. It defines source categories, evidence value, risk, future manager routing, safety rules, escalation rules, and human approval requirements, but it does not crawl, fetch, scrape, monitor, publish, apply, edit live files, or write to Supabase.

Agent Output Contract v1 adds a read-only local contract for every future Watchdog HQ agent output. It defines the mandatory lifecycle, required fields, confidence rules, evidence rules, escalation rules, manager review rules, and blocked actions. In v1, agents may only output detected, suspected, verified, or recommended stages; approved and applied remain blocked.

Department Inbox / Task Router v1 adds a read-only local routing model for future Watchdog HQ agent outputs. It defines department manager inboxes, routing rules, escalation rules, and manager decision options so small tasks go to managers first while Quality Control, Master AI Manager, and Danny see only escalated or sensitive items.

Human Decision Log / Audit Trail v1 adds a read-only local audit model for future Watchdog HQ governance. It defines how future agent detections, manager reviews, QC blocks, Master AI recommendations, and Danny decisions should be recorded before any future Safe Apply Engine exists. It is planning/report-only and does not approve, apply, publish, edit live files, create a live audit database, or write to Supabase.

Base HQ Runbook v1 adds the local operating manual for the completed Watchdog HQ base structure. It documents the daily/reporting flow, dashboard flow, agent lifecycle, department routing, QC review, Master AI Manager filtering, Danny decision boundaries, audit trail, content blueprint principles, future connector rules, future worker agent rules, and future Safe Apply rules. It is planning/report-only and does not execute, approve, apply, publish, edit live files, create connectors, or write to Supabase.

Build #50 — Content Operations Command Centre v1 adds the central read-only planning layer for the Watchdog HQ content machine. It combines local report availability, content operation types, priority buckets, department routing, QC escalation rules, and Danny decision rules for new articles, refreshes, review rebuilds, SEO work, links, media, social planning, evidence gaps, affiliate disclosure review, and brand/formatting QA. Run it with `npm run content:ops-command` and validate it with `npm run content:ops-command-validate`. It is report-only and never edits live content, publishes, writes to Supabase, inserts affiliate URLs, calls AI/APIs, crawls live sources, creates patches/update payloads, generates/downloads/uploads media, changes trust ratings, or makes scam/fraud accusations.

Page Quality Profiler Agent v1 adds a read-only local page-quality triage layer. It profiles local snapshot pages for weak, thin, underdeveloped, unclear, stale, or badly structured content and recommends the next manager/blueprint review path. It produces reports only and never edits live content, publishes, writes to Supabase, changes trust ratings, inserts affiliate links, or runs live crawling/fetching.

Page Blueprint Agent v1 adds a read-only local structure-planning layer. It reads Page Quality Profiler outputs and translates page weaknesses into recommended page blueprints, required sections, evidence requirements, media requirements, internal-linking requirements, disclosure requirements, and risk/compliance notes. It produces reports only and never edits live content, publishes, writes to Supabase, changes trust ratings, inserts affiliate links, or runs live crawling/fetching.

Content Cluster / Related Sections Agent v1 adds a read-only local relationship-planning layer. It reads Page Quality Profiler and Page Blueprint Agent reports, optionally uses the local normalised content snapshot, and recommends related review, guide, warning, promo/news, comparison, card, mobile stacking, and natural internal-link section needs. It produces reports only and never edits live content, publishes, writes to Supabase, changes trust ratings, inserts affiliate links, or runs live crawling/fetching.

Media + Video Brief Agent v1 adds a read-only local media-planning layer. It reads Page Quality Profiler, Page Blueprint Agent, and Content Cluster Agent reports, optionally uses the local normalised content snapshot, and recommends screenshot, proof block, image, diagram, comparison visual, review card, alt text, mobile media, and video brief needs. It produces reports only and never generates, downloads, uploads, publishes, or edits media.

Agent Capability Registry v2 adds a read-only local workforce capability map. It defines Watchdog HQ departments, managers, worker agents, capability endpoints, allowed inputs and outputs, blocked actions, escalation routes, lifecycle limits, maturity status, and future implementation priority. It is a planning/reporting registry only and does not call AI APIs, call external APIs, crawl live sources, publish, apply, edit live content, or write to Supabase.

QC Department v2 / Gatekeeper Grace Expansion v1 adds a read-only local quality-control contract for checking major agent outputs before they reach Danny. It defines Gatekeeper Grace's safety, unsupported-claim, affiliate-disclosure, trust-rating, scam-wording, human-approval, and unsafe-recommendation blocking endpoints. It is report-only and never approves, applies, publishes, edits live content, calls APIs, or writes to Supabase.

## Goals

- Standardize how platform reviews, scam warnings, and education posts are researched and drafted.
- Keep content decisions auditable through source notes, confidence levels, and human review gates.
- Separate draft planning from production publishing.
- Avoid secrets, automated publishing, Supabase writes, or deployment coupling.
- Discover public site URLs from `https://cryptowatchdog.net/sitemap.xml` before using fallback route manifests.
- Analyse real exported content bodies from local JSON snapshots before recommending edits.
- Reduce false positives by reviewing confidence, evidence snippets, and false-positive risk before building fix queues.
- Rank possible actions without treating findings as confirmed defects.
- Verify high-risk queue items against rendered live pages before assigning edits.
- Draft metadata suggestions locally without inventing evidence, rankings, partnerships, guarantees, tests, ratings, or user numbers.
- Suggest natural internal link placements while preserving main-answer-first, evidence-first page structure.
- Suggest safe affiliate placements locally while keeping trust, disclosure, page risk, and human review ahead of revenue.
- Track offer expiry and stale affiliate terms locally before any placement is considered safe.
- Import local Search Console exports to find draft SEO refresh opportunities without connecting to Google APIs.
- Import local GA4 exports to find draft engagement, CTA, content, and affiliate-placement review opportunities.
- Combine local SEO, content, affiliate, analytics, and rendered-verifier signals into a concise command queue.
- Guard proposed content ideas against duplication, cannibalisation, and unsupported high-risk wording before drafting.
- Maintain a local Watchdog HQ agent registry so ownership, safety boundaries, and future automation plans stay explicit.
- Produce a local morning command dashboard that separates detected, suspected, recommended, blocked, approval-needed, and monitor-only work.
- Generate cautious local fix draft suggestions from the command queue without producing final publishable content or live update payloads.
- Preview draft suggestions as simulated before/proposed text so humans can review the direction before approval or application work exists.
- Create a local decision queue that asks what Danny should review, approve to draft, approve to research, reject, defer, or monitor without granting approval itself.

## Folder Map

- `workflow/phase-1.md`: operating flow from intake to publish-ready draft.
- `taxonomy/risk-signals.md`: shared risk signal language and rating guidance.
- `schemas/content-item.schema.json`: JSON schema for draft content items.
- `prompts/content-system.md`: system prompt for draft generation.
- `prompts/review-checklist.md`: human review checklist prompt.
- `seeds/editorial-calendar.json`: starter content calendar for Phase 1.
- `seeds/source-register.json`: neutral source categories to guide evidence gathering.
- `scripts/`: standalone audit, crawl, SEO, link, draft, content snapshot, confidence summary, priority queue, rendered verification, metadata suggestions, internal link placement suggestions, and optional export commands.
- `src/lib/`: shared filesystem, CSV, route, sitemap, scoring, text, logger, audit, and type helpers.
- `data/content_snapshot/`: local read-only JSON exports and normalised content output.
- `data/`: generated inventory, reports, research, keywords, YouTube, affiliate, and draft outputs.

## Phase 1 Boundaries

This folder is standalone tooling and structured planning only. It does not publish pages, mutate database records, change application code, or store secrets.

## Sitemap-First Discovery

The crawler now loads sitemap URLs first, filters them by configured allowed domains and excluded paths, and records them as `discoveryMode: sitemap-url`. If individual pages still return thin React shell HTML, the records stay sitemap-discovered rather than falling back to route-manifest records.

Fallback records are used only when sitemap discovery fails or returns no usable URLs. Those records are marked as `discoveryMode: route-manifest-fallback` and are built from `src/App.tsx`, `src/integrations/supabase/types.ts`, and `supabase/migrations/`.

## Phase 1B Content Snapshots

Place owner-exported JSON files in `data/content_snapshot/` and confirm the paths in `config/content_snapshot.config.json`. The expected local snapshot files are:

- `data/content_snapshot/reviews.example.json`
- `data/content_snapshot/blog_posts.example.json`
- `data/content_snapshot/warnings.example.json`
- `data/content_snapshot/categories.example.json`

Run the full read-only snapshot audit only when approved:

```bash
cd cw-content-brain
npm run content:audit
```

Generated content snapshot outputs:

- `data/content_snapshot/normalised_content.json`
- `data/reports/content_quality_report.json`
- `data/reports/affiliate_placement_report.json`
- `data/reports/content_linking_report.json`
- `logs/content-snapshot-run.json`

These reports are recommendations for human review. The tools do not connect to Supabase, write to Supabase, edit existing site content, publish content, or add affiliate links.

## Confidence Triage

Each content audit finding includes:

- `confidence`: how strongly the local snapshot supports the finding.
- `falsePositiveRisk`: how likely the finding may be explained by templates, rendered React components, structured fields, or missing context.
- `evidenceSnippet`: a short local snippet when useful.
- `reason`: why the tool assigned the confidence and risk.
- `needsHumanReview`: whether a person must verify the finding.

After running `npm run content:audit`, the owner can run:

```bash
npm run content:confidence
```

This writes:

- `data/reports/audit_confidence_summary.json`
- `data/reports/audit_confidence_summary.md`

High-confidence findings should be reviewed first. High false-positive-risk findings should be checked against rendered pages and structured source fields before any edit is made. No content should be changed automatically based on these reports.

## Priority Action Queue

After confidence triage, the owner can build a ranked queue:

```bash
npm run content:audit
npm run content:confidence
npm run content:queue
```

The queue reads local generated reports and writes:

- `data/reports/priority_action_queue.json`
- `data/reports/priority_action_queue.md`

The queue ranks possible fixes using confidence, false-positive risk, severity, issue-specific boosts, and page-level combinations. High false-positive-risk items must be checked against rendered pages before editing. Low-confidence items should be treated as checks, not fixes. The queue does not edit content, publish content, write to Supabase, or create tasks automatically.

## Rendered Page Verifier

Rendered Page Verifier v1 is optional and disabled by default in `config/rendered_verifier.config.json`. It should be run only after the queue exists:

```bash
npm run content:audit
npm run content:confidence
npm run content:queue
npm run content:metadata
npm run content:internal-links
npm run content:affiliates
npm run content:offers
npm run content:gsc
npm run content:ga4
npm run content:seo-brain
npm run content:research-guard
npm run content:agents
npm run content:master-queue
npm run content:fix-drafts
npm run content:preview-diffs
npm run content:approvals
npm run content:daily-brief
npm run content:qc
npm run content:qc-v2
npm run content:qc-v2-validate
npm run content:manager-escalations
npm run content:daily-run
npm run content:daily-pack
npm run content:dashboard-export
npm run content:dashboard-validate
npm run content:department-roadmap
npm run content:agent-output-contract
npm run content:agent-output-contract-validate
npm run content:department-router
npm run content:department-router-validate
npm run content:decision-log
npm run content:decision-log-validate
npm run content:base-runbook
npm run content:base-runbook-validate
npm run content:page-quality
npm run content:page-quality-validate
npm run content:page-blueprints
npm run content:page-blueprints-validate
npm run content:clusters
npm run content:clusters-validate
npm run content:media-briefs
npm run content:media-briefs-validate
npm run content:agent-capabilities
npm run content:agent-capabilities-validate
npm run content:source-watchlist
npm run content:source-watchlist-validate
npm run dashboard:build
npm run dashboard:validate
npm run dashboard:smoke
npm run dashboard:ui-guard
npm run dashboard:open
npm run content:verify-rendered
```

The verifier opens live rendered pages with Playwright and compares page facts against queue findings. It can downgrade likely false positives when the rendered page already includes injected internal links, external links, disclosure text, metadata, or visible page components that are not present in the exported snapshot.

Affiliate link checks should not treat internal CryptoWatchdog disclosure, legal, policy, accessibility, editorial policy, or methodology pages as affiliate links. Affiliate disclosure detection remains separate from affiliate link detection. Code artefact checks are heuristic and should look for code-like context rather than ordinary words such as "function" or "type" by themselves.

The verifier never edits live pages, never publishes content, never writes to Supabase, and never changes app files. It writes only local generated reports:

- `data/reports/rendered_page_verification.json`
- `data/reports/rendered_page_verification.md`

Playwright may require a browser install later on the owner's machine. Codex must not run browser install commands unless explicitly instructed. Generated verifier reports are local outputs and are ignored by Git.

## Metadata Engine

Metadata Engine v1 is read-only and draft-only. It reads `data/content_snapshot/normalised_content.json` when available, otherwise it loads the configured local JSON snapshot files. It also reads `data/reports/rendered_page_verification.json` when available so existing rendered titles, descriptions, canonical tags, social metadata, and image counts can inform review notes.

Run it locally with:

```bash
npm run content:metadata
```

The engine writes only ignored local reports:

- `data/reports/metadata_suggestions.json`
- `data/reports/metadata_suggestions.md`

Every item is marked `draft_only: true` and `needs_human_review: true`. The JSON output includes:

- `seoTitleDraft`
- `metaDescriptionDraft`
- `canonicalCheck`
- `ogTitleDraft`
- `ogDescriptionDraft`
- `twitterTitleDraft`
- `twitterDescriptionDraft`
- `schemaSuggestionType`
- `imageAltTextSuggestions`
- `imageFilenameSuggestions`
- `targetKeywordSuggestion`
- `secondaryKeywordSuggestions`
- `safetyNotes`

Metadata suggestions must preserve CryptoWatchdog's evidence-first, protection-first, plain-English tone. They must not invent evidence, ratings, tests, user numbers, rankings, partnerships, or guarantees. Treat the report as a review aid, not an implementation or publishing instruction.

## Internal Link Placement Brain

Internal Link Placement Brain v1 is read-only and draft-only. It reads `data/content_snapshot/normalised_content.json` when available, otherwise it loads the configured local JSON snapshot files. It suggests natural internal link opportunities between reviews, blog posts, warnings, and category pages using local snapshot text only.

Run it locally with:

```bash
npm run content:internal-links
```

The engine writes only ignored local reports:

- `data/reports/internal_link_placement_suggestions.json`
- `data/reports/internal_link_placement_suggestions.md`

Every recommendation is marked `draft_only: true` and `needs_human_review: true`. The JSON output includes:

- `sourcePage`
- `targetPage`
- `suggestedAnchorText`
- `suggestedPlacementContext`
- `placementType`
- `reason`
- `confidence`
- `falsePositiveRisk`
- `targetLinkStatus`
- `orphanOrThinlyLinkedPages`
- `review_later`

Placement guidance is strict: main answer first, evidence second, helpful links naturally inside, related content near the end or contextually placed, and affiliate links only where they genuinely help. Do not dump related posts at the top of pages. Avoid spammy exact-match anchor text and excessive links per page. Treat every suggestion as a review aid, not an implementation instruction.

High-confidence recommendations require specific shared entity/title terms or a strong category match with several non-generic shared terms. Broad crypto/safety/scam/education terms are treated as generic and should not create high-confidence, low false-positive-risk recommendations on their own. Weaker possible matches stay in `review_later` instead of filling every source page with links.

## Affiliate Vault And Placement Brain

Affiliate Vault v1 is a local config structure only. The example vault lives at `config/affiliate_vault.example.json`; owners can create an uncommitted `config/affiliate_vault.json` with approved records. Each record supports:

- `brandName`
- `category`
- `affiliateUrl`
- `cleanDisplayUrl`
- `network`
- `commissionType`
- `countriesAllowed`
- `approvedPageTypes`
- `blockedPageTypes`
- `allowedRiskRatings`
- `disclosureRequired`
- `disclosureText`
- `offerText`
- `offerExpiryDate`
- `lastCheckedDate`
- `status`
- `notes`

Affiliate Placement Brain v1 is read-only and draft-only. It reads `data/content_snapshot/normalised_content.json` when available, otherwise it loads the configured local JSON snapshot files. It reads affiliate records from the local vault and suggests only reviewable placements.

Run it locally with:

```bash
npm run content:affiliates
```

The engine writes only ignored local reports:

- `data/reports/affiliate_placement_suggestions.json`
- `data/reports/affiliate_placement_suggestions.md`

Every recommendation is marked `draft_only: true` and `needs_human_review: true`. The JSON output includes:

- `sourcePage`
- `affiliateBrand`
- `affiliateCategory`
- `cleanDisplayUrl`
- `network`
- `commissionType`
- `suggestedPlacementContext`
- `placementType`
- `suggestedCtaText`
- `disclosureRequired`
- `disclosureText`
- `reason`
- `confidence`
- `falsePositiveRisk`
- `expiryStatus`
- `offerText`
- `riskFlags`
- `blockedPlacements`

Affiliate links are the money engine, but trust comes first. The placement brain blocks or flags red-rated pages, warnings, scam-alert style pages, legal/policy pages, blocked page types, disallowed risk ratings, stale offers, expired offers, paused programmes, and blocked programmes. Do not place aggressive "buy now" CTAs, do not dump affiliate CTAs at the top of pages, do not repeat affiliate CTAs, and do not place affiliate links on warning/red pages unless a human explicitly approves a narrow exception.

## Offer Expiry / Deal Tracker

Offer Expiry / Deal Tracker v1 is read-only and draft-only. It reads `config/affiliate_vault.json` when present, otherwise `config/affiliate_vault.example.json`. The report intentionally excludes raw `affiliateUrl` values and uses `cleanDisplayUrl` for review context so private tracking links are not exposed in generated reports.

Run it locally with:

```bash
npm run content:offers
```

The tracker writes only ignored local reports:

- `data/reports/offer_tracker_report.json`
- `data/reports/offer_tracker_report.md`

Every item is marked `draft_only: true` and `needs_human_review: true`. The JSON output includes:

- `brandName`
- `category`
- `cleanDisplayUrl`
- `network`
- `commissionType`
- `countriesAllowed`
- `approvedPageTypes`
- `blockedPageTypes`
- `allowedRiskRatings`
- `disclosureRequired`
- `disclosureTextPresent`
- `offerTextPresent`
- `offerExpiryDate`
- `lastCheckedDate`
- `sourceStatus`
- `classification`
- `useStatus`
- `recommendedActions`
- `notes`
- `safeToUse`
- `needsReview`
- `blocked`

Classifications are `current`, `expires_soon`, `expired`, `stale_check`, `paused`, `blocked`, and `needs_review`. Recommended actions can include `renew_offer`, `verify_terms`, `pause_placements`, `remove_expired_cta`, `update_disclosure`, and `human_review_required`. Treat `safe_to_use` as a draft signal only: a human must still verify live offer terms and disclosure before publishing or placing any CTA.

## Search Console Connector

Search Console Connector v1 is read-only and local-file based. It does not use live Google API authentication. Drop exported Google Search Console CSV or JSON files into:

- `data/search_console/exports/`

Real exports are ignored by Git. The committed folder contains only `.gitkeep`. CSV headers can include common Search Console names such as `Query`, `Page`, `Country`, `Device`, `Date`, `Clicks`, `Impressions`, `CTR`, and `Average position`. JSON files can be an array of records or an object with `rows` or `data`.

Run it locally with:

```bash
npm run content:gsc
```

The connector writes only ignored local reports:

- `data/reports/search_console_report.json`
- `data/reports/search_console_report.md`

The JSON output includes:

- `exportFolder`
- `importedFiles`
- `recordCount`
- `topQueries`
- `topPages`
- `recommendations`
- `query`
- `page`
- `country`
- `device`
- `date`
- `clicks`
- `impressions`
- `ctr`
- `averagePosition`

Every recommendation is marked `draft_only: true` and `needs_human_review: true`. The connector can flag low-CTR/high-impression opportunities, page 2 opportunities, rising keywords, falling keywords, metadata review opportunities, internal-link review opportunities, and content refresh review opportunities when the local export has enough data. Treat all recommendations as prompts for human SEO review, not as publishing instructions.

## GA4 Analytics Connector

GA4 Analytics Connector v1 is read-only and local-file based. It does not use live Google API authentication. Drop exported GA4 CSV or JSON files into:

- `data/ga4/exports/`

Real exports are ignored by Git. The committed folder contains only `.gitkeep`. CSV headers can include common GA4 names such as `Page path`, `Page URL`, `Page title`, `Date`, `Session source / medium`, `Sessions`, `Users`, `Views`, `Engagement rate`, `Average engagement time`, `Event count`, `Conversions`, `Key events`, and `Affiliate clicks`. JSON files can be an array of records or an object with `rows` or `data`.

Run it locally with:

```bash
npm run content:ga4
```

The connector writes only ignored local reports:

- `data/reports/ga4_report.json`
- `data/reports/ga4_report.md`

The JSON output includes:

- `exportFolder`
- `importedFiles`
- `recordCount`
- `topPagesByViews`
- `topPagesBySessions`
- `recommendations`
- `pagePath`
- `pageUrl`
- `pageTitle`
- `date`
- `sourceMedium`
- `sessions`
- `users`
- `views`
- `engagementRate`
- `averageEngagementTimeSeconds`
- `eventCount`
- `conversions`
- `keyEvents`
- `affiliateClickEvents`

Every recommendation is marked `draft_only: true` and `needs_human_review: true`. The connector can flag high-traffic but weak-engagement pages, pages with traffic but low or zero conversion/key-event signals, pages with traffic but no affiliate-click events when available, CTA review opportunities, content refresh opportunities, metadata review opportunities, and affiliate placement review opportunities. Treat all recommendations as prompts for human analytics review, not as publishing instructions.

## SEO Intelligence Brain

SEO Intelligence Brain v1 is read-only and draft-only. It combines whichever local reports are available and safely tolerates missing inputs:

- `data/reports/metadata_suggestions.json`
- `data/reports/internal_link_placement_suggestions.json`
- `data/reports/affiliate_placement_suggestions.json`
- `data/reports/offer_tracker_report.json`
- `data/reports/search_console_report.json`
- `data/reports/ga4_report.json`
- `data/reports/rendered_page_verification.json`

Run it locally with:

```bash
npm run content:seo-brain
```

The brain writes only ignored local reports:

- `data/reports/seo_intelligence_queue.json`
- `data/reports/seo_intelligence_queue.md`

Every queue item is marked `draft_only: true`. Items are marked `needs_human_review: true` unless the item is explicitly blocked. The JSON output includes:

- `loadedReports`
- `missingReports`
- `signalCount`
- `itemCount`
- `actionQueueCount`
- `blockedItemCount`
- `monitorItemCount`
- `statusCounts`
- `priorityCounts`
- `opportunityTypeCounts`
- `items`
- `actionQueue`
- `blockedItems`
- `monitorItems`
- `status`
- `priority`
- `opportunityType`
- `page`
- `brandName`
- `confidence`
- `falsePositiveRisk`
- `sourceSignals`
- `suggestedNextAction`

Opportunity types include `metadata_improvement`, `internal_link_support`, `content_refresh`, `ctr_improvement`, `page_2_opportunity`, `weak_engagement`, `affiliate_review`, `offer_review`, `evidence_or_trust_review`, and `media_review`. Priorities are `critical`, `high`, `medium`, `low`, and `monitor`. Status values are `safe_draft`, `needs_human_review`, `blocked`, and `monitor`.

The SEO Brain separates actionable tasks from blocked/risk-control items so Danny is not flooded with non-actionable warnings. `items` and `actionQueue` contain the main non-blocked action queue. `blockedItems` retains capped risk controls such as blocked affiliate placements. `monitorItems` retains capped monitor-only items. Treat the queue as Danny's command view: things safe to draft, things to review manually, things to block, and things to monitor. It does not apply changes.

## Research & Duplicate Guard

Research & Duplicate Guard v1 is read-only and draft-only. It does not use live web search or verify claims online. Drop proposed content idea CSV or JSON files into:

- `data/research_queue/inputs/`

Real inputs are ignored by Git. The committed folder contains only `.gitkeep`. CSV headers can include `title`, `description`, `target keyword`, `secondary keywords`, `type`, and `notes`. JSON files can be an array of ideas or an object with `ideas`, `rows`, or `data`.

Run it locally with:

```bash
npm run content:research-guard
```

The guard writes only ignored local reports:

- `data/reports/research_duplicate_guard_report.json`
- `data/reports/research_duplicate_guard_report.md`

Every item is marked `draft_only: true` and `needs_human_review: true`. The JSON output includes:

- `inputFolder`
- `ideaCount`
- `existingPageCount`
- `classificationCounts`
- `items`
- `idea`
- `classification`
- `classifications`
- `matchedExistingPages`
- `similarityReason`
- `confidence`
- `falsePositiveRisk`
- `suggestedNextAction`

Classifications include `no_overlap`, `related_but_distinct`, `same_search_intent`, `near_duplicate`, `keyword_cannibalisation_risk`, `update_existing_page_instead`, `create_supporting_article`, `needs_research`, and `blocked_until_evidence`. Unsupported high-risk wording such as scam, fraud, recovery guarantees, guaranteed safety, or ranking claims should be blocked until evidence is reviewed. Treat the report as a pre-draft review aid, not as approval to publish.

## Agent Registry

Agent Registry v1 is read-only and report-only. It defines the current and planned Watchdog HQ AI workforce and maps existing Content Brain scripts into named agents. It does not execute agents, call APIs, publish content, edit live pages, write to Supabase, or store secrets.

Run it locally with:

```bash
npm run content:agents
```

The registry writes only ignored local reports:

- `data/reports/agent_registry_report.json`
- `data/reports/agent_registry_report.md`

The JSON output includes:

- `generatedAt`
- `disclaimer`
- `registryVersion`
- `agentCount`
- `activeAgentCount`
- `plannedAgentCount`
- `futureAgentCount`
- `departmentCounts`
- `riskCounts`
- `safetyRules`
- `agents`

Each agent includes `id`, `name`, `department`, `currentStatus`, `mode`, `riskLevel`, `hierarchyLevel`, `reportsTo`, `supervises`, `escalationRules`, `responsibilities`, `inputReports`, `outputReports`, `relatedScripts`, `allowedActions`, `blockedActions`, `canAutoDraft`, `canAutoApply`, and `requiresHumanApproval`.

The hierarchy is explicit: Danny receives reports from the Master AI Manager / Top Agent; the Master AI Manager supervises Department AI Managers; Department AI Managers supervise Specialist Agents / Worker Agents. Specialist agents report to their Department AI Manager, not directly to Danny. Department AI Managers review worker outputs, remove noise and duplicate recommendations, identify blocked/risky items, summarise findings, and escalate only important items to the Master AI Manager. The Master AI Manager prioritises cross-department work, creates Danny's command queue, and separates draftable, approval-needed, blocked, and monitor-only work.

Core departments are Command, Content, SEO, Research, Affiliates, Backlinks, Analytics, Trust & Safety, Media, Social, Operations, and Approvals. All v1 agents have `canAutoApply: false`. Risky or high-impact agents require human approval. Registry safety rules explicitly block publishing without approval, Supabase writes without a future approved workflow, live site edits, secrets, unauthorised affiliate links on red/warning/high-risk pages, trust rating changes without approval, and scam/fraud accusations without evidence review.

## Master Command Queue

Master Command Queue v1 is read-only and report-only. It creates the first Watchdog HQ morning dashboard by combining whichever local Content Brain reports are available:

- `data/reports/seo_intelligence_queue.json`
- `data/reports/agent_registry_report.json`
- `data/reports/research_duplicate_guard_report.json`
- `data/reports/metadata_suggestions.json`
- `data/reports/internal_link_placement_suggestions.json`
- `data/reports/affiliate_placement_suggestions.json`
- `data/reports/offer_tracker_report.json`
- `data/reports/search_console_report.json`
- `data/reports/ga4_report.json`
- `data/reports/rendered_page_verification.json`
- `data/reports/priority_action_queue.json`
- `data/reports/audit_confidence_summary.json`

Run it locally with:

```bash
npm run content:master-queue
```

The queue writes only ignored local reports:

- `data/reports/master_command_queue.json`
- `data/reports/master_command_queue.md`

The JSON output includes `generatedAt`, `disclaimer`, `queueVersion`, `sourceReportsRead`, `missingReports`, `summaryCounts`, `stageCounts`, `riskCounts`, `approvalCounts`, `safeDraftsReady`, `needsDannyApproval`, `blockedRiskyItems`, `monitorOnly`, `performanceChanges`, `moneyOpportunities`, `managerSummaries`, and `topPriorities`.

Each queue item includes `id`, `title`, `sourceReport`, `section`, `department`, `priority`, `riskLevel`, `confidence`, `falsePositiveRisk`, `statusStage`, `needsHumanReview`, `needsDannyApproval`, `canAutoDraft`, `canAutoApply`, `suggestedNextAction`, `evidenceSummary`, and optional related URL/path fields. The stage model is explicit: detected -> suspected -> verified -> recommended -> approved -> applied. In v1, nothing is approved or applied, `approvedCount` and `appliedCount` stay `0`, and every item has `canAutoApply: false`.

The dashboard groups work into safe draft ideas, Danny approval items, blocked/risky items, monitor-only items, performance changes, money opportunities, department manager summaries, and a capped top-priority list of at most 10 items. Affiliate placements, trust/rating-impacting issues, scam/fraud wording, legal/policy wording, live content decisions, publishing decisions, and high-risk claims must stay behind Danny approval. Treat the queue as local planning guidance, not permission to publish or edit live content.

## Fix Draft Generator

Fix Draft Generator v1 is read-only and draft-only. It reads the Master Command Queue first, then uses supporting local reports where available:

- `data/reports/master_command_queue.json`
- `data/reports/metadata_suggestions.json`
- `data/reports/internal_link_placement_suggestions.json`
- `data/reports/research_duplicate_guard_report.json`
- `data/reports/rendered_page_verification.json`
- `data/reports/affiliate_placement_suggestions.json`

Run it locally with:

```bash
npm run content:fix-drafts
```

The generator writes only ignored local reports:

- `data/reports/fix_draft_suggestions.json`
- `data/reports/fix_draft_suggestions.md`

The JSON output includes `generatedAt`, `disclaimer`, `draftVersion`, `sourceReportsRead`, `missingReports`, `summaryCounts`, `riskCounts`, `approvalCounts`, `draftTypeCounts`, and `drafts`.

Each draft includes `id`, `sourceQueueItemId`, `sourceReport`, optional `relatedUrl` or `relatedPath`, `department`, `draftType`, `riskLevel`, `statusStage`, `draftOnly`, `needsHumanReview`, `needsDannyApproval`, `canAutoApply`, `title`, `draftText`, `rationale`, `safetyNotes`, and optional `blockedReason`.

Draft types are `meta_title`, `meta_description`, `faq`, `internal_link`, `image_alt_text`, `refresh_outline`, `evidence_checklist`, `affiliate_cta`, `blocked_item_research`, and `research_brief`. V1 uses the Master Command Queue sections `safeDraftsReady`, `needsDannyApproval`, `blockedRiskyItems`, and `moneyOpportunities`; output is capped at 50 drafts total, with separate caps for safe, approval, and blocked/research drafts.

Every draft has `draftOnly: true`, `needsHumanReview: true`, and `canAutoApply: false`. No draft can be `approved` or `applied`. High-risk, affiliate, scam/fraud, trust/rating, legal/policy, and blocked items require Danny approval. Affiliate CTA drafts must not include raw affiliate URLs. Scam/fraud wording is framed as an evidence checklist or research task, not an accusation. Trust rating changes and legal/policy wording are never drafted as final changes in v1.

## Preview Diff Engine

Preview Diff Engine v1 is read-only and preview-only. It reads Fix Draft Suggestions first, then uses local snapshot and command queue context when available:

- `data/reports/fix_draft_suggestions.json`
- `data/content_snapshot/normalised_content.json`
- `data/reports/master_command_queue.json`

Run it locally with:

```bash
npm run content:preview-diffs
```

The engine writes only ignored local reports:

- `data/reports/preview_diff_report.json`
- `data/reports/preview_diff_report.md`

The JSON output includes `generatedAt`, `disclaimer`, `previewVersion`, `sourceReportsRead`, `missingReports`, `summaryCounts`, `riskCounts`, `approvalCounts`, `previewTypeCounts`, and `previews`.

Each preview includes `id`, `sourceDraftId`, `sourceQueueItemId`, `sourceReport`, `previewType`, optional `relatedUrl` or `relatedPath`, `department`, `riskLevel`, `statusStage`, `previewOnly`, `draftOnly`, `needsHumanReview`, `needsDannyApproval`, `canAutoApply`, `title`, `currentValueSummary`, `proposedValueSummary`, `previewDiffText`, `rationale`, `safetyNotes`, and optional `blockedReason`.

Preview types are `meta_title_preview`, `meta_description_preview`, `internal_link_preview`, `image_alt_text_preview`, `refresh_outline_preview`, `evidence_checklist_preview`, `affiliate_cta_preview`, `blocked_research_preview`, and `research_brief_preview`. V1 previews are simulated text only and are capped at 50 previews total, with separate caps for safe previews, approval previews, and blocked/research previews.

Every preview has `previewOnly: true`, `draftOnly: true`, `needsHumanReview: true`, and `canAutoApply: false`. No preview can be `approved` or `applied`. The engine does not create executable patch files, Supabase update payloads, snapshot writes, source-content edits, live-site edits, API calls, or publishing actions. Affiliate CTA previews must not include raw affiliate URLs. High-risk, affiliate, scam/fraud, trust/rating, legal/policy, and blocked previews require Danny approval. Blocked previews stay research/evidence-only, trust rating changes are never previewed as direct rating changes, and legal/policy wording is never final wording in v1.

## Approval Queue

Approval Queue v1 is read-only and approval-planning only. It reads preview diffs first, then uses draft, command queue, and agent registry context when available:

- `data/reports/preview_diff_report.json`
- `data/reports/fix_draft_suggestions.json`
- `data/reports/master_command_queue.json`
- `data/reports/agent_registry_report.json`

Run it locally with:

```bash
npm run content:approvals
```

The queue writes only ignored local reports:

- `data/reports/approval_queue_report.json`
- `data/reports/approval_queue_report.md`

The JSON output includes `generatedAt`, `disclaimer`, `approvalQueueVersion`, `sourceReportsRead`, `missingReports`, `summaryCounts`, `riskCounts`, `decisionTypeCounts`, `approvalCounts`, `readyForReview`, `needsDannyApproval`, `blockedPendingEvidence`, `safeToDraftOnly`, `rejectOrDefer`, `monitorOnly`, and `safetyNotes`.

Each approval item includes `id`, optional `sourcePreviewId`, optional `sourceDraftId`, optional `sourceQueueItemId`, `sourceReport`, `section`, `department`, `decisionType`, `riskLevel`, `statusStage`, `needsHumanReview`, `needsDannyApproval`, `canAutoApply`, `title`, `decisionQuestion`, `evidenceSummary`, `recommendedDecision`, `rationale`, optional `blockedReason`, optional `approvalWarning`, and optional related URL/path fields.

Decision types are `review`, `approve_to_draft`, `approve_to_research`, `approve_to_prepare_preview`, `reject`, `defer`, and `monitor`. These are decision prompts only; the report must not claim approval happened. Sections are capped at 60 total items, with per-section caps for ready review, Danny approval, blocked evidence, safe draft-only, reject/defer, and monitor-only items.

Every item has `needsHumanReview: true` and `canAutoApply: false`. `approvedCount` and `appliedCount` are always `0`. High-risk, blocked, affiliate, scam/fraud, trust/rating, legal/policy, unclear, duplicated, or stale items require Danny approval, evidence review, rejection, deferral, or monitoring. The queue never publishes, writes to Supabase, edits files, creates patch files, creates update payloads, exposes secrets, changes trust ratings, finalises legal/policy wording, or makes scam/fraud accusations.

## Master AI Manager Daily Brief

Master AI Manager Daily Brief v1 is read-only and report-only. It reads the local Watchdog HQ planning reports where available and turns them into a cautious plain-English daily briefing for Danny:

- `data/reports/master_command_queue.json`
- `data/reports/approval_queue_report.json`
- `data/reports/preview_diff_report.json`
- `data/reports/fix_draft_suggestions.json`
- `data/reports/agent_registry_report.json`
- `data/reports/seo_intelligence_queue.json`
- `data/reports/research_duplicate_guard_report.json`
- `data/reports/offer_tracker_report.json`
- `data/reports/search_console_report.json`
- `data/reports/ga4_report.json`

Run it locally with:

```bash
npm run content:daily-brief
```

The brief writes only ignored local reports:

- `data/reports/master_daily_brief.json`
- `data/reports/master_daily_brief.md`

The JSON output includes `generatedAt`, `disclaimer`, `briefVersion`, `sourceReportsRead`, `missingReports`, `executiveSummary`, `todayCommandQueue`, `topThreePriorities`, `managerBriefs`, `approvalSnapshot`, `riskSnapshot`, `opportunitySnapshot`, `whatDannyShouldDoToday`, `whatAgentsShouldDoNext`, `blockedUntilDannyDecides`, `safetyCounts`, and `safetyNotes`.

The Markdown output includes Master AI Manager Daily Brief, Executive Summary, Today's Command Queue, Top 3 Priorities, Department Manager Briefs, Approval Snapshot, Risk Snapshot, Opportunity Snapshot, What Danny Should Do Today, What Agents Should Do Next, Blocked Until Danny Decides, Safety Notes, and Missing Reports.

The brief uses cautious language such as detected, likely, needs review, blocked pending evidence, ready for draft review, and monitor only. It does not claim anything is approved or applied. `canAutoApply` is always false, and `approvedCount` and `appliedCount` are always `0`. It never publishes, writes to Supabase, edits live site files, creates patch files, creates update payloads, exposes secrets, includes raw affiliate URLs, changes trust ratings, finalises legal/policy wording, or makes scam/fraud accusations.

## Quality Control Manager

Quality Control Manager v1 is read-only and report-only. It checks local worker-agent and manager outputs before they reach Danny or the Master AI Manager. It reviews whether outputs are safe, useful, evidence-based, on-brand, non-duplicative, correctly staged, correctly approval-flagged, and properly escalated.

It reads whichever local reports are available:

- `data/reports/fix_draft_suggestions.json`
- `data/reports/preview_diff_report.json`
- `data/reports/approval_queue_report.json`
- `data/reports/master_command_queue.json`
- `data/reports/master_daily_brief.json`
- `data/reports/agent_registry_report.json`
- `data/reports/research_duplicate_guard_report.json`
- `data/reports/seo_intelligence_queue.json`
- `data/reports/affiliate_placement_suggestions.json`
- `data/reports/offer_tracker_report.json`

Run it locally with:

```bash
npm run content:qc
```

The QC manager writes only ignored local reports:

- `data/reports/quality_control_report.json`
- `data/reports/quality_control_report.md`

The JSON output includes `generatedAt`, `disclaimer`, `qcVersion`, `sourceReportsRead`, `missingReports`, `summaryCounts`, `qcStatusCounts`, `severityCounts`, `riskCounts`, `issueTypeCounts`, `managerEscalationCounts`, `safetyCounts`, `findings`, `managerEscalationSummary`, and `safetyNotes`.

Each QC finding includes `sourceItemId`, `sourceReport`, `sourceTitle`, `department`, `qcStatus`, `severity`, `riskLevel`, `issueType`, `detectedStage`, `needsHumanReview`, `needsDannyApproval`, `canAutoApply`, `recommendedManagerEscalation`, optional `secondaryManagerEscalation`, `recommendedAction`, `rationale`, and `safetyNotes`.

QC statuses are `qc_pass_draft_only`, `needs_revision`, `needs_cross_manager_review`, `blocked_pending_evidence`, `escalate_to_master_ai`, `escalate_to_danny`, and `monitor_only`. Issue types include evidence gaps, unsafe claims, affiliate risk, trust/rating risk, legal/policy risk, financial advice risk, duplicate/cannibalisation risk, generic or low-value drafts, prioritisation issues, approval flag issues, unsafe status stages, auto-apply issues, raw affiliate URLs, cross-manager escalation, and monitor-only items.

The manager-to-manager escalation model lets managers review sideways before Danny is interrupted. For example, Content can route search intent questions to SEO, SEO can route generic metadata to QC, Affiliates can route monetisation risk to Trust & Safety, Research can route update-existing-page questions to Content, and QC can route unclear cross-department risk to the Master AI Manager. The Master AI Manager should escalate to Danny only for clean, important decisions.

Hard QC rules are conservative: any `canAutoApply: true`, approved/applied status stage, or raw affiliate URL exposure becomes a high-severity finding. Scam/fraud, trust/rating, legal/policy, financial advice, affiliate-on-warning-page, duplicate/cannibalisation, generic draft, missing approval flag, and monitor-only signals are kept in review, revision, blocked, or escalation states. QC never marks anything approved or applied, never publishes, never writes to Supabase, never edits live files, never creates patch files, never creates update payloads, never changes trust ratings, never finalises legal/policy wording, and never makes scam/fraud accusations.

## Manager Escalation Router

Manager Escalation Router v1 is read-only and report-only. It formalises manager-to-manager routing inside Watchdog HQ so Department AI Managers can route items sideways before anything reaches Danny. The router treats every item as part of the Detected -> Suspected -> Verified -> Recommended -> Approved -> Applied model, but v1 can only output `detected`, `suspected`, `verified`, or `recommended` routing recommendations. It never records real approval or application.

It reads whichever local reports are available:

- `data/reports/quality_control_report.json`
- `data/reports/approval_queue_report.json`
- `data/reports/master_command_queue.json`
- `data/reports/agent_registry_report.json`
- `data/reports/master_daily_brief.json`

Run it locally with:

```bash
npm run content:manager-escalations
```

The router writes only ignored local reports:

- `data/reports/manager_escalation_router_report.json`
- `data/reports/manager_escalation_router_report.md`

The JSON output includes `generatedAt`, `phase`, `name`, `safetyMode`, `canAutoApply`, `approvedCount`, `appliedCount`, `missingInputs`, `sourceReportsRead`, `routeDefinitions`, `escalationItems`, `managerSummary`, and `safetyChecks`.

Each escalation item includes `id`, `sourceReport`, optional `sourceItemId`, `detectedIssue`, `currentStage`, `fromManager`, `toManager`, `routeReason`, `recommendedAction`, `priority`, `confidence`, `requiresDannyDecision`, `canAutoApply`, `approved`, and `applied`.

Supported routes include Content to SEO, Content to Research, SEO to Quality Control, Affiliates to Trust & Safety, Research to Content, Social to Trust & Safety, Quality Control to Master AI, and Master AI to Danny. High-priority human decisions should route through the Master AI Manager first, and only then to Danny.

The router is local planning only. It never publishes, writes to Supabase, edits live site files, creates patch files, creates update payloads, exposes secrets, includes raw affiliate links as acceptable output, changes trust ratings, finalises legal/policy wording, makes scam/fraud accusations, or creates approved/applied states. `canAutoApply` is always false, and `approvedCount` and `appliedCount` are always `0`.

## Daily Run Orchestrator

Daily Run Orchestrator v1 is read-only and report-only. It runs the safe local Watchdog HQ planning commands in a fixed sequence and writes a local run report. It does not accept arbitrary command input.

Run it locally with:

```bash
npm run content:daily-run
```

The orchestrator runs these fixed commands in order:

1. `npm run content:research-guard`
2. `npm run content:agents`
3. `npm run content:master-queue`
4. `npm run content:fix-drafts`
5. `npm run content:preview-diffs`
6. `npm run content:approvals`
7. `npm run content:daily-brief`
8. `npm run content:qc`
9. `npm run content:manager-escalations`

It explicitly excludes live crawlers, Supabase export, Search Console import, GA4 import, rendered verification, publishing, apply, write-to-live, and live-site commands. It does not run `npm run crawl`, `npm run content:export`, `npm run content:gsc`, `npm run content:ga4`, or `npm run content:verify-rendered`.

The orchestrator writes only ignored local reports:

- `data/reports/daily_run_orchestrator_report.json`
- `data/reports/daily_run_orchestrator_report.md`

The JSON output includes `generatedAt`, `phase`, `name`, `safetyMode`, `canAutoApply`, `approvedCount`, `appliedCount`, `overallStatus`, `steps`, `skippedSteps`, and `safetyChecks`. Each step records `stepNumber`, `command`, `purpose`, `status`, `startedAt`, `finishedAt`, `durationMs`, and `exitCode`.

If any step fails, the orchestrator stops, records the failure, and lists the remaining commands under `skippedSteps`. It never continues as if everything passed. The orchestrator never approves, applies, publishes, creates patch files, creates update payloads, writes to Supabase, runs live crawlers, runs Google imports, verifies rendered live pages, or edits live site files. `canAutoApply` is always false, and `approvedCount` and `appliedCount` are always `0`.

## Daily Report Pack Builder

Daily Report Pack Builder v1 is read-only and report-only. It collects key local Watchdog HQ reports into one Danny-ready daily pack for human review and future dashboard input. It summarises counts, statuses, priorities, top items, safety issues, and next review blocks without copying huge raw reports.

Run it locally after the daily run with:

```bash
npm run content:daily-pack
```

Required core inputs:

- `data/reports/daily_run_orchestrator_report.json`
- `data/reports/master_daily_brief.json`
- `data/reports/quality_control_report.json`
- `data/reports/manager_escalation_router_report.json`
- `data/reports/master_command_queue.json`
- `data/reports/approval_queue_report.json`

Optional supporting inputs include research guard, fix drafts, preview diffs, agent registry, SEO intelligence, metadata, internal links, affiliates, offers, Search Console, GA4, rendered verification, priority queue, and audit confidence reports. Missing optional files are reported but do not fail the pack.

The builder writes only ignored local reports:

- `data/reports/daily_report_pack.json`
- `data/reports/daily_report_pack.md`

The JSON output includes `generatedAt`, `phase`, `name`, `safetyMode`, `canAutoApply`, `approvedCount`, `appliedCount`, required/optional input lists, missing input lists, `packStatus`, report summaries, top Danny decision items, blocked/risky items, monitor-only items, money opportunities, next recommended blocks, and `safetyChecks`.

Pack status is `complete` when all required core inputs exist, `partial` when at least one required input is missing but at least one core input exists, and `failed` only when no required core input exists. The builder actively scans loaded report JSON text for unsafe states such as `canAutoApply: true`, `approved: true`, `applied: true`, or approved/applied stage values. Any unsafe signal is copied into the pack as a blocked/risky item for review, but the source report is never modified.

The pack builder never approves, applies, publishes, creates patch files, creates update payloads, writes to Supabase, edits live site files, exposes secrets, or adds raw affiliate links. `canAutoApply` is always false, and `approvedCount` and `appliedCount` are always `0`.

## Dashboard Data Export Layer

Dashboard Data Export Layer v1 is read-only and report-only. It converts the local Daily Report Pack into small JSON files for future Watchdog HQ dashboard tabs. It is not the dashboard UI and does not create frontend code.

Run it locally after the daily run and daily pack:

```bash
npm run content:dashboard-export
```

Input file:

- `data/reports/daily_report_pack.json`

If the input pack is missing, the exporter fails safely and writes a clear local report explaining the missing input.

The exporter writes ignored local dashboard data files:

- `data/dashboard/overview.json`
- `data/dashboard/command.json`
- `data/dashboard/approvals.json`
- `data/dashboard/agents.json`
- `data/dashboard/content.json`
- `data/dashboard/seo.json`
- `data/dashboard/affiliates.json`
- `data/dashboard/research.json`
- `data/dashboard/analytics.json`

It also writes ignored local export reports:

- `data/reports/dashboard_data_export_report.json`
- `data/reports/dashboard_data_export_report.md`

The dashboard files are tab-shaped data only. They summarise overview status cards, command queue data, approval-planning data, agent hierarchy and escalation summaries, content work, SEO work, affiliate and money opportunities, research risks, and analytics signals.

The exporter sanitises dashboard output before writing. Every dashboard JSON includes `canAutoApply: false`, `approvedCount: 0`, and `appliedCount: 0`. It prevents `approved: true`, `applied: true`, and approved/applied stage values from being written to dashboard data. External URLs are redacted unless they are CryptoWatchdog URLs. If unsafe output cannot be sanitised, the exporter fails safely and writes only the local report.

The dashboard export layer never approves, applies, publishes, creates patch files, creates update payloads, writes to Supabase, edits live site files, exposes secrets, or adds raw affiliate links.

## Dashboard Contract Validator

Dashboard Contract Validator v1 is read-only and report-only. It checks the local Watchdog HQ dashboard JSON files before any future dashboard UI reads them. It is not the dashboard UI and does not create frontend code.

Run it after the daily run, daily pack, and dashboard export:

```bash
npm run content:dashboard-validate
```

Input dashboard files:

- `data/dashboard/overview.json`
- `data/dashboard/command.json`
- `data/dashboard/approvals.json`
- `data/dashboard/agents.json`
- `data/dashboard/content.json`
- `data/dashboard/seo.json`
- `data/dashboard/affiliates.json`
- `data/dashboard/research.json`
- `data/dashboard/analytics.json`

The validator writes ignored local reports:

- `data/reports/dashboard_contract_validation_report.json`
- `data/reports/dashboard_contract_validation_report.md`

The validator checks that every dashboard file exists, parses as JSON, includes required fields, keeps `canAutoApply: false`, keeps approval/application counts at `0` where present, does not contain `canAutoApply: true`, `approved: true`, `applied: true`, or approved/applied stage values, and does not contain raw external URLs unless they are CryptoWatchdog URLs.

Each dashboard tab also has a shape contract. For example, `overview.json` must include status cards, `approvals.json` must remain `PLANNING_ONLY`, `agents.json` must include hierarchy and manager routing, and `affiliates.json` must include a safety note that affiliate opportunities are planning-only and red-rated or warning pages require manual approval before affiliate placement.

If any required file is missing, JSON parsing fails, a required field is absent, an unsafe approval/apply state appears, or a raw external URL appears, validation fails and the script sets a failing exit code. It still writes the validation report. The validator never modifies dashboard JSON files, never auto-fixes data, never creates UI, never publishes, never writes to Supabase, never creates patch files, and never creates update payloads.

## Department Roadmap And Agent Coverage Map

Watchdog HQ Department Roadmap & Agent Coverage Map v1 is read-only and planning-only. It shows what departments exist now, what is only partially covered, what is missing, and what should be built next. It does not create functional worker agents and does not create dashboard UI.

Run it locally with:

```bash
npm run content:department-roadmap
```

Required inputs when present:

- `data/reports/agent_registry_report.json`
- `data/reports/daily_report_pack.json`
- `data/reports/dashboard_contract_validation_report.json`

Optional supporting inputs include the Master Command Queue, Quality Control report, Manager Escalation Router report, and local dashboard overview, agents, and command JSON files. Missing optional files are listed in the output and do not stop the report.

The roadmap writes only ignored local reports:

- `data/reports/department_roadmap_and_agent_coverage.json`
- `data/reports/department_roadmap_and_agent_coverage.md`

The roadmap maps Command, Content, SEO, Affiliates, Offers / Deals, Backlinks, Analytics, Research, Social, Media / Images, Video, Scam Monitoring, Trust & Safety, Moderation, Evidence / Testing, Approvals, Agents, Settings, Safe Apply Engine future-only, and Audit Log future-only departments. Each department includes current status, purpose, existing capabilities, missing capabilities, planned manager agent, planned worker agents, dashboard data coverage, approval rules, blocked actions, suggested build phase, priority, and `canAutoApply: false`.

The report also includes a coverage summary, next recommended build order, human approval rules, never-allowed rules, and safety checks. It never publishes, applies, edits live files, writes to Supabase, creates patch files, creates update payloads, runs live connectors, changes approval state, or sets `canAutoApply: true`.

## Local Dashboard Shell

Watchdog HQ Local Dashboard Shell v1 is a local-only static HTML viewer for Content Brain dashboard data. It is not the live CryptoWatchdog website, does not use the root app, and does not create or edit Lovable UI files.

Build the local dashboard with:

```bash
npm run dashboard:build
```

Validate the local dashboard shell with:

```bash
npm run dashboard:validate
```

The builder reads ignored dashboard JSON files from:

- `data/dashboard/overview.json`
- `data/dashboard/command.json`
- `data/dashboard/approvals.json`
- `data/dashboard/agents.json`
- `data/dashboard/content.json`
- `data/dashboard/seo.json`
- `data/dashboard/affiliates.json`
- `data/dashboard/research.json`
- `data/dashboard/analytics.json`

It writes the generated local HTML viewer to:

- `data/local-dashboard/index.html`

The generated dashboard is ignored by Git. It shows Overview, Command, Approvals, Agents, Content, SEO, Affiliates, Research, and Analytics sections, plus a clear safety status bar with `READ_ONLY_REPORT_ONLY`, `canAutoApply false`, `approvedCount 0`, and `appliedCount 0`.

The validator checks that all nine dashboard JSON inputs exist, the generated HTML exists, every expected section is present, and the required safety text is displayed. It fails if the generated dashboard contains unsafe signals such as `canAutoApply true`, non-zero approval/application counts, unsafe live-apply wording, or unsafe Supabase-write wording.

The local dashboard shell is view-only. It never writes to Supabase, never publishes, never edits live content, never inserts affiliate URLs, never creates patch files, never creates update payloads, and never creates an approval/apply workflow.

## Dashboard Launcher And Smoke Test

Dashboard Launcher / Preview Runner + Smoke Test v1 is local-only tooling for the generated Watchdog HQ dashboard shell. It does not start a server and does not touch the live CryptoWatchdog website.

Build and validate the local dashboard first:

```bash
npm run dashboard:build
npm run dashboard:validate
```

Run the smoke test with:

```bash
npm run dashboard:smoke
```

Open/preview the dashboard path with:

```bash
npm run dashboard:open
```

The launcher checks that the generated dashboard exists, then prints the absolute local HTML path and a `file://` URL Danny can paste into a browser. The generated dashboard remains:

- `data/local-dashboard/index.html`

The smoke test reads the generated HTML and confirms it contains `READ_ONLY_REPORT_ONLY`, `canAutoApply false`, `approvedCount 0`, `appliedCount 0`, and the Overview, Command, Approvals, Agents, Content, SEO, Affiliates, Research, and Analytics sections. It fails if unsafe markers appear, including `canAutoApply true`, `apply live`, unsafe Supabase-write wording, `publish now`, non-zero approval/application counts, service-role wording, or API-key wording.

The launcher and smoke test are view-only/local-only. They never write outside `cw-content-brain`, never write to Supabase, never publish, never edit live content, never insert affiliate URLs, never create patch files, never create update payloads, and never create an approval/apply workflow.

## Dashboard UI Contract Guard

Dashboard UI Contract Guard v1 is a stricter local-only text/HTML contract check for the generated Watchdog HQ dashboard shell. Run it after building the dashboard:

```bash
npm run dashboard:build
npm run dashboard:ui-guard
```

The guard reads:

- `data/local-dashboard/index.html`

It checks that the dashboard clearly shows `Watchdog HQ`, `Local Dashboard Shell`, `READ_ONLY_REPORT_ONLY`, `Local only`, `Read only`, `No Supabase writes`, `No publishing`, `No approval/apply workflow`, `canAutoApply`, `approvedCount`, `appliedCount`, and the Overview, Command, Approvals, Agents, Content, SEO, Affiliates, Research, and Analytics sections. It also performs lightweight structure checks for the safety/status area, dashboard navigation, section/card content, and non-blank HTML length.

Recommended local dashboard check sequence:

```bash
npm run dashboard:build
npm run dashboard:validate
npm run dashboard:smoke
npm run dashboard:ui-guard
npm run dashboard:open
```

The UI guard fails if unsafe local dashboard wording appears, including `canAutoApply true`, non-zero approval/application markers, live apply/publish wording, Supabase write-enabled wording, service-role wording, or API-key wording. It is local-only/read-only, does not use Playwright or screenshots, does not create UI beyond validating the generated HTML, and never writes to Supabase, publishes, applies, edits live files, creates patches, or creates update payloads.
## Source Watchlist

Source Watchlist v1 is a planning-only source monitoring model for future Watchdog HQ work. It does not activate monitoring and does not crawl, fetch, scrape, call APIs, publish, apply, edit live files, insert affiliate links, write to Supabase, collect user/company data, make scam/fraud accusations, change trust ratings, or draw legal conclusions.

Build the local report with:

```bash
npm run content:source-watchlist
```

Validate the generated report with:

```bash
npm run content:source-watchlist-validate
```

The builder writes ignored local reports:

- `data/reports/source_watchlist_report.json`
- `data/reports/source_watchlist_report.md`

The report defines source categories for official company sources, regulator/enforcement sources, app/store/reputation sources, blockchain/evidence sources, security/research sources, SEO/content sources, and affiliate/commercial sources. Each watchlist item includes its category, source type, example source name, purpose, evidence value, risk level, suggested future check frequency, responsible department, future manager, future worker agent, planning-only status, human approval requirement, and notes.

Future signals must follow the lifecycle: Detected -> Suspected -> Verified -> Recommended -> Approved -> Applied. Source Watchlist v1 can only define possible signals, suspected issues, verified evidence requirements, and recommended routing. It creates no approved or applied actions.

Human approval is required before any future live monitoring connector and before any rating, content, affiliate, legal, publishing, or live-site action. The validator checks `READ_ONLY_REPORT_ONLY`, `canAutoApply: false`, zero approval/application counts, no live monitoring/fetching state, blocked actions, and unsafe marker absence.
## Agent Output Contract

Agent Output Contract v1 is a local read-only/report-only structure that defines the mandatory output format every future Watchdog HQ agent must use. It is foundational contract work only; it does not execute agents, publish, apply, edit live files, write to Supabase, insert affiliate links, crawl/fetch live sources, call APIs, make scam/fraud accusations, change trust ratings, or create an approval/apply workflow.

Build the local contract report with:

```bash
npm run content:agent-output-contract
```

Validate the generated contract with:

```bash
npm run content:agent-output-contract-validate
```

The builder writes ignored local reports:

- `data/reports/agent_output_contract_report.json`
- `data/reports/agent_output_contract_report.md`

The required lifecycle is:

Detected -> Suspected -> Verified -> Recommended -> Approved -> Applied

In v1, future agents may only produce `detected`, `suspected`, `verified`, or `recommended`. The `approved` and `applied` stages are blocked because approval is reserved for a future human approval workflow and application is reserved for a future Safe Apply Engine.

Every future agent output should include fields such as `outputId`, `agentId`, `department`, `manager`, `sourceReference`, `lifecycleStage`, `findingType`, `detectedSignal`, `suspectedIssue`, `verifiedEvidence`, `recommendation`, `confidenceLevel`, `evidenceStrength`, `evidenceGaps`, `riskLevel`, `requiresHumanApproval`, `recommendedReviewer`, `blockedActions`, `allowedActionsNow`, `nextStep`, and `status`.

The validator checks `READ_ONLY_REPORT_ONLY`, `canAutoApply: false`, zero approval/application counts, allowed/blocked stages, required output fields, safe valid examples, unsafe invalid examples, and unsafe marker absence. It fails if approved/applied stages appear where v1 output is allowed.
## QC Department v2 / Gatekeeper Grace

QC Department v2 / Gatekeeper Grace Expansion v1 is a local read-only/report-only contract for checking major agent outputs before they reach Danny or the Master AI Manager. It expands Gatekeeper Grace from a basic validator concept into a department-level safety gate.

Build the local QC v2 report with:

```bash
npm run content:qc-v2
```

Validate the generated report with:

```bash
npm run content:qc-v2-validate
```

The builder writes ignored local reports:

- `data/reports/qc_department_v2_report.json`
- `data/reports/qc_department_v2_report.md`

Gatekeeper Grace checks:

- `qc.check_safety_boundaries`: blocks unsafe action leakage such as Supabase writes, publishing, live edits, approval/apply workflow, affiliate URL insertion, secrets/API keys, live crawling/fetching, AI/API calls, generated output commits, scam/fraud accusation risk, and trust rating change risk.
- `qc.check_unsupported_claims`: flags scam/fraud allegations, safety claims, "tested by us" claims, user count claims, guarantee claims, ranking/best claims, fee claims, partnership claims, and trust rating claims that need evidence.
- `qc.check_affiliate_disclosure`: checks affiliate/commercial disclosure needs and undisclosed affiliate-placement risk.
- `qc.check_rating_change_risk`: blocks Green/Orange/Red trust rating change risk unless human review happens later.
- `qc.check_scam_wording_risk`: prevents overstatement where evidence is only detected, suspected, or incomplete.
- `qc.check_human_approval_needed`: classifies items that need Danny review.
- `qc.block_unsafe_recommendation`: blocks unsafe recommendations and routes them to non-apply lifecycle states.

QC v2 may route items to `blocked`, `needs_more_evidence`, `escalated_to_qc`, `escalated_to_master_ai`, or `recommended_for_danny_review`. It cannot approve or apply anything.

Allowed states are limited to `detected`, `suspected`, `verified`, `recommended`, `blocked`, `monitor_only`, `needs_more_evidence`, `escalated_to_qc`, `escalated_to_master_ai`, and `recommended_for_danny_review`. The `approved` and `applied` states are blocked.

This QC layer is local-only and report-only. It never writes to Supabase, publishes, edits live content, inserts affiliate URLs, creates approval/apply workflow, calls AI/APIs, runs live crawling/fetching, changes trust ratings, makes unsupported scam/fraud accusations, creates patch files, or creates update payloads.
## Department Inbox / Task Router

Department Inbox / Task Router v1 is a local read-only/report-only routing layer for future Watchdog HQ agent outputs. It does not execute tasks, publish, apply, edit live files, write to Supabase, insert affiliate links, crawl/fetch live sources, make scam/fraud accusations, change trust ratings, or create a live approval/apply workflow.

Build the local router report with:

```bash
npm run content:department-router
```

Validate the generated router report with:

```bash
npm run content:department-router-validate
```

The builder writes ignored local reports:

- `data/reports/department_task_router_report.json`
- `data/reports/department_task_router_report.md`

The router defines department inboxes for Master AI Manager, Quality Control Manager, Content, SEO, Affiliates, Research, Analytics, Trust & Safety, Evidence / Testing, Media / Images, Video, Social, Backlinks, Offers / Deals, Safe Apply Engine future-only, and Danny Approval key-decisions-only. Every inbox has `canApprove: false` and `canApply: false`.

Routing rules map future finding types such as `page_thinness`, `missing_internal_links`, `stale_review`, `unsupported_claim`, `scam_or_fraud_signal`, `regulator_notice`, `blockchain_evidence_signal`, `affiliate_disclosure_missing`, `analytics_drop`, `keyword_opportunity`, `duplicate_content_risk`, and `safe_apply_candidate` to the correct manager inboxes.

Managers may request more evidence, route to another manager, mark duplicate, mark monitor-only, request revision, escalate to QC, escalate to Master AI, recommend Danny review, or block due to risk. Managers may not publish, apply, write to Supabase, change ratings, add affiliate links, make scam/fraud accusations, finalise legal wording, approve final action, or execute safe apply.

All routed items preserve the lifecycle: Detected -> Suspected -> Verified -> Recommended -> Approved -> Applied. In v1, routed stages may only be `detected`, `suspected`, `verified`, or `recommended`; `approved` and `applied` are blocked.

## Human Decision Log / Audit Trail

Human Decision Log / Audit Trail v1 is a local read-only/report-only governance model for future Watchdog HQ decisions. It defines the future audit entry schema for agent outputs, department manager reviews, Quality Control decisions, Master AI Manager recommendations, and future Danny decision records.

Build the local audit model report with:

```bash
npm run content:decision-log
```

Validate the generated report with:

```bash
npm run content:decision-log-validate
```

The builder writes ignored local reports:

- `data/reports/human_decision_log_report.json`
- `data/reports/human_decision_log_report.md`

The decision lifecycle remains:

Detected -> Suspected -> Verified -> Recommended -> Approved -> Applied

In v1, audit stages may only document `detected`, `suspected`, `verified`, `recommended`, `blocked`, `monitor_only`, `needs_more_evidence`, `escalated_to_qc`, `escalated_to_master_ai`, or `recommended_for_danny_review`. The `approved` and `applied` stages are documented as future states only and are blocked in v1.

Future audit entries should record the source agent, department, lifecycle stage, finding type, evidence reference, confidence, routed manager, manager decision reason, QC decision reason, Master AI recommendation, future Danny decision reason, approval status, apply status, blocked actions, allowed actions, next step, and immutable note. Future Danny decision records are placeholders only in v1.

The immutable audit principle is that future applied entries should not be overwritten. Corrections should be appended as follow-up audit entries with their own reasons and evidence. Human decisions are required before any future rating, affiliate, legal, publishing, live-site, or Safe Apply action.

This audit trail phase is local-only and report-only. It does not create a live audit database, approve anything, apply anything, publish, edit live files, insert affiliate links, create patch files, create update payloads, call APIs, or write to Supabase.

## Base HQ Runbook

Base HQ Runbook v1 is the local read-only/report-only operating manual for the completed Watchdog HQ base structure. It is the final base-structure planning layer before real worker agents, live connectors, approval systems, or any future Safe Apply Engine.

Build the local runbook report with:

```bash
npm run content:base-runbook
```

Validate the generated report with:

```bash
npm run content:base-runbook-validate
```

The builder writes ignored local reports:

- `data/reports/base_hq_runbook_report.json`
- `data/reports/base_hq_runbook_report.md`

The runbook covers the completed base structure, daily local reporting flow, dashboard flow, source watchlist boundaries, agent output lifecycle, department routing, manager decisions, QC review, Master AI Manager filtering, Danny decision boundaries, human decision log/audit trail, blocked actions, future connector rules, future worker agent rules, future media/video rules, future affiliate rules, future content blueprint rules, and future Safe Apply rules.

The locked lifecycle remains:

Detected -> Suspected -> Verified -> Recommended -> Approved -> Applied

In the current base, allowed states include `detected`, `suspected`, `verified`, `recommended`, `blocked`, `monitor_only`, `needs_more_evidence`, `escalated_to_qc`, `escalated_to_master_ai`, and `recommended_for_danny_review`. The `approved` and `applied` states are blocked.

The runbook locks the content direction: CryptoWatchdog is evidence-led and opinion-led, not a generic AI content mill. Evidence comes first, opinion second, AI drafting third, SEO/media polish fourth, and human approval before anything important goes live. Pages should have a purpose, avoid random fluff, avoid unsupported claims, and use content-type evidence rules for reviews, updates, offers, guides, and warnings.

Future worker agents must use the Agent Output Contract, route through the Department Router, create audit entries, preserve lifecycle stage, state evidence gaps, avoid overclaiming, and escalate sensitive findings. They cannot approve/apply, publish, write to Supabase, change ratings, add affiliate links, or make unsupported scam/fraud/legal claims.

Future connectors must start read-only and local/export-only, with no committed secrets, no writes, no publishing, no Supabase writes unless explicitly approved later, no user data collection unless clearly approved, no live monitoring without human approval, and a validator.

Future Safe Apply Engine work is future-only. It must require preview, diff, human approval, rollback plan, audit entry, restricted permissions, no auto-apply by default, and explicit Danny approval for rating changes, scam/fraud/legal wording, or affiliate insertion.

This runbook phase is local-only and report-only. It does not execute tasks, create a live routing system, create an approval system, create applied states, write to Supabase, publish, edit live files, create a live audit database, change live connectors, create patch files, or create update payloads.

## Page Quality Profiler Agent

Page Quality Profiler Agent v1 is a local read-only/report-only agent that reviews available local snapshot content for weak, thin, badly structured, underdeveloped, unclear, stale, or blueprint-mismatched pages. It does not modify content and does not inspect the live website.

Build the local report with:

```bash
npm run content:page-quality
```

Validate the generated report with:

```bash
npm run content:page-quality-validate
```

The builder writes ignored local reports:

- `data/reports/page_quality_profiler_report.json`
- `data/reports/page_quality_profiler_report.md`

The profiler reads `data/content_snapshot/normalised_content.json` when present and produces page findings with page URL or ID, title/name, inferred page type, priority, weakness categories, evidence gaps, recommended next owner, recommended blueprint need, lifecycle state, confidence, false-positive risk, and safety flags.

Weakness categories include paper-thin pages, weak page purpose, bad or missing H1/H2/H3 structure, weak intros, missing how-it-works sections, missing why-people-use-it sections, missing CryptoWatchdog view, missing evidence/proof for reviews, missing screenshots/videos, missing related review cards, missing related guides/blogs/news/promos/warnings, missing comparison sections, weak internal links, poor CTA structure, bad images, generic AI wording, stale content, full rebuild need, and page-type blueprint needs.

Allowed lifecycle states are limited to `detected`, `suspected`, `verified`, `recommended`, `blocked`, `monitor_only`, `needs_more_evidence`, `escalated_to_qc`, `escalated_to_master_ai`, and `recommended_for_danny_review`. The `approved` and `applied` states are blocked.

This agent is local-only and report-only. It never writes to Supabase, publishes, edits live content, inserts affiliate URLs, creates approval/apply workflow, changes trust ratings, makes scam/fraud accusations, runs live crawling/fetching, creates patch files, or creates update payloads.

## Page Blueprint Agent

Page Blueprint Agent v1 is a local read-only/report-only agent that reads the Page Quality Profiler report and translates page weaknesses into recommended blueprint structures. It does not modify content and does not inspect the live website.

Build the local report with:

```bash
npm run content:page-blueprints
```

Validate the generated report with:

```bash
npm run content:page-blueprints-validate
```

Input:

- `data/reports/page_quality_profiler_report.json`

The builder writes ignored local reports:

- `data/reports/page_blueprint_agent_report.json`
- `data/reports/page_blueprint_agent_report.md`

Blueprint types are `review_blueprint`, `category_hub_blueprint`, `guide_blueprint`, `warning_scam_risk_blueprint`, `comparison_blueprint`, and `full_rebuild_blueprint`. Each recommendation includes the page URL or ID, title/name, inferred page type, source priority, recommended blueprint type, recommended structure sections, missing critical sections, optional enhancement sections, evidence requirements, media requirements, internal-linking requirements, affiliate disclosure requirements, risk/compliance notes, recommended next owner, and a non-apply lifecycle state.

The agent turns profiler findings into structure guidance only. For example, missing evidence/proof on a review becomes evidence/proof/testing requirements; weak hub pages become category hub structure; warning/scam-risk pages require verified-vs-suspected separation, source lists, evidence timelines, and human review.

Allowed lifecycle states are limited to `detected`, `suspected`, `verified`, `recommended`, `blocked`, `monitor_only`, `needs_more_evidence`, `escalated_to_qc`, `escalated_to_master_ai`, and `recommended_for_danny_review`. The `approved` and `applied` states are blocked.

This agent is local-only and report-only. It never writes to Supabase, publishes, edits live content, inserts affiliate URLs, creates approval/apply workflow, changes trust ratings, makes scam/fraud accusations, runs live crawling/fetching, creates patch files, or creates update payloads.

## Content Cluster / Related Sections Agent

Content Cluster / Related Sections Agent v1 is a local read-only/report-only agent that reads Page Quality Profiler and Page Blueprint Agent reports, then recommends the related content sections each page should eventually have. It plans structure only; it does not write live copy, insert links, or inspect the live website.

Build the local report with:

```bash
npm run content:clusters
```

Validate the generated report with:

```bash
npm run content:clusters-validate
```

Inputs:

- `data/reports/page_quality_profiler_report.json`
- `data/reports/page_blueprint_agent_report.json`
- `data/content_snapshot/normalised_content.json` when available

The builder writes ignored local reports:

- `data/reports/content_cluster_agent_report.json`
- `data/reports/content_cluster_agent_report.md`

Cluster types are `review_related_cluster`, `category_hub_cluster`, `guide_support_cluster`, `warning_safety_cluster`, `comparison_cluster`, and `full_rebuild_cluster`. Each recommendation includes related review needs, guide needs, warning needs, promo/news needs, comparison needs, internal-linking needs, sidebar/card needs, mobile stacking notes, anchor text guidance, relationship gaps, next owner, and a non-apply lifecycle state.

Related review cards are recommended for reviews, category hubs, comparisons, and full rebuild pages where relevant. Warning/scam-risk pages use careful language and safer-alternative planning only where appropriate. Affiliate/promotional sections are disclosure-review only and do not include affiliate URLs. Internal links should be natural, useful, and not keyword-stuffed.

Allowed lifecycle states are limited to `detected`, `suspected`, `verified`, `recommended`, `blocked`, `monitor_only`, `needs_more_evidence`, `escalated_to_qc`, `escalated_to_master_ai`, and `recommended_for_danny_review`. The `approved` and `applied` states are blocked.

This agent is local-only and report-only. It never writes to Supabase, publishes, edits live content, inserts affiliate URLs, creates approval/apply workflow, changes trust ratings, makes scam/fraud accusations, runs live crawling/fetching, creates patch files, or creates update payloads.

## Media + Video Brief Agent

Media + Video Brief Agent v1 is a local read-only/report-only agent that reads Page Quality Profiler, Page Blueprint Agent, and Content Cluster Agent reports, then recommends media needs for each page. It plans screenshots, proof blocks, diagrams, images, review cards, comparison visuals, alt text guidance, mobile media handling, and video brief outlines. It does not generate, download, upload, publish, or edit media.

Build the local report with:

```bash
npm run content:media-briefs
```

Validate the generated report with:

```bash
npm run content:media-briefs-validate
```

Inputs:

- `data/reports/page_quality_profiler_report.json`
- `data/reports/page_blueprint_agent_report.json`
- `data/reports/content_cluster_agent_report.json`
- `data/content_snapshot/normalised_content.json` when available

The builder writes ignored local reports:

- `data/reports/media_video_brief_agent_report.json`
- `data/reports/media_video_brief_agent_report.md`

Media brief types are `review_media_brief`, `category_hub_media_brief`, `guide_media_brief`, `warning_safety_media_brief`, `comparison_media_brief`, and `full_rebuild_media_brief`. Each recommendation includes screenshot needs, proof block needs, image needs, diagram needs, video brief needs, comparison visual needs, review card visual needs, mobile media notes, evidence requirements, risk/compliance notes, alt text guidance, next owner, and a non-apply lifecycle state.

Reviews can recommend proof/testing screenshots where relevant, but the agent must not claim testing happened unless evidence exists. Warning/scam-risk pages must use careful evidence-led media notes and must not create defamatory visual claims. Affiliate/promotional media is disclosure-review only and must not include raw affiliate URLs. Alt text should be descriptive, plain English, and not keyword-stuffed. Video briefs are outlines only, not production work.

Allowed lifecycle states are limited to `detected`, `suspected`, `verified`, `recommended`, `blocked`, `monitor_only`, `needs_more_evidence`, `escalated_to_qc`, `escalated_to_master_ai`, and `recommended_for_danny_review`. The `approved` and `applied` states are blocked.

This agent is local-only and report-only. It never writes to Supabase, publishes, edits live content, inserts affiliate URLs, creates approval/apply workflow, changes trust ratings, makes scam/fraud accusations, runs live crawling/fetching, generates images or videos, downloads external media, uploads media, creates patch files, or creates update payloads.

## Agent Capability Registry v2

Agent Capability Registry v2 is a local read-only/report-only workforce map for future Watchdog HQ agents. It prevents the system from becoming a loose script collection by defining departments, manager agents, worker agents, capability endpoints, allowed inputs, allowed outputs, blocked actions, escalation routes, lifecycle limits, maturity status, and future implementation priority.

Build the local report with:

```bash
npm run content:agent-capabilities
```

Validate the generated report with:

```bash
npm run content:agent-capabilities-validate
```

The builder writes ignored local reports:

- `data/reports/agent_capability_registry_v2_report.json`
- `data/reports/agent_capability_registry_v2_report.md`

Departments include Master AI Management, Quality Control, Audit Trail / Governance, Content, SEO, Internal Linking, Research / Evidence, Affiliate / Offers, Analytics, Backlinks, Social, Media / Video, Approvals, Safe Apply Engine, and Settings / Admin.

Named agents include The Gaffer, Gatekeeper Grace, Audit Alfie, Routey Rachel, Blueprint Bella, Thin Page Theo, Rewrite Rita, Rankhound, Keyword Kev, Cluster Clara, Linksmith, Inspector Proof, Screenshot Sam, Red Flag Rita, Claim Checker Colin, Rating Guard Rachel, Offer Owl, Expiry Eddie, Disclosure Daisy, Pixel Pete, Image Iris, Storyboard Sam, Social Sophie, Metric Molly, Backlink Barry, Approval Ava, and Safe Apply Sam.

Capability endpoint examples include `qc.check_safety_boundaries`, `qc.check_unsupported_claims`, `content.profile_page_quality`, `content.recommend_page_blueprint`, `content.recommend_related_sections`, `media.recommend_media_briefs`, `seo.check_title_meta`, `links.recommend_internal_links`, `affiliate.check_offer_expiry`, `analytics.import_ga4_signals`, `master.prioritise_tasks`, `approvals.prepare_human_review_item`, and `safe_apply.block_until_approved`.

Allowed maturity statuses are `planned`, `registered`, `basic_report_only`, `active_report_only`, `ai_assisted`, `manager_reviewed`, `qc_reviewed`, `approval_ready`, and `safe_apply_ready`. Current maturity in v2 must not exceed `active_report_only`; later statuses are target states only until future approved workflows exist.

Allowed lifecycle states are limited to `detected`, `suspected`, `verified`, `recommended`, `blocked`, `monitor_only`, `needs_more_evidence`, `escalated_to_qc`, `escalated_to_master_ai`, and `recommended_for_danny_review`. The `approved` and `applied` states are blocked.

Blocked actions include `publish`, `supabase_write`, `live_content_edit`, `affiliate_url_insert`, `trust_rating_change`, `approval_apply`, `secret_access`, `external_api_call`, `live_crawl`, `media_generation`, and `media_download`.

This registry is local-only and report-only. It never writes to Supabase, publishes, edits live content, inserts affiliate URLs, creates approval/apply workflow, changes trust ratings, makes scam/fraud accusations, runs live crawling/fetching, generates media, downloads media, calls AI APIs, calls external APIs, creates patch files, or creates update payloads.

### Rendered Verifier Troubleshooting

If all pages return `fetch_failed`, first check the `baseUrlCheck` section in `data/reports/rendered_page_verification.json` or `.md`. If the base URL fails, check internet access, site availability, whether `baseUrl` is wrong, and whether the Playwright browser is installed locally.

If the base URL succeeds but page URLs fail, inspect each result's `attemptedUrl`, `finalUrl`, `failureStage`, `httpStatus`, `errorName`, and `errorMessage`. This usually points to URL construction, route patterns, missing slugs, redirects, or a route that only exists under a different path.

If native fetch fallback succeeds but Playwright fails, compare `fallbackHttpStatus` and `fallbackContentLength` against the Playwright error. If native fetch also fails, inspect `fallbackErrorName` and `fallbackErrorMessage` for DNS, network, route, or security-challenge clues. That usually means the page is reachable over HTTP but the browser run needs timing, headless, browser-install, Cloudflare/security, or site-blocking investigation.

If the error is `ReferenceError: __name is not defined` during `page.evaluate`, the browser-context extraction function leaked a transpiler helper from the TypeScript runner. Fix `extractRenderedFacts()` so the browser-side code is plain serialised JavaScript; do not treat this as a website or URL failure.

## Phase 1C Supabase Export Helper

The Supabase export helper is optional and owner-run only. It is read-only, disabled by default, and requires local environment variables that must never be committed:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

To use it, the owner must manually set `enabled` to `true` in `config/supabase_export.config.json`, provide the environment variables locally, and run:

```bash
cd cw-content-brain
npm run content:export
```

The helper exports configured tables into local files:

- `data/content_snapshot/reviews.json`
- `data/content_snapshot/blog_posts.json`
- `data/content_snapshot/warnings.json`
- `data/content_snapshot/categories.json`
- `logs/supabase-export-run.json`

After exporting real files, update `config/content_snapshot.config.json` paths from:

- `reviews.example.json`
- `blog_posts.example.json`
- `warnings.example.json`
- `categories.example.json`

to:

- `reviews.json`
- `blog_posts.json`
- `warnings.json`
- `categories.json`

Then run the follow-up local audit:

```bash
npm run content:audit
npm run content:confidence
npm run content:queue
```

Do not commit private exported data or `.env` secrets. Keep `config/supabase_export.config.json` disabled unless actively exporting.

## Commands

Install and run only when approved:

```bash
cd cw-content-brain
npm install
npm run audit
npm run crawl
npm run seo
npm run links
npm run internal-links
npm run draft -- --type exchange_review --keyword "best crypto exchange" --topic "Example Exchange" --rating orange --notes "Draft only"
npm run update-draft -- --url https://cryptowatchdog.net/example-page
npm run content:export
npm run content:audit
npm run content:confidence
npm run content:queue
npm run content:metadata
npm run content:internal-links
npm run content:affiliates
npm run content:offers
npm run content:gsc
npm run content:ga4
npm run content:seo-brain
npm run content:research-guard
npm run content:agents
npm run content:master-queue
npm run content:fix-drafts
npm run content:preview-diffs
npm run content:approvals
npm run content:daily-brief
npm run content:qc
npm run content:qc-v2
npm run content:qc-v2-validate
npm run content:manager-escalations
npm run content:daily-run
npm run content:daily-pack
npm run content:dashboard-export
npm run content:dashboard-validate
npm run content:department-roadmap
npm run content:agent-output-contract
npm run content:agent-output-contract-validate
npm run content:department-router
npm run content:department-router-validate
npm run content:decision-log
npm run content:decision-log-validate
npm run content:base-runbook
npm run content:base-runbook-validate
npm run content:page-quality
npm run content:page-quality-validate
npm run content:page-blueprints
npm run content:page-blueprints-validate
npm run content:clusters
npm run content:clusters-validate
npm run content:media-briefs
npm run content:media-briefs-validate
npm run content:agent-capabilities
npm run content:agent-capabilities-validate
npm run content:source-watchlist
npm run content:source-watchlist-validate
npm run dashboard:build
npm run dashboard:validate
npm run dashboard:smoke
npm run dashboard:ui-guard
npm run dashboard:open
npm run content:verify-rendered
```

## Required Outputs

- `data/site_scan/site_inventory.json`
- `data/site_scan/site_inventory.csv`
- `data/reports/sitemap_discovery.json`
- `data/reports/seo_scores.json`
- `data/reports/seo_scores.csv`
- `data/reports/link_audit.json`
- `data/reports/internal_link_recommendations.json`
- `logs/phase1-run.json`
- `data/content_snapshot/normalised_content.json`
- `data/reports/content_quality_report.json`
- `data/reports/affiliate_placement_report.json`
- `data/reports/content_linking_report.json`
- `data/reports/audit_confidence_summary.json`
- `data/reports/audit_confidence_summary.md`
- `data/reports/priority_action_queue.json`
- `data/reports/priority_action_queue.md`
- `data/reports/metadata_suggestions.json`
- `data/reports/metadata_suggestions.md`
- `data/reports/internal_link_placement_suggestions.json`
- `data/reports/internal_link_placement_suggestions.md`
- `data/reports/affiliate_placement_suggestions.json`
- `data/reports/affiliate_placement_suggestions.md`
- `data/reports/offer_tracker_report.json`
- `data/reports/offer_tracker_report.md`
- `data/reports/search_console_report.json`
- `data/reports/search_console_report.md`
- `data/reports/ga4_report.json`
- `data/reports/ga4_report.md`
- `data/reports/seo_intelligence_queue.json`
- `data/reports/seo_intelligence_queue.md`
- `data/reports/research_duplicate_guard_report.json`
- `data/reports/research_duplicate_guard_report.md`
- `data/reports/agent_registry_report.json`
- `data/reports/agent_registry_report.md`
- `data/reports/master_command_queue.json`
- `data/reports/master_command_queue.md`
- `data/reports/fix_draft_suggestions.json`
- `data/reports/fix_draft_suggestions.md`
- `data/reports/preview_diff_report.json`
- `data/reports/preview_diff_report.md`
- `data/reports/approval_queue_report.json`
- `data/reports/approval_queue_report.md`
- `data/reports/master_daily_brief.json`
- `data/reports/master_daily_brief.md`
- `data/reports/quality_control_report.json`
- `data/reports/quality_control_report.md`
- `data/reports/qc_department_v2_report.json`
- `data/reports/qc_department_v2_report.md`
- `data/reports/manager_escalation_router_report.json`
- `data/reports/manager_escalation_router_report.md`
- `data/reports/daily_run_orchestrator_report.json`
- `data/reports/daily_run_orchestrator_report.md`
- `data/reports/daily_report_pack.json`
- `data/reports/daily_report_pack.md`
- `data/reports/dashboard_data_export_report.json`
- `data/reports/dashboard_data_export_report.md`
- `data/reports/dashboard_contract_validation_report.json`
- `data/reports/dashboard_contract_validation_report.md`
- `data/reports/department_roadmap_and_agent_coverage.json`
- `data/reports/department_roadmap_and_agent_coverage.md`
- `data/reports/agent_output_contract_report.json`
- `data/reports/agent_output_contract_report.md`
- `data/reports/department_task_router_report.json`
- `data/reports/department_task_router_report.md`
- `data/reports/human_decision_log_report.json`
- `data/reports/human_decision_log_report.md`
- `data/reports/base_hq_runbook_report.json`
- `data/reports/base_hq_runbook_report.md`
- `data/reports/page_quality_profiler_report.json`
- `data/reports/page_quality_profiler_report.md`
- `data/reports/page_blueprint_agent_report.json`
- `data/reports/page_blueprint_agent_report.md`
- `data/reports/content_cluster_agent_report.json`
- `data/reports/content_cluster_agent_report.md`
- `data/reports/media_video_brief_agent_report.json`
- `data/reports/media_video_brief_agent_report.md`
- `data/reports/agent_capability_registry_v2_report.json`
- `data/reports/agent_capability_registry_v2_report.md`
- `data/reports/source_watchlist_report.json`
- `data/reports/source_watchlist_report.md`
- `data/dashboard/overview.json`
- `data/dashboard/command.json`
- `data/dashboard/approvals.json`
- `data/dashboard/agents.json`
- `data/dashboard/content.json`
- `data/dashboard/seo.json`
- `data/dashboard/affiliates.json`
- `data/dashboard/research.json`
- `data/dashboard/analytics.json`
- `data/local-dashboard/index.html`
- `data/reports/rendered_page_verification.json`
- `data/reports/rendered_page_verification.md`
- `logs/content-snapshot-run.json`
- `logs/supabase-export-run.json`
