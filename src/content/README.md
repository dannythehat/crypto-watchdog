# Content (repo is the source of truth)

All site content lives here as files. The app reads them at build time via
`src/content/index.ts` (Vite `import.meta.glob`) — **no Supabase/Lovable needed
to publish content**. Push a change to this folder → the site rebuilds with it.

```
blog/<slug>.md        Blog posts / guides
reviews/<slug>.md     Platform reviews (structured fields in front matter)
warnings/<slug>.md    Scam warnings
categories.json       Category list
```

## File format
JSON-valued YAML front matter, then a Markdown body:

```md
---
type: "blog"
title: "The title"
slug: "the-title"
summary: "One-line summary used for meta description + cards"
category: "Safety"
image_url: "https://.../hero.png"
published: true
published_at: "2026-04-20T00:00:00Z"
---

## First section

Body in Markdown. [Internal links](/reviews/some-slug) and
[external citations](https://example.com) both render and are clickable.
```

## Editorial bar (EEAT)
2,000+ words · ≥1 image · internal links · external/citation links · clear
sections + FAQ. Run the audit any time:

```
node cw-content-brain/scripts/audit_eeat.mjs   # needs a local snapshot
```

## Workflow
- **Create**: add a new `*.md` file.
- **Update**: edit the file.
- **Unpublish**: set `published: false`.
- **Delete**: remove the file.

To pick up future edits made in the live DB (e.g. submissions-driven), re-run
`cw-content-brain/scripts/migrate_snapshot_to_content.mjs` against a fresh
snapshot — note it regenerates files, so it will overwrite local rewrites.
