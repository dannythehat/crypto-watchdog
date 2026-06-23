// Content Automation Engine — Draft Worker (doc 04 voice → drafts).
//
// Cron-triggered. Takes NEW rows, asks the Claude API to write a brand-voiced draft
// (per the brand's voice_profile), generates an image prompt, and moves the row to
// PENDING_REVIEW for the human gate. It NEVER publishes and NEVER sets a verdict —
// the trust verdict is a human-only act (doc 05).
//
// HARD STOP STATUS: the model call is gated behind env.ANTHROPIC_API_KEY. Without a
// key it makes ZERO external calls and leaves rows as NEW (logged), so running this
// in the sandbox is safe and inert. Danny supplies the key to switch drafting on.

const MODEL = "claude-opus-4-8"; // latest Opus; swap via env.DRAFT_MODEL if set

async function brand(env, brandId) {
  return env.DB.prepare("SELECT * FROM brands WHERE id=?").bind(brandId).first();
}

// Build the drafting prompt from the brand's voice_profile (doc 04). Pure.
export function buildPrompt(brandRow, item) {
  let voice = {};
  try { voice = JSON.parse(brandRow.voice_profile || "{}"); } catch { /* ignore */ }
  const never = (voice.never || []).map((n) => `- never ${n}`).join("\n");
  return [
    `You are the editorial voice of ${brandRow.name} (${brandRow.domain}).`,
    `Tone: ${voice.tone || "evidence-led, calm"}.`,
    `Reading level: ${voice.reading_level || "beginner-friendly"}.`,
    `Content type: ${item.content_type}.`,
    `Hard rules:\n${never}`,
    `Do NOT assign a trust rating — a human does that.`,
    `Write a draft with: a one-line hook, body in markdown, and a short social variant.`,
    item.title ? `Working title/source: ${item.title}` : "",
    item.raw_ref ? `Source ref: ${item.raw_ref}` : "",
    `Return JSON: {"title":...,"body_md":...,"social_variants":{"x":...},"image_prompt":...}`,
  ].filter(Boolean).join("\n\n");
}

async function callClaude(env, prompt) {
  // HARD STOP guard: no key → no network. Caller leaves the row as NEW.
  if (!env.ANTHROPIC_API_KEY) return null;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.DRAFT_MODEL || MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json();
  const text = data?.content?.[0]?.text || "{}";
  try { return JSON.parse(text); } catch { return { body_md: text }; }
}

export async function runDraft(env, limit = 5) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM content_queue WHERE status='NEW' ORDER BY created_at ASC LIMIT ?",
  ).bind(limit).all();

  let drafted = 0;
  let skipped = 0;
  for (const item of results || []) {
    const b = await brand(env, item.brand_id);
    if (!b || b.is_active !== 1) { skipped++; continue; }
    const prompt = buildPrompt(b, item);
    const out = await callClaude(env, prompt);
    if (!out) { skipped++; continue; } // no key → leave as NEW (inert in sandbox)
    await env.DB.prepare(
      `UPDATE content_queue
       SET title=COALESCE(?,title), body_md=?, social_variants=?, image_prompt=?, status='PENDING_REVIEW'
       WHERE id=?`,
    ).bind(
      out.title || item.title,
      out.body_md || item.body_md || "",
      JSON.stringify(out.social_variants || {}),
      out.image_prompt || item.image_prompt || null,
      item.id,
    ).run();
    drafted++;
  }
  return { drafted, skipped, hadKey: Boolean(env.ANTHROPIC_API_KEY) };
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runDraft(env));
  },
  async fetch(_request, env) {
    const res = await runDraft(env);
    return new Response(JSON.stringify({ ok: true, ...res }), {
      headers: { "content-type": "application/json" },
    });
  },
};
