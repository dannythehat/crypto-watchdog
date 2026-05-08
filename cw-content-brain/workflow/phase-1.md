# Phase 1 Workflow

## 1. Intake

Capture the content request as one of:

- `platform_review`
- `scam_warning`
- `education_post`
- `market_safety_note`

Record the target audience, intended route, publication urgency, and known source leads.

## 2. Evidence Gathering

Collect source notes before drafting. Prefer primary or high-accountability sources where available:

- official platform documentation
- regulator notices
- blockchain explorer records
- company registry records
- public incident reports
- reputable security research
- user-submitted evidence that can be independently checked

Every source note should include a URL or stable citation, retrieval date, claim summary, and confidence level.

## 3. Risk Classification

Map findings to the risk signals in `taxonomy/risk-signals.md`. Use the lowest defensible severity when evidence is incomplete. Escalate only when multiple independent signals support the claim.

## 4. Drafting

Draft with a clear distinction between observed facts, reasonable analysis, and unresolved questions. Avoid direct accusations unless supported by authoritative evidence.

Required draft sections:

- title
- summary
- key findings
- evidence notes
- risk rating or severity
- user action guidance
- human review notes

## 5. Human Review

Use `prompts/review-checklist.md` before publication. A reviewer should confirm factual accuracy, source quality, tone, potential legal sensitivity, and whether the content is suitable for the public site.

## 6. Publish Handoff

When approved, hand content to the app or Supabase publishing process through the existing human-controlled workflow. This Phase 1 folder does not publish anything automatically.

