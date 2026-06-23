// Content Automation Engine — Publish Worker (doc 05 gates → live).
//
// This is the ONLY component that can go public. It is the ignition. Per doc 06b it
// ships DISARMED: it will not transmit anything unless env.PUBLISH_ARMED==="true"
// AND the specific channel's credentials are present. On a fresh deploy it performs
// every gate check, logs what it WOULD do, and stops — "dry-run" mode — so Danny
// can watch it behave before he arms it.
//
// Order of gates (all must pass — doc 05):
//   1. item.status === APPROVED
//   2. reviews must have a human verdict
//   3. affiliate links pass the firewall (RED strips, min_trust filters, active-only)
//   4. if any link survives, disclosure_applied must be 1  (FTC hard gate)
//   5. AI-content labelling is attached to the payload

import { canPublish, resolvePublishableAffiliates } from "./lib/gates.js";

function uid(p) { return `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }

async function log(env, queueId, brandId, channel, result, detail) {
  await env.DB.prepare(
    "INSERT INTO publish_log (id, queue_id, brand_id, channel, result, detail) VALUES (?,?,?,?,?,?)",
  ).bind(uid("plog"), queueId, brandId, channel, result, String(detail).slice(0, 500)).run();
}

const armed = (env) => env.PUBLISH_ARMED === "true";

// ── Channel transmitters. Each is DISARMED unless armed + creds present. ────────
// Returns {result:'OK'|'SKIPPED'|'FAILED', detail}. None of these run live in the
// sandbox: PUBLISH_ARMED is unset and no creds exist, so all return SKIPPED.

async function publishWebsite(env, brand, item, links, disclosureText) {
  // Site reality (OPEN QUESTION in STATUS): the website is repo markdown, not a DB.
  // So "publish to website" = commit a markdown file to the site repo via the GitHub
  // API. Disarmed until GH_TOKEN + repo are configured AND PUBLISH_ARMED.
  if (!armed(env) || !env.GH_TOKEN || !env.SITE_REPO) {
    return { result: "SKIPPED", detail: "website disarmed (no GH_TOKEN/SITE_REPO or not armed)" };
  }
  // (Live commit logic intentionally omitted until Danny arms + confirms the model.)
  return { result: "SKIPPED", detail: "armed but commit path awaiting Danny's go" };
}

async function publishSocial(env, channel, brand, item) {
  // Social goes through Postiz (doc 02). Disarmed until POSTIZ_URL + POSTIZ_KEY set.
  if (!armed(env) || !env.POSTIZ_URL || !env.POSTIZ_KEY) {
    return { result: "SKIPPED", detail: `${channel} disarmed (no Postiz creds or not armed)` };
  }
  return { result: "SKIPPED", detail: `${channel} armed but send path awaiting Danny's go` };
}

async function brandRow(env, id) {
  return env.DB.prepare("SELECT * FROM brands WHERE id=?").bind(id).first();
}
async function affiliatesMap(env, brand) {
  const { results } = await env.DB.prepare("SELECT * FROM affiliates WHERE brand_id=?").bind(brand).all();
  return Object.fromEntries((results || []).map((a) => [a.id, a]));
}

export async function runPublish(env, limit = 5) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM content_queue WHERE status='APPROVED' ORDER BY reviewed_at ASC LIMIT ?",
  ).bind(limit).all();

  const report = [];
  for (const item of results || []) {
    const affs = await affiliatesMap(env, item.brand_id);
    const gate = canPublish(item, affs);
    if (!gate.ok) {
      await log(env, item.id, item.brand_id, "gate", "FAILED", gate.reasons.join("; "));
      report.push({ id: item.id, published: false, reasons: gate.reasons });
      continue;
    }

    const b = await brandRow(env, item.brand_id);
    const links = resolvePublishableAffiliates(item, affs); // post-firewall links
    const disclosureText = links.length > 0 ? b.disclosure : null; // only attach if links survive

    let config = {};
    try { config = JSON.parse(b.config_json || "{}"); } catch { /* ignore */ }
    const channels = config.channels || {};

    const channelResults = {};
    // Website
    if (channels.website?.enabled) {
      const r = await publishWebsite(env, b, item, links, disclosureText);
      channelResults.website = r;
      await log(env, item.id, item.brand_id, "website", r.result, r.detail);
    }
    // Social channels
    for (const ch of ["x", "instagram", "facebook"]) {
      if (channels[ch]?.enabled) {
        const r = await publishSocial(env, ch, b, item);
        channelResults[ch] = r;
        await log(env, item.id, item.brand_id, ch, r.result, r.detail);
      }
    }

    // Only flip to PUBLISHED if at least one channel actually transmitted (OK).
    const anyLive = Object.values(channelResults).some((r) => r.result === "OK");
    if (anyLive) {
      await env.DB.prepare(
        "UPDATE content_queue SET status='PUBLISHED', published_at=datetime('now') WHERE id=?",
      ).bind(item.id).run();
    }
    report.push({
      id: item.id,
      armed: armed(env),
      published: anyLive,
      survivingLinks: links.length,
      disclosureAttached: Boolean(disclosureText),
      channels: channelResults,
    });
  }
  return { armed: armed(env), processed: report.length, report };
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runPublish(env));
  },
  async fetch(_request, env) {
    const res = await runPublish(env);
    return new Response(JSON.stringify({ ok: true, ...res }, null, 2), {
      headers: { "content-type": "application/json" },
    });
  },
};
