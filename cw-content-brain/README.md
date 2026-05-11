# CryptoWatchdog Content Brain

Phase 1 creates a self-contained Node/TypeScript content operating layer for CryptoWatchdog. It defines the editorial model, risk language, content schemas, prompt templates, audit scripts, draft tooling, and review workflow needed to produce trustworthy drafts without touching the Lovable app or Supabase data.

Phase 1A upgrades discovery to sitemap-first crawling. CryptoWatchdog.net is a Vite/React/Supabase single-page app, so raw HTML fetches may return the React app shell rather than fully rendered article content. Sitemap URLs are still useful for inventory, SEO metadata checks, link reporting, and update planning, but full content analysis requires a read-only content snapshot or a later browser-rendered crawler. No Supabase writes are performed by this tool.

Phase 1B adds a read-only local content snapshot layer. The content brain can analyse Supabase-shaped JSON exports placed in `data/content_snapshot/` without connecting to Supabase, writing to Supabase, editing site content, or publishing anything.

Phase 1C adds an optional owner-controlled Supabase export helper. It is disabled by default, uses local environment variables only, exports configured tables into local JSON files, and never writes back to Supabase.

The audit reports now include confidence and false-positive-risk fields. Findings are possible issues, not confirmed defects, and should be triaged before any Priority Action Queue or content change is created.

The Priority Action Queue ranks possible fixes using confidence, false-positive risk, severity, issue type, and page-level combinations. It does not edit or publish anything.

Rendered Page Verifier v1 optionally checks live rendered React pages against queue findings so injected disclosures, links, metadata, and page components can reduce false positives before exact fixes are assigned. It does not edit pages, publish content, or write to Supabase.

Phase 2A adds a read-only Metadata Engine v1. It analyses local snapshot content and rendered verifier facts when available, then produces draft-only metadata suggestions for human review. It does not edit pages, publish content, write to Supabase, or verify claims.

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

## Folder Map

- `workflow/phase-1.md`: operating flow from intake to publish-ready draft.
- `taxonomy/risk-signals.md`: shared risk signal language and rating guidance.
- `schemas/content-item.schema.json`: JSON schema for draft content items.
- `prompts/content-system.md`: system prompt for draft generation.
- `prompts/review-checklist.md`: human review checklist prompt.
- `seeds/editorial-calendar.json`: starter content calendar for Phase 1.
- `seeds/source-register.json`: neutral source categories to guide evidence gathering.
- `scripts/`: standalone audit, crawl, SEO, link, draft, content snapshot, confidence summary, priority queue, rendered verification, metadata suggestions, and optional export commands.
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
- `data/reports/rendered_page_verification.json`
- `data/reports/rendered_page_verification.md`
- `logs/content-snapshot-run.json`
- `logs/supabase-export-run.json`
