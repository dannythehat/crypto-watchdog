# CryptoWatchdog Content Brain

Phase 1 creates a self-contained content operating layer for CryptoWatchdog. It defines the editorial model, risk language, content schemas, prompt templates, and review workflow needed to produce trustworthy drafts without touching the Lovable app or Supabase data.

## Goals

- Standardize how platform reviews, scam warnings, and education posts are researched and drafted.
- Keep content decisions auditable through source notes, confidence levels, and human review gates.
- Separate draft planning from production publishing.
- Avoid secrets, automated writes, crawler execution, or deployment coupling.

## Folder Map

- `workflow/phase-1.md`: operating flow from intake to publish-ready draft.
- `taxonomy/risk-signals.md`: shared risk signal language and rating guidance.
- `schemas/content-item.schema.json`: JSON schema for draft content items.
- `prompts/content-system.md`: system prompt for draft generation.
- `prompts/review-checklist.md`: human review checklist prompt.
- `seeds/editorial-calendar.json`: starter content calendar for Phase 1.
- `seeds/source-register.json`: neutral source categories to guide evidence gathering.

## Phase 1 Boundaries

This folder is documentation and structured planning only. It does not install dependencies, scrape websites, call APIs, publish pages, mutate database records, or change application code.

