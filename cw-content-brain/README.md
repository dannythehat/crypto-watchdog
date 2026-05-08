# CryptoWatchdog Content Brain

Phase 1 creates a self-contained Node/TypeScript content operating layer for CryptoWatchdog. It defines the editorial model, risk language, content schemas, prompt templates, audit scripts, draft tooling, and review workflow needed to produce trustworthy drafts without touching the Lovable app or Supabase data.

## Goals

- Standardize how platform reviews, scam warnings, and education posts are researched and drafted.
- Keep content decisions auditable through source notes, confidence levels, and human review gates.
- Separate draft planning from production publishing.
- Avoid secrets, automated publishing, Supabase writes, or deployment coupling.

## Folder Map

- `workflow/phase-1.md`: operating flow from intake to publish-ready draft.
- `taxonomy/risk-signals.md`: shared risk signal language and rating guidance.
- `schemas/content-item.schema.json`: JSON schema for draft content items.
- `prompts/content-system.md`: system prompt for draft generation.
- `prompts/review-checklist.md`: human review checklist prompt.
- `seeds/editorial-calendar.json`: starter content calendar for Phase 1.
- `seeds/source-register.json`: neutral source categories to guide evidence gathering.
- `scripts/`: standalone audit, crawl, SEO, link, and draft commands.
- `src/lib/`: shared filesystem, CSV, route, scoring, text, logger, and type helpers.
- `data/`: generated inventory, reports, research, keywords, YouTube, affiliate, and draft outputs.

## Phase 1 Boundaries

This folder is standalone tooling and structured planning only. It does not publish pages, mutate database records, change application code, or store secrets.

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
```

## Required Outputs

- `data/site_scan/site_inventory.json`
- `data/site_scan/site_inventory.csv`
- `data/reports/seo_scores.json`
- `data/reports/seo_scores.csv`
- `data/reports/link_audit.json`
- `data/reports/internal_link_recommendations.json`
- `logs/phase1-run.json`
