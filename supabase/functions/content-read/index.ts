// content-read — authenticated read of all content rows (including drafts).
//
// Lets the content/SEO agent pull a complete, fresh snapshot on demand without
// the manual SQL export. Uses the service-role key server-side, so it bypasses
// RLS and returns unpublished rows too.
//
// Auth: Authorization: Bearer <AGENT_INGEST_TOKEN>
// Request (GET or POST):  { "tables": ["blog_posts","reviews","warnings","categories"] }  (optional)
// Response: { ok: true, counts: {...}, data: { table: [...rows] } }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ALLOWED_TABLES, corsHeaders, isAllowedTable, isAuthorised, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!isAuthorised(req)) return json({ ok: false, error: "unauthorised" }, 401);

  let tables: string[] = [...ALLOWED_TABLES];
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (Array.isArray(body?.tables) && body.tables.length) tables = body.tables;
    } else {
      const u = new URL(req.url);
      const q = u.searchParams.get("tables");
      if (q) tables = q.split(",").map((s) => s.trim()).filter(Boolean);
    }
  } catch { /* fall back to all tables */ }

  const invalid = tables.filter((t) => !isAllowedTable(t));
  if (invalid.length) return json({ ok: false, error: `disallowed tables: ${invalid.join(", ")}` }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const data: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};
  for (const table of tables) {
    const { data: rows, error } = await supabase.from(table).select("*");
    if (error) return json({ ok: false, table, error: error.message }, 500);
    data[table] = rows ?? [];
    counts[table] = rows?.length ?? 0;
  }

  return json({ ok: true, generatedAt: new Date().toISOString(), counts, data });
});
