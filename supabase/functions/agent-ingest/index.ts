// agent-ingest — authenticated write path for the content/SEO agent.
//
// Create / update / publish / unpublish / delete content rows. The function
// holds the service-role key as a Supabase secret; callers only ever hold the
// AGENT_INGEST_TOKEN bearer token. Deletes are SOFT by default (unpublish) and
// only hard-delete when explicitly asked, so autonomous actions stay reversible.
//
// Auth: Authorization: Bearer <AGENT_INGEST_TOKEN>
// Request (POST):
//   { "action": "upsert",     "table": "blog_posts", "rows": [ {...}, ... ] }
//   { "action": "publish",    "table": "blog_posts", "slugs": ["a","b"] }
//   { "action": "unpublish",  "table": "blog_posts", "slugs": ["a"] }
//   { "action": "delete",     "table": "blog_posts", "slugs": ["a"], "hard": false }
//
// On upsert, conflicts resolve on `slug`. New rows default to published=false
// unless the row explicitly sets published.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, isAllowedTable, isAuthorised, json } from "../_shared/cors.ts";

type Action = "upsert" | "publish" | "unpublish" | "delete";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "method not allowed" }, 405);
  if (!isAuthorised(req)) return json({ ok: false, error: "unauthorised" }, 401);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return json({ ok: false, error: "invalid JSON body" }, 400);

  const { action, table, rows, slugs, hard } = body as {
    action?: Action; table?: string; rows?: Record<string, unknown>[]; slugs?: string[]; hard?: boolean;
  };

  if (!isAllowedTable(table)) return json({ ok: false, error: "disallowed or missing table" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    switch (action) {
      case "upsert": {
        if (!Array.isArray(rows) || rows.length === 0) return json({ ok: false, error: "rows[] required" }, 400);
        const prepared = rows.map((r) => {
          const row = { ...r };
          if (!("slug" in row) || !row.slug) throw new Error("every row needs a slug");
          if (!("published" in row)) row.published = false; // safe default for new content
          row.updated_at = new Date().toISOString();
          return row;
        });
        const { data, error } = await supabase.from(table).upsert(prepared, { onConflict: "slug" }).select("slug, published");
        if (error) throw error;
        return json({ ok: true, action, table, affected: data?.length ?? 0, rows: data });
      }
      case "publish":
      case "unpublish": {
        if (!Array.isArray(slugs) || slugs.length === 0) return json({ ok: false, error: "slugs[] required" }, 400);
        const { data, error } = await supabase
          .from(table)
          .update({ published: action === "publish", updated_at: new Date().toISOString() })
          .in("slug", slugs)
          .select("slug, published");
        if (error) throw error;
        return json({ ok: true, action, table, affected: data?.length ?? 0, rows: data });
      }
      case "delete": {
        if (!Array.isArray(slugs) || slugs.length === 0) return json({ ok: false, error: "slugs[] required" }, 400);
        if (hard === true) {
          const { data, error } = await supabase.from(table).delete().in("slug", slugs).select("slug");
          if (error) throw error;
          return json({ ok: true, action: "hard_delete", table, affected: data?.length ?? 0, rows: data });
        }
        // soft delete = unpublish (reversible)
        const { data, error } = await supabase
          .from(table)
          .update({ published: false, updated_at: new Date().toISOString() })
          .in("slug", slugs)
          .select("slug, published");
        if (error) throw error;
        return json({ ok: true, action: "soft_delete", note: "unpublished (reversible); pass hard:true to remove permanently", table, affected: data?.length ?? 0, rows: data });
      }
      default:
        return json({ ok: false, error: `unknown action: ${action}` }, 400);
    }
  } catch (e) {
    return json({ ok: false, action, table, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
