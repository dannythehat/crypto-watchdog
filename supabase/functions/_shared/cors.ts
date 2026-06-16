export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Bearer-token check against the AGENT_INGEST_TOKEN secret.
// Returns true only when a non-empty token is configured and matches.
export function isAuthorised(req: Request): boolean {
  const expected = Deno.env.get("AGENT_INGEST_TOKEN") ?? "";
  if (!expected) return false;
  const header = req.headers.get("Authorization") ?? "";
  const provided = header.replace(/^Bearer\s+/i, "").trim();
  if (!provided || provided.length !== expected.length) return false;
  // length-checked constant-time-ish compare
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0;
}

export const ALLOWED_TABLES = ["blog_posts", "reviews", "warnings", "categories"] as const;
export type AllowedTable = (typeof ALLOWED_TABLES)[number];
export const isAllowedTable = (t: unknown): t is AllowedTable =>
  typeof t === "string" && (ALLOWED_TABLES as readonly string[]).includes(t);
