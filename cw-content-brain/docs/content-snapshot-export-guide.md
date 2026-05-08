# Content Snapshot Export Guide

Phase 1B uses local JSON snapshots only. It does not connect to Supabase, write to Supabase, publish content, or edit the Lovable app.

## Manual Export Flow

1. Export rows from Supabase manually as JSON for the tables you want to inspect.
2. Place the exported files in `cw-content-brain/data/content_snapshot/`.
3. Match the paths in `cw-content-brain/config/content_snapshot.config.json`.
4. Run the content snapshot audit only when you are ready to analyse the local files.

## Expected Files

- `data/content_snapshot/reviews.example.json`
- `data/content_snapshot/blog_posts.example.json`
- `data/content_snapshot/warnings.example.json`
- `data/content_snapshot/categories.example.json`

You can replace the example files with owner-exported JSON snapshots, but do not commit private exports or secrets.

## Safety

The content snapshot tools are read-only. Findings are recommendations for human review and should not be treated as publication instructions.
