# EEAT Content Rewrites

Rebuilt, EEAT-compliant versions of weak CryptoWatchdog articles, produced from
the audit in `cw-content-brain/scripts/audit_eeat.mjs`.

## The bar every rewrite meets
- **2,000+ words** of original, evidence-led body copy
- **≥1 image** (existing hero kept; extra inline images specified as *image briefs* for generation — this pipeline never generates or uploads media)
- **Internal links** to relevant CryptoWatchdog reviews / warnings / guides (verified against the live slug list)
- **External citations** to primary/authoritative sources (regulators, protocol docs, ethereum.org, reputable press)
- **Clear structure**: multiple H2/H3 sections + an FAQ
- **Brand voice**: calm, evidence-led, no hype, no price predictions, uncertainty flagged (`config/brand_voice.json`)

## File format
Each `*.md` file has YAML front matter (target slug, category, meta fields, image
briefs, internal links, sources) followed by the new article body that goes
straight into the `content` field of the Supabase row.

## Status
See `STATUS.md` for the rolling worst-first progress tracker.

## Publishing
Nothing here is published automatically. After review, the body copy is pushed to
Supabase as a **draft** (`published=false`) — via the planned `agent-ingest` edge
function or a manual Lovable import — and a human publishes from the admin UI.
This matches `site.config.json` (`publishing` and `supabase_writes` are
approval-required).
