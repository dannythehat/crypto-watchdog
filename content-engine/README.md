# Content Automation Engine

Brand-agnostic content pipeline: **Sources → Draft (Claude) → Approval Queue (human gate) → Publish (website + social)**. Built from the Drive blueprint (docs 00–07). Currently runs **Crypto Watchdog**; a second brand (Little Tiny Treasures) switches on later by adding a row — no code changes.

> **Status: machinery built, ignition OFF.** Nothing here publishes, posts, spends, or touches a live account until Danny arms it. See "Arming" at the bottom.

## What's here

```
content-engine/
  schema.sql        D1 schema (doc 02) — brands, sources, content_queue, affiliates, publish_log
  seed.sql          FAKE seed data — CW active, LTT off, 4 test queue items, inactive affiliates
  wrangler.toml     Cloudflare config TEMPLATE (placeholder IDs, no secrets, PUBLISH_ARMED=false)
  src/
    lib/gates.js    Compliance gates (doc 05): disclosure gate, RED-strip, trust firewall — PURE
    core.js         Approval Dashboard API Worker (the human gate)
    ingest.js       Cron: sources → NEW rows (inert until sources activated)
    draft.js        Cron: NEW → PENDING_REVIEW via Claude (inert until ANTHROPIC_API_KEY set)
    publish.js      Cron: APPROVED → live (DISARMED until PUBLISH_ARMED=true + per-channel creds)
  dashboard/        Mobile-first approval UI (static, talks to core.js API)
  test/dry-run.mjs  Offline acceptance test (node:sqlite, no network)
```

## Verify it works offline (no Cloudflare needed)

```bash
node --experimental-sqlite content-engine/test/dry-run.mjs
```

This loads the real `schema.sql` + `seed.sql` into in-memory SQLite and asserts every doc-05 gate (review needs verdict; disclosure gate; RED strips links; trust threshold; only APPROVED+disclosure publishes). Expect **20 passed, 0 failed**.

## Provisioning (when you have a networked machine + Cloudflare login)

These are **reversible** and create empty resources only:

```bash
cd content-engine
wrangler login

# 1. D1 database — copy the printed database_id into wrangler.toml
wrangler d1 create content-engine

# 2. KV namespace (blocklist) — copy the id into wrangler.toml
wrangler kv namespace create blocklist

# 3. R2 bucket (images)
wrangler r2 bucket create content-engine-images

# 4. Load schema + fake seed into D1
wrangler d1 execute content-engine --file=schema.sql
wrangler d1 execute content-engine --file=seed.sql

# 5. Deploy the four Workers (still inert — no secrets, PUBLISH_ARMED=false)
wrangler deploy                       # core (dashboard API)
wrangler deploy --env ingest
wrangler deploy --env draft
wrangler deploy --env publish

# 6. Dashboard token (so only you can use the queue)
wrangler secret put DASH_TOKEN        # core
```

At this point the dashboard works against fake data and **nothing is public**.

## Arming (Danny only — the ignition)

Each step below switches on exactly one capability. Do them one at a time.

| To enable | Set secret / flag | Effect |
|---|---|---|
| Drafting | `wrangler secret put ANTHROPIC_API_KEY --env draft` | draft Worker starts writing drafts |
| Website publish | `wrangler secret put GH_TOKEN --env publish` + `SITE_REPO` | publish can commit markdown to the site repo |
| Social publish | `POSTIZ_URL` + `POSTIZ_KEY` (`--env publish`) | publish can post to X/IG/FB via Postiz |
| **Go live** | set `PUBLISH_ARMED = "true"` in `wrangler.toml`, redeploy publish | **ignition ON** |

Until `PUBLISH_ARMED="true"` **and** a channel's creds exist, the publish Worker runs in **dry-run**: it checks every gate and logs what it *would* send, then stops.

## Open questions for Danny

1. **Website publishing model.** The live site (`cryptowatchdog.net`) is **repo markdown** built by Vite, not a database. So "publish to website" means *commit a `.md` file to the site repo*, not write a DB row (the blueprint assumed Supabase content tables). The publish Worker is scaffolded for the git-commit path — confirm that's how you want it, and which repo/branch.
2. **Cloudflare provisioning** can't run from this sandbox (no network/login). The commands above are ready for when you run them on a connected machine, or you can grant access and I'll run them.
3. **Little Tiny Treasures** compliance profile is a stub (`TBD`) and the brand is OFF. Doc 05 flags heightened FTC scrutiny if any content targets children — needs its own disclosure + rules before switch-on.
