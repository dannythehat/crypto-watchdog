// Content Automation Engine — Core Worker (doc 03 Approval Dashboard API).
//
// This is the HUMAN GATE. It serves the dashboard's JSON API over D1. It does NOT
// publish anything itself — approval only moves an item to APPROVED; the publish
// Worker (publish.js) is the only thing that goes live, and it re-checks every gate.
//
// Bindings (wrangler.toml): DB (D1), KV (blocklist), R2 (images), DASH_TOKEN (secret).
// Auth: a single bearer token (DASH_TOKEN) — this is a private, single-operator tool.
//
// Brand-agnostic: every query is scoped by ?brand=<id>; no hard-coded brand names.

import { canApprove, canPublish, parseVerdict } from "./lib/gates.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const bad = (msg, status = 400) => json({ ok: false, error: msg }, status);

function authed(request, env) {
  if (!env.DASH_TOKEN) return false; // fail closed if no token configured
  const h = request.headers.get("authorization") || "";
  return h === `Bearer ${env.DASH_TOKEN}`;
}

async function affiliatesMap(env, brand) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM affiliates WHERE brand_id = ?",
  ).bind(brand).all();
  return Object.fromEntries((results || []).map((a) => [a.id, a]));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Health check is open; everything else needs the bearer token.
    if (pathname === "/api/health") return json({ ok: true, ts: Date.now() });
    if (!pathname.startsWith("/api/")) return bad("Not found", 404);
    if (!authed(request, env)) return bad("Unauthorized", 401);

    const brand = url.searchParams.get("brand") || "cryptowatchdog";

    try {
      // GET /api/queue?brand=&status= — list items for the dashboard.
      if (pathname === "/api/queue" && request.method === "GET") {
        const status = url.searchParams.get("status");
        const sql = status
          ? "SELECT * FROM content_queue WHERE brand_id=? AND status=? ORDER BY created_at DESC"
          : "SELECT * FROM content_queue WHERE brand_id=? ORDER BY created_at DESC";
        const stmt = status
          ? env.DB.prepare(sql).bind(brand, status)
          : env.DB.prepare(sql).bind(brand);
        const { results } = await stmt.all();
        const affs = await affiliatesMap(env, brand);
        const items = (results || []).map((it) => ({
          ...it,
          _gates: {
            approve: canApprove(it),
            publish: canPublish(it, affs),
            verdict: parseVerdict(it),
          },
        }));
        return json({ ok: true, brand, count: items.length, items });
      }

      // GET /api/item?id= — single item with gate state.
      if (pathname === "/api/item" && request.method === "GET") {
        const id = url.searchParams.get("id");
        const it = await env.DB.prepare(
          "SELECT * FROM content_queue WHERE id=? AND brand_id=?",
        ).bind(id, brand).first();
        if (!it) return bad("Not found", 404);
        const affs = await affiliatesMap(env, brand);
        return json({
          ok: true,
          item: { ...it, _gates: { approve: canApprove(it), publish: canPublish(it, affs) } },
        });
      }

      // POST actions take a JSON body { id, ... }.
      if (request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const id = body.id;
        if (!id) return bad("Missing id");
        const it = await env.DB.prepare(
          "SELECT * FROM content_queue WHERE id=? AND brand_id=?",
        ).bind(id, brand).first();
        if (!it) return bad("Item not found", 404);

        // POST /api/set-verdict { id, rating, note } — the human trust call (doc 05).
        if (pathname === "/api/set-verdict") {
          const rating = String(body.rating || "").toUpperCase();
          if (!["GREEN", "ORANGE", "RED"].includes(rating)) return bad("rating must be GREEN|ORANGE|RED");
          await env.DB.prepare(
            "UPDATE content_queue SET human_verdict=?, reviewed_at=datetime('now') WHERE id=?",
          ).bind(JSON.stringify({ rating, note: body.note || "" }), id).run();
          return json({ ok: true, id, verdict: { rating, note: body.note || "" } });
        }

        // POST /api/edit { id, title?, body_md?, social_variants?, editor_notes? }
        if (pathname === "/api/edit") {
          const fields = [];
          const vals = [];
          for (const k of ["title", "body_md", "social_variants", "editor_notes", "image_prompt"]) {
            if (k in body) { fields.push(`${k}=?`); vals.push(body[k]); }
          }
          if (fields.length === 0) return bad("No editable fields supplied");
          vals.push(id);
          await env.DB.prepare(
            `UPDATE content_queue SET ${fields.join(", ")} WHERE id=?`,
          ).bind(...vals).run();
          return json({ ok: true, id, updated: fields.length });
        }

        // POST /api/set-disclosure { id, applied } — toggle the FTC disclosure flag.
        if (pathname === "/api/set-disclosure") {
          const applied = body.applied ? 1 : 0;
          await env.DB.prepare(
            "UPDATE content_queue SET disclosure_applied=? WHERE id=?",
          ).bind(applied, id).run();
          return json({ ok: true, id, disclosure_applied: applied });
        }

        // POST /api/approve { id } — human gate. Re-checks canApprove; sets APPROVED.
        if (pathname === "/api/approve") {
          const gate = canApprove(it);
          if (!gate.ok) return json({ ok: false, error: "Cannot approve", reasons: gate.reasons }, 422);
          await env.DB.prepare(
            "UPDATE content_queue SET status='APPROVED', reviewed_at=datetime('now') WHERE id=?",
          ).bind(id).run();
          return json({ ok: true, id, status: "APPROVED" });
        }

        // POST /api/reject { id, reason? }
        if (pathname === "/api/reject") {
          await env.DB.prepare(
            "UPDATE content_queue SET status='REJECTED', editor_notes=COALESCE(?, editor_notes), reviewed_at=datetime('now') WHERE id=?",
          ).bind(body.reason || null, id).run();
          return json({ ok: true, id, status: "REJECTED" });
        }

        // POST /api/regenerate { id } — flag for re-draft by the draft Worker.
        // HARD STOP: this does NOT call the model here; it just marks intent. The
        // draft Worker (draft.js) owns model calls and is not wired to live keys yet.
        if (pathname === "/api/regenerate") {
          await env.DB.prepare(
            "UPDATE content_queue SET status='NEW', editor_notes=COALESCE(editor_notes,'') || '\n[regen requested]' WHERE id=?",
          ).bind(id).run();
          return json({ ok: true, id, status: "NEW", note: "Queued for re-draft (draft Worker not yet live)." });
        }

        return bad("Unknown action", 404);
      }

      return bad("Method not allowed", 405);
    } catch (err) {
      return bad(`Server error: ${err.message}`, 500);
    }
  },
};
