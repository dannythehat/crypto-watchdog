# CryptoWatchdog Edge Functions

Two functions that give the content/SEO agent a direct, Lovable-free read/write
path to the content tables.

| Function | Purpose | Method |
|---|---|---|
| `content-read` | Pull a full snapshot of all content **including drafts** (service-role, bypasses RLS) | GET/POST |
| `agent-ingest` | Create / update / publish / unpublish / delete content | POST |

Both require `Authorization: Bearer <AGENT_INGEST_TOKEN>`. Only the bearer token
ever leaves the server — the service-role key stays inside the function as a
Supabase secret.

## One-time deploy

```bash
# 1. Generate a long random token and store it as a secret
openssl rand -hex 32                       # copy the output
supabase secrets set AGENT_INGEST_TOKEN=<paste-token>

# 2. Deploy (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected automatically)
supabase functions deploy content-read
supabase functions deploy agent-ingest
```

Project ref: `pubmhnynxpcngxcgwcgf` →
`https://pubmhnynxpcngxcgwcgf.supabase.co/functions/v1/<function>`

Then give me the token (store it as the `AGENT_INGEST_TOKEN` env var in this
environment) and add `pubmhnynxpcngxcgwcgf.supabase.co` to the network egress
allowlist. After that I can refresh snapshots and push content on my own.

## Examples

```bash
BASE=https://pubmhnynxpcngxcgwcgf.supabase.co/functions/v1
TOKEN=...   # AGENT_INGEST_TOKEN

# Read everything (incl. drafts)
curl -s "$BASE/content-read" -H "Authorization: Bearer $TOKEN"

# Upsert a rewritten blog post (lands as draft unless published:true)
curl -s "$BASE/agent-ingest" -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"upsert","table":"blog_posts","rows":[{"slug":"my-post","title":"...","content":"...","summary":"...","category":"Education","published":false}]}'

# Unpublish a dead/stale page (reversible)
curl -s "$BASE/agent-ingest" -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"unpublish","table":"blog_posts","slugs":["weekly-watchdog-report-april-7-11-2026"]}'
```

## Safety model
- Deletes are **soft by default** (`published=false`); permanent removal needs `hard:true`.
- Upserts default new rows to `published=false`.
- Table access is allow-listed to `blog_posts`, `reviews`, `warnings`, `categories`.
