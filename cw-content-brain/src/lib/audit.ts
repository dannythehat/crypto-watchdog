import type { Confidence, ContentAuditFinding, ContentAuditSummary, FalsePositiveRisk } from "./types.js";

export function buildAuditSummary(findings: ContentAuditFinding[]): ContentAuditSummary {
  return {
    totalFindings: findings.length,
    byCode: countBy(findings, (finding) => finding.code),
    bySeverity: countBy(findings, (finding) => finding.severity),
    byConfidence: {
      high: findings.filter((finding) => finding.confidence === "high").length,
      medium: findings.filter((finding) => finding.confidence === "medium").length,
      low: findings.filter((finding) => finding.confidence === "low").length,
    } satisfies Record<Confidence, number>,
    byFalsePositiveRisk: {
      high: findings.filter((finding) => finding.falsePositiveRisk === "high").length,
      medium: findings.filter((finding) => finding.falsePositiveRisk === "medium").length,
      low: findings.filter((finding) => finding.falsePositiveRisk === "low").length,
    } satisfies Record<FalsePositiveRisk, number>,
    needsHumanReviewCount: findings.filter((finding) => finding.needsHumanReview).length,
  };
}

export function evidenceSnippet(input: string | undefined, needle?: RegExp): string | undefined {
  if (!input?.trim()) {
    return undefined;
  }

  const text = input.replace(/\s+/g, " ").trim();
  const match = needle ? text.match(needle) : undefined;
  const index = match?.index ?? 0;
  const start = Math.max(index - 80, 0);
  const end = Math.min(index + 180, text.length);
  const snippet = text.slice(start, end).trim();
  return snippet.length > 240 ? `${snippet.slice(0, 237)}...` : snippet;
}

function countBy<T>(items: T[], keyFor: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    const key = keyFor(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}
