# CryptoWatchdog Content Brain

Phase 1 creates a self-contained Node/TypeScript content operating layer for CryptoWatchdog. It defines the editorial model, risk language, content schemas, prompt templates, audit scripts, draft tooling, and review workflow needed to produce trustworthy drafts without touching the Lovable app or Supabase data.

Phase 1A upgrades discovery to sitemap-first crawling. CryptoWatchdog.net is a Vite/React/Supabase single-page app, so raw HTML fetches may return the React app shell rather than fully rendered article content. Sitemap URLs are still useful for inventory, SEO metadata checks, link reporting, and update planning, but full content analysis requires a read-only content snapshot or a later browser-rendered crawler. No Supabase writes are performed by this tool.

Phase 1B adds a read-only local content snapshot layer. The content brain can analyse Supabase-shaped JSON exports placed in `data/content_snapshot/` without connecting to Supabase, writing to Supabase, editing site content, or publishing anything.

## Goals

- Standardize how platform reviews, scam warnings, and education posts are researched and drafted.
- Keep content decisions auditable through source notes, confidence levels, and human review gates.
- Separate draft planning from production publishing.
- Avoid secrets, automated publishing, Supabase writes, or deployment coupling.
- Discover public site URLs from `https://cryptowatchdog.net/sitemap.xml` before using fallback route manifests.
- Analyse real exported content bodies from local JSON snapshots before recommending edits.

## Folder Map

- `workflow/phase-1.md`: operating flow from intake to publish-ready draft.
- `taxonomy/risk-signals.md`: shared risk signal language and rating guidance.
- `schemas/content-item.schema.json`: JSON schema for draft content items.
- `prompts/content-system.md`: system prompt for draft generation.
- `prompts/review-checklist.md`: human review checklist prompt.
- `seeds/editorial-calendar.json`: starter content calendar for Phase 1.
- `seeds/source-register.json`: neutral source categories to guide evidence gathering.
- `scripts/`: standalone audit, crawl, SEO, link, draft, and content snapshot commands.
- `src/lib/`: shared filesystem, CSV, route, sitemap, scoring, text, logger, and type helpers.
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

These reports are recommendations for human review. The tools do not connect to Supabase, write to Supabase, edit existing site content, publish content, or add affiliate links. A future Phase 1C can add a safe Supabase export helper that remains read-only.

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
npm run content:audit
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
- `logs/content-snapshot-run.json`
