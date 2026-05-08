import { chromium, type Browser, type Page } from "playwright";
import { isDirectRun, readJson, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { ContentAuditFinding, SnapshotTableName } from "../src/lib/types.js";

type PriorityBand = "critical" | "high" | "medium" | "low" | "verify_later";
type VerificationStatus = "verified_possible_issue" | "likely_false_positive" | "partially_verified" | "needs_manual_review" | "fetch_failed";
type ConfidenceAdjustment = "increase" | "decrease" | "unchanged";
type DisclosureStatus = "yes" | "no" | "uncertain";

interface RenderedVerifierConfig {
  enabled: boolean;
  baseUrl: string;
  maxPagesPerRun: number;
  timeoutMs: number;
  waitAfterLoadMs: number;
  queueInput: string;
  outputJson: string;
  outputMd: string;
  checks: Record<string, boolean>;
  affiliatePatterns?: string[];
}

interface PriorityQueueReport {
  items?: PriorityQueueItem[];
}

interface PriorityQueueItem {
  priorityRank: number;
  priorityBand: PriorityBand;
  sourceTable: SnapshotTableName;
  slug: string;
  title?: string;
  url?: string;
  mainIssues?: string[];
  supportingFindings?: ContentAuditFinding[];
}

interface LinkSummary {
  count: number;
  sampleHrefs: string[];
}

interface RenderedFacts {
  url: string;
  status: number | null;
  titleTag?: string;
  metaDescription?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  h1s: string[];
  h2s: string[];
  visibleTextWordCount: number;
  internalLinks: LinkSummary;
  externalLinks: LinkSummary;
  credibleExternalLinks: LinkSummary;
  affiliateLinks: LinkSummary;
  affiliateDisclosureDetected: DisclosureStatus;
  images: number;
  imagesMissingAlt: number;
  youtubeEmbeds: number;
  codeArtifactTokens: string[];
}

interface VerificationFinding {
  code: string;
  reason: string;
  evidence?: string;
}

interface RenderedVerificationResult {
  url: string;
  sourceTable: SnapshotTableName;
  slug: string;
  queuePriorityRank: number;
  queuePriorityBand: PriorityBand;
  verificationStatus: VerificationStatus;
  confidenceAdjustment: ConfidenceAdjustment;
  renderedFacts?: RenderedFacts;
  downgradedFindings: VerificationFinding[];
  confirmedFindings: VerificationFinding[];
  newRenderedFindings: VerificationFinding[];
  recommendedNextStep: string;
}

const defaultAffiliatePatterns = [
  "affiliate",
  "ref=",
  "referral",
  "partner",
  "utm_source=affiliate",
  "awin",
  "impact.com",
  "cj.com",
  "shareasale",
  "rakuten",
  "clickbank",
  "goaffpro",
  "firstpromoter",
  "rewardful",
];

const disclosurePhrases = ["affiliate", "commission", "disclosure", "sponsored", "referral"];
const codeArtifactTokens = ["import ", "export default", "interface ", "type ", "const ", "function ", "className=", "<div", "</", "React."];
const socialHosts = ["facebook.com", "x.com", "twitter.com", "linkedin.com", "instagram.com", "youtube.com", "youtu.be", "tiktok.com"];

export async function verifyRenderedPages(): Promise<RenderedVerificationResult[]> {
  const config = await readJson<RenderedVerifierConfig>("config/rendered_verifier.config.json");
  if (!config.enabled) {
    throw new Error("Rendered Page Verifier is disabled. Set config/rendered_verifier.config.json enabled to true before owner-run verification.");
  }

  const queue = await readQueue(config.queueInput);
  const pages = selectPages(queue, config);
  const browser = await chromium.launch({ headless: true });
  const results: RenderedVerificationResult[] = [];

  try {
    for (const item of pages) {
      results.push(await verifyQueueItem(browser, item, config));
    }
  } finally {
    await browser.close();
  }

  await writeOutputs(config, results);
  logger.info("Rendered page verification written", { pages: results.length });
  return results;
}

async function readQueue(path: string): Promise<PriorityQueueItem[]> {
  try {
    const report = await readJson<PriorityQueueReport>(path);
    return report.items ?? [];
  } catch {
    logger.warn("Priority queue report is missing; rendered verification has no pages to check", { path });
    return [];
  }
}

function selectPages(items: PriorityQueueItem[], config: RenderedVerifierConfig): PriorityQueueItem[] {
  return [...items]
    .filter((item) => Boolean(item.url || item.slug))
    .sort((a, b) => a.priorityRank - b.priorityRank)
    .slice(0, config.maxPagesPerRun);
}

async function verifyQueueItem(browser: Browser, item: PriorityQueueItem, config: RenderedVerifierConfig): Promise<RenderedVerificationResult> {
  const url = absoluteUrl(item.url ?? item.slug, config.baseUrl);
  const page = await browser.newPage();

  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: config.timeoutMs });
    try {
      await page.waitForLoadState("networkidle", { timeout: Math.min(config.timeoutMs, 10000) });
    } catch {
      logger.warn("Network idle was not reached before timeout", { url });
    }
    if (config.waitAfterLoadMs > 0) {
      await page.waitForTimeout(config.waitAfterLoadMs);
    }

    const facts = await extractRenderedFacts(page, response?.status() ?? null, config);
    const comparison = compareToQueueFindings(item, facts);
    const verificationStatus = statusFor(comparison.downgradedFindings, comparison.confirmedFindings, comparison.newRenderedFindings);

    return {
      url,
      sourceTable: item.sourceTable,
      slug: item.slug,
      queuePriorityRank: item.priorityRank,
      queuePriorityBand: item.priorityBand,
      verificationStatus,
      confidenceAdjustment: adjustmentFor(verificationStatus),
      renderedFacts: facts,
      ...comparison,
      recommendedNextStep: nextStepFor(verificationStatus),
    };
  } catch (error) {
    return {
      url,
      sourceTable: item.sourceTable,
      slug: item.slug,
      queuePriorityRank: item.priorityRank,
      queuePriorityBand: item.priorityBand,
      verificationStatus: "fetch_failed",
      confidenceAdjustment: "unchanged",
      downgradedFindings: [],
      confirmedFindings: [],
      newRenderedFindings: [],
      recommendedNextStep: `Fetch failed during owner-run verification. Retry manually and inspect the rendered page before assigning edits. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  } finally {
    await page.close();
  }
}

async function extractRenderedFacts(page: Page, status: number | null, config: RenderedVerifierConfig): Promise<RenderedFacts> {
  const patterns = [...defaultAffiliatePatterns, ...(config.affiliatePatterns ?? [])].map((pattern) => pattern.toLowerCase());
  const facts = await page.evaluate(
    ({ baseUrl, affiliatePatterns, phrases, tokens, socialHostPatterns }) => {
      const doc = (globalThis as any).document;
      const location = (globalThis as any).location;
      const bodyText = String(doc.body?.innerText ?? "");
      const lowerText = bodyText.toLowerCase();
      const baseHost = new URL(baseUrl).hostname.replace(/^www\./, "");
      const sample = (values: string[]) => Array.from(new Set(values)).slice(0, 10);
      const textFor = (selector: string) => Array.from(doc.querySelectorAll(selector)).map((node: any) => String(node.textContent ?? "").trim()).filter(Boolean).slice(0, 20);
      const attr = (selector: string, name: string) => String(doc.querySelector(selector)?.getAttribute(name) ?? "") || undefined;
      const hrefs = Array.from(doc.querySelectorAll("a[href]")).map((anchor: any) => {
        try {
          return new URL(String(anchor.getAttribute("href") ?? ""), location.href).href;
        } catch {
          return "";
        }
      }).filter(Boolean);
      const isInternal = (href: string) => {
        try {
          return new URL(href).hostname.replace(/^www\./, "") === baseHost;
        } catch {
          return false;
        }
      };
      const hasPattern = (href: string) => affiliatePatterns.some((pattern: string) => href.toLowerCase().includes(pattern));
      const isSocial = (href: string) => socialHostPatterns.some((host: string) => {
        try {
          return new URL(href).hostname.includes(host);
        } catch {
          return false;
        }
      });
      const internalLinks = hrefs.filter(isInternal);
      const externalLinks = hrefs.filter((href) => !isInternal(href));
      const affiliateLinks = hrefs.filter(hasPattern);
      const credibleExternalLinks = externalLinks.filter((href) => !hasPattern(href) && !isSocial(href));
      const images = Array.from(doc.images ?? []);
      const iframeSrcs = Array.from(doc.querySelectorAll("iframe[src]")).map((iframe: any) => String(iframe.getAttribute("src") ?? ""));
      const codeTokens = tokens.filter((token: string) => bodyText.includes(token));
      const disclosureDetected = phrases.some((phrase: string) => lowerText.includes(phrase));

      return {
        url: location.href,
        titleTag: String(doc.title ?? "") || undefined,
        metaDescription: attr('meta[name="description"]', "content"),
        canonical: attr('link[rel="canonical"]', "href"),
        ogTitle: attr('meta[property="og:title"]', "content"),
        ogDescription: attr('meta[property="og:description"]', "content"),
        ogImage: attr('meta[property="og:image"]', "content"),
        twitterTitle: attr('meta[name="twitter:title"]', "content"),
        twitterDescription: attr('meta[name="twitter:description"]', "content"),
        h1s: textFor("h1"),
        h2s: textFor("h2"),
        visibleTextWordCount: bodyText.split(/\s+/).filter(Boolean).length,
        internalLinks: { count: internalLinks.length, sampleHrefs: sample(internalLinks) },
        externalLinks: { count: externalLinks.length, sampleHrefs: sample(externalLinks) },
        credibleExternalLinks: { count: credibleExternalLinks.length, sampleHrefs: sample(credibleExternalLinks) },
        affiliateLinks: { count: affiliateLinks.length, sampleHrefs: sample(affiliateLinks) },
        affiliateDisclosureDetected: disclosureDetected ? "yes" : affiliateLinks.length > 0 ? "no" : "uncertain",
        images: images.length,
        imagesMissingAlt: images.filter((image: any) => !String(image.getAttribute("alt") ?? "").trim()).length,
        youtubeEmbeds: iframeSrcs.filter((src) => src.includes("youtube.com") || src.includes("youtu.be")).length,
        codeArtifactTokens: codeTokens,
      };
    },
    { baseUrl: config.baseUrl, affiliatePatterns: patterns, phrases: disclosurePhrases, tokens: codeArtifactTokens, socialHostPatterns: socialHosts },
  );

  return { ...facts, status };
}

function compareToQueueFindings(item: PriorityQueueItem, facts: RenderedFacts): Pick<RenderedVerificationResult, "downgradedFindings" | "confirmedFindings" | "newRenderedFindings"> {
  const issueCodes = new Set([...(item.mainIssues ?? []), ...(item.supportingFindings ?? []).map((finding) => finding.code)]);
  const downgradedFindings: VerificationFinding[] = [];
  const confirmedFindings: VerificationFinding[] = [];
  const newRenderedFindings: VerificationFinding[] = [];

  for (const code of issueCodes) {
    if (code === "missing_internal_links") {
      pushByCount(facts.internalLinks.count, code, downgradedFindings, confirmedFindings, "Rendered page has internal links.", "Rendered page still has no internal links.", facts.internalLinks.sampleHrefs.join(", "));
    } else if (code === "missing_external_evidence_links") {
      pushByCount(facts.credibleExternalLinks.count, code, downgradedFindings, confirmedFindings, "Rendered page has credible external links to inspect.", "Rendered page has no obvious credible external evidence links.", facts.credibleExternalLinks.sampleHrefs.join(", "));
    } else if (code === "affiliate_without_nearby_disclosure") {
      if (facts.affiliateDisclosureDetected === "yes") downgradedFindings.push({ code, reason: "Rendered page includes visible disclosure language." });
      else if (facts.affiliateLinks.count > 0) confirmedFindings.push({ code, reason: "Rendered page has affiliate-looking links and no visible disclosure phrase was detected." });
    } else if (code === "code_artifact_detected") {
      if (facts.codeArtifactTokens.length > 0) confirmedFindings.push({ code, reason: "Code-like tokens are visible in rendered page text.", evidence: facts.codeArtifactTokens.join(", ") });
      else downgradedFindings.push({ code, reason: "Code-like tokens were not visible in rendered page text." });
    } else {
      confirmedFindings.push({ code, reason: "Rendered verifier cannot fully prove or dismiss this finding; keep it in manual review." });
    }
  }

  if (!facts.titleTag || facts.titleTag.length < 20) newRenderedFindings.push({ code: "rendered_title_missing_or_weak", reason: "Rendered title tag is missing or short.", evidence: facts.titleTag });
  if (!facts.metaDescription || facts.metaDescription.length < 50) newRenderedFindings.push({ code: "rendered_meta_description_missing_or_weak", reason: "Rendered meta description is missing or short.", evidence: facts.metaDescription });
  if (!facts.canonical) newRenderedFindings.push({ code: "rendered_canonical_missing", reason: "Rendered page has no canonical link tag." });
  if (!facts.ogTitle || !facts.ogDescription) newRenderedFindings.push({ code: "rendered_open_graph_missing_or_weak", reason: "Rendered page is missing og:title or og:description." });

  return { downgradedFindings, confirmedFindings, newRenderedFindings };
}

function pushByCount(count: number, code: string, downgraded: VerificationFinding[], confirmed: VerificationFinding[], downgradeReason: string, confirmReason: string, evidence?: string): void {
  if (count > 0) downgraded.push({ code, reason: downgradeReason, evidence });
  else confirmed.push({ code, reason: confirmReason });
}

function statusFor(downgraded: VerificationFinding[], confirmed: VerificationFinding[], rendered: VerificationFinding[]): VerificationStatus {
  if (confirmed.length > 0 && downgraded.length > 0) return "partially_verified";
  if (confirmed.length > 0 || rendered.length > 0) return "verified_possible_issue";
  if (downgraded.length > 0) return "likely_false_positive";
  return "needs_manual_review";
}

function adjustmentFor(status: VerificationStatus): ConfidenceAdjustment {
  if (status === "verified_possible_issue") return "increase";
  if (status === "likely_false_positive") return "decrease";
  return "unchanged";
}

function nextStepFor(status: VerificationStatus): string {
  if (status === "verified_possible_issue") return "Review the rendered evidence and assign a focused human-approved fix only if the issue is confirmed.";
  if (status === "likely_false_positive") return "Do not edit from the original queue item unless manual rendered-page review finds a real issue.";
  if (status === "partially_verified") return "Split confirmed issues from downgraded findings, then review the page manually before editing.";
  if (status === "fetch_failed") return "Retry owner-run verification later and inspect the live page manually before assigning edits.";
  return "Manual review is still needed; rendered verification did not prove or dismiss the queue item.";
}

function absoluteUrl(value: string, baseUrl: string): string {
  try {
    return new URL(value).href;
  } catch {
    return new URL(value.startsWith("/") ? value : `/${value}`, baseUrl).href;
  }
}

async function writeOutputs(config: RenderedVerifierConfig, results: RenderedVerificationResult[]): Promise<void> {
  await writeJson(config.outputJson, {
    generatedAt: new Date().toISOString(),
    disclaimer: "Rendered verification reduces false positives but does not edit, publish, or confirm legal conclusions automatically.",
    pageCount: results.length,
    results,
  });
  await writeText(config.outputMd, renderMarkdown(results));
}

function renderMarkdown(results: RenderedVerificationResult[]): string {
  return `# Rendered Page Verification

Generated: ${new Date().toISOString()}

Rendered verification checks live React pages to reduce false positives from local snapshots and queue reports. It never edits content, publishes content, or writes to Supabase.

${renderSection("Confirmed or Partially Verified", results.filter((result) => result.verificationStatus === "verified_possible_issue" || result.verificationStatus === "partially_verified"))}
${renderSection("Likely False Positives", results.filter((result) => result.verificationStatus === "likely_false_positive"))}
${renderSection("Needs Manual Review", results.filter((result) => result.verificationStatus === "needs_manual_review" || result.verificationStatus === "fetch_failed"))}
${renderSection("Rendered Metadata Gaps", results.filter((result) => result.newRenderedFindings.some((finding) => finding.code.startsWith("rendered_"))))}
`;
}

function renderSection(title: string, results: RenderedVerificationResult[]): string {
  return `## ${title}\n\n${results.length > 0 ? results.map(renderResult).join("\n") : "No pages in this section.\n"}`;
}

function renderResult(result: RenderedVerificationResult): string {
  return `### #${result.queuePriorityRank} ${result.slug}

- Page: ${result.url}
- Queue priority: ${result.queuePriorityBand}
- Verification status: ${result.verificationStatus}
- Confidence adjustment: ${result.confidenceAdjustment}
- Confirmed findings: ${result.confirmedFindings.map((finding) => finding.code).join(", ") || "none"}
- Downgraded findings: ${result.downgradedFindings.map((finding) => finding.code).join(", ") || "none"}
- New rendered findings: ${result.newRenderedFindings.map((finding) => finding.code).join(", ") || "none"}
- Recommended next step: ${result.recommendedNextStep}
`;
}

if (isDirectRun(import.meta.url)) {
  await verifyRenderedPages();
}
