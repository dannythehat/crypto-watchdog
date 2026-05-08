# Supabase Export Helper Guide

Phase 1C adds an optional owner-run helper for exporting CryptoWatchdog content rows into local JSON snapshot files.

## What It Does

1. It does not write to Supabase.
2. It only exports configured table rows into local JSON files under `data/content_snapshot/`.
3. It uses `SUPABASE_URL` and `SUPABASE_ANON_KEY` from your local environment.
4. It writes a local run log to `logs/supabase-export-run.json`.
5. The next audit reads the local JSON snapshots.

## Safety Rules

- Do not commit real exported data if it is private.
- Do not commit `.env` files or secrets.
- Keep `config/supabase_export.config.json` disabled unless you are actively exporting.
- Use the helper only when you are the owner and intend to run a read-only export.
- Review exported files before sharing them.

## Owner Flow

1. Add local environment variables in your shell or local `.env` file:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
2. Temporarily set `enabled` to `true` in `config/supabase_export.config.json`.
3. Run `npm run content:export` from `cw-content-brain/`.
4. Confirm JSON files were written under `data/content_snapshot/`.
5. Update `config/content_snapshot.config.json` to point from `.example.json` files to the exported `.json` files.
6. Run `npm run content:audit`.
7. Set the export config back to disabled when finished.
