# CryptoWatchdog Content Brain

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
npm run content:manager-escalations
npm run content:daily-run
npm run content:daily-pack
npm run content:dashboard-export
npm run content:dashboard-validate
npm run content:department-roadmap
npm run dashboard:build
npm run dashboard:validate
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
npm run content:manager-escalations
npm run content:daily-run
npm run content:daily-pack
npm run content:dashboard-export
npm run content:dashboard-validate
npm run content:department-roadmap
npm run dashboard:build
npm run dashboard:validate
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
