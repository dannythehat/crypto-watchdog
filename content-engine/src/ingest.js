// Content Automation Engine — Ingest Worker (doc 02 Sources → NEW rows).
//
// Cron-triggered. Pulls each ACTIVE source for each ACTIVE brand and inserts NEW
// content_queue rows for the draft Worker to flesh out. It writes nothing public.
//
// HARD STOP STATUS: sources are seeded INACTIVE, so on a fresh DB this Worker is a
// no-op by design. It will only fetch once Danny activates a source. The blocklist
// (KV) is consulted so we never re-ingest known-spam/duplicate refs.
//
// Cron note (doc 02): Cloudflare cron is UTC-only, no auto-retry, 10ms CPU budget —
// keep per-invocation work small; one source pull per tick if needed.

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function activeBrands(env) {
  const { results } = await env.DB.prepare(
    "SELECT id FROM brands WHERE is_active=1",
  ).all();
  return (results || []).map((r) => r.id);
}

async function activeSources(env, brand) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM sources WHERE brand_id=? AND is_active=1",
  ).bind(brand).all();
  return results || [];
}

// Pluggable per source-type fetchers. Live fetchers are intentionally NOT wired —
// they return [] until Danny supplies feeds/keys. Pure, so they stay testable.
async function fetchSource(source /*, env */) {
  switch (source.type) {
    case "manual":
      return []; // manual items are created via the dashboard, not pulled
    case "rss":
    case "news_api":
    case "deals_feed":
    case "affiliate_feed":
      // HARD STOP: no live feed wired. Return nothing until configured.
      return [];
    default:
      return [];
  }
}

async function isBlocked(env, ref) {
  if (!env.KV) return false;
  const hit = await env.KV.get(`block:${ref}`);
  return hit !== null;
}

export async function runIngest(env) {
  let inserted = 0;
  for (const brand of await activeBrands(env)) {
    for (const source of await activeSources(env, brand)) {
      const raw = await fetchSource(source, env);
      for (const r of raw) {
        if (await isBlocked(env, r.raw_ref)) continue;
        // de-dupe by raw_ref
        const dup = await env.DB.prepare(
          "SELECT 1 FROM content_queue WHERE raw_ref=? LIMIT 1",
        ).bind(r.raw_ref).first();
        if (dup) continue;
        await env.DB.prepare(
          `INSERT INTO content_queue (id, brand_id, source_id, content_type, status, title, raw_ref, ai_generated)
           VALUES (?,?,?,?, 'NEW', ?, ?, 1)`,
        ).bind(uid("q"), brand, source.id, r.content_type || "news", r.title || null, r.raw_ref).run();
        inserted++;
      }
    }
  }
  return { inserted };
}

export default {
  // Cron entry point.
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runIngest(env));
  },
  // Manual trigger for testing (still inserts only NEW rows, nothing public).
  async fetch(_request, env) {
    const res = await runIngest(env);
    return new Response(JSON.stringify({ ok: true, ...res }), {
      headers: { "content-type": "application/json" },
    });
  },
};
