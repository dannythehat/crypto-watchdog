// Content Automation Engine — compliance gates (doc 05).
// PURE functions, no I/O, so they are unit-testable offline and reused by both
// the dashboard API (core Worker) and the publish Worker. These encode the
// non-negotiables: the FTC disclosure gate, the pay-for-rating firewall, and
// the RED-strip rule. Brand-agnostic — no `if (brand === ...)` anywhere.

export const TRUST_RANK = { RED: 0, ORANGE: 1, GREEN: 2 };

/** Parse the human verdict JSON → {rating, note} | null. */
export function parseVerdict(item) {
  if (!item || !item.human_verdict) return null;
  try {
    const v = typeof item.human_verdict === "string" ? JSON.parse(item.human_verdict) : item.human_verdict;
    if (v && TRUST_RANK[v.rating] !== undefined) return { rating: v.rating, note: v.note || "" };
  } catch { /* fall through */ }
  return null;
}

/** Does a verdict rating meet/exceed an affiliate's minimum trust threshold? */
export function meetsTrust(rating, minTrust) {
  if (!minTrust) return true;            // no threshold set → allowed
  if (TRUST_RANK[rating] === undefined) return false;
  return TRUST_RANK[rating] >= (TRUST_RANK[minTrust] ?? 99);
}

/** Affiliate links the item PLANS to use (from affiliate_json). */
export function plannedAffiliates(item) {
  if (!item || !item.affiliate_json) return [];
  try {
    const a = typeof item.affiliate_json === "string" ? JSON.parse(item.affiliate_json) : item.affiliate_json;
    return Array.isArray(a) ? a : [];
  } catch { return []; }
}

/**
 * Resolve which affiliate links may ACTUALLY publish, applying doc 05:
 *  - RED verdict  → strip ALL links (you cannot earn on something rated unsafe).
 *  - otherwise    → keep a link only if verdict >= affiliate.min_trust_to_link.
 *  - reviews with NO verdict → no links (the review can't publish anyway).
 *  - non-review types (deal/promotion/news/warning): a verdict is optional; if a
 *    RED standing verdict is present it still strips; otherwise active links pass
 *    (the disclosure gate below still applies).
 * @returns {Array} the surviving planned-affiliate entries
 */
export function resolvePublishableAffiliates(item, affiliatesById = {}) {
  const planned = plannedAffiliates(item);
  if (planned.length === 0) return [];
  const verdict = parseVerdict(item);

  if (verdict && verdict.rating === "RED") return []; // hard strip

  return planned.filter((p) => {
    const aff = affiliatesById[p.affiliate_id];
    if (!aff || aff.is_active === 0) return false;     // only active, known affiliates
    if (item.content_type === "review") {
      if (!verdict) return false;                       // reviews require a verdict to link
      return meetsTrust(verdict.rating, aff.min_trust_to_link);
    }
    // non-review: allowed unless a RED verdict (handled above) — disclosure gate still applies
    return verdict ? meetsTrust(verdict.rating, aff.min_trust_to_link) : true;
  });
}

/**
 * Can a human APPROVE this item in the dashboard? (doc 03)
 *  - reviews require a human verdict.
 *  - if the item plans any affiliate link, disclosure must be applied first.
 * @returns {{ok:boolean, reasons:string[]}}
 */
export function canApprove(item) {
  const reasons = [];
  if (item.content_type === "review" && !parseVerdict(item)) {
    reasons.push("Review requires a human trust verdict (GREEN/ORANGE/RED) before approval.");
  }
  if (plannedAffiliates(item).length > 0 && item.disclosure_applied !== 1) {
    reasons.push("Affiliate link present — disclosure must be applied before approval.");
  }
  return { ok: reasons.length === 0, reasons };
}

/**
 * Can the publish Worker PUBLISH this item? (doc 05 hard gates)
 *  - must be APPROVED.
 *  - reviews require a verdict.
 *  - if any affiliate link SURVIVES the firewall, disclosure_applied must be 1.
 * @returns {{ok:boolean, reasons:string[], publishableAffiliates:Array}}
 */
export function canPublish(item, affiliatesById = {}) {
  const reasons = [];
  if (item.status !== "APPROVED") reasons.push(`Status is ${item.status}, not APPROVED.`);
  if (item.content_type === "review" && !parseVerdict(item)) reasons.push("Review has no human verdict.");

  const links = resolvePublishableAffiliates(item, affiliatesById);
  if (links.length > 0 && item.disclosure_applied !== 1) {
    reasons.push("Affiliate link would publish without disclosure_applied=1 — blocked (FTC).");
  }
  return { ok: reasons.length === 0, reasons, publishableAffiliates: links };
}
