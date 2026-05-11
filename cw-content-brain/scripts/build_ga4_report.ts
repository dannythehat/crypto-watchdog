import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fromRoot, isDirectRun, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";

type RecommendationType = "weak_engagement" | "low_conversion" | "cta_review" | "content_refresh_review" | "metadata_review" | "affiliate_placement_review";

interface Ga4Record {
  pagePath?: string;
  pageUrl?: string;
  pageTitle?: string;
  date?: string;
  sourceMedium?: string;
  sessions: number;
  users: number;
  views: number;
  engagementRate?: number;
  averageEngagementTimeSeconds?: number;
  eventCount?: number;
  conversions?: number;
  keyEvents?: number;
  affiliateClickEvents?: number;
}

interface Ga4PageSummary {
  page: string;
  pageTitle?: string;
  sessions: number;
  users: number;
  views: number;
  engagementRate?: number;
  averageEngagementTimeSeconds?: number;
  eventCount: number;
  conversions: number;
  keyEvents: number;
  affiliateClickEvents: number;
}

interface Ga4Recommendation {
  draft_only: true;
  needs_human_review: true;
  type: RecommendationType;
  page: string;
  pageTitle?: string;
  sessions: number;
  users: number;
  views: number;
  engagementRate?: number;
  averageEngagementTimeSeconds?: number;
  conversions: number;
  keyEvents: number;
  affiliateClickEvents: number;
  reason: string;
  suggestedReview: string;
}

const exportsDir = "data/ga4/exports";
const outputJson = "data/reports/ga4_report.json";
const outputMd = "data/reports/ga4_report.md";

export async function buildGa4Report(): Promise<Ga4Recommendation[]> {
  const { files, records } = await loadExportRecords();
  const normalisedRecords = records.map(normaliseRecord).filter((record): record is Ga4Record => Boolean(record));
  const pageSummaries = aggregatePages(normalisedRecords);
  const topPagesByViews = [...pageSummaries].sort((a, b) => b.views - a.views || b.sessions - a.sessions).slice(0, 25);
  const topPagesBySessions = [...pageSummaries].sort((a, b) => b.sessions - a.sessions || b.views - a.views).slice(0, 25);
  const recommendations = buildRecommendations(pageSummaries);

  await writeJson(outputJson, {
    generatedAt: new Date().toISOString(),
    disclaimer: "Draft-only GA4 local import report for human review. This tool reads local exports only, does not authenticate with Google, does not write to Google or Supabase, and does not edit or publish pages.",
    draft_only: true,
    needs_human_review: true,
    exportFolder: exportsDir,
    importedFiles: files,
    recordCount: normalisedRecords.length,
    topPagesByViews,
    topPagesBySessions,
    recommendationCount: recommendations.length,
    recommendations,
  });
  await writeText(outputMd, renderMarkdown(files, normalisedRecords, topPagesByViews, topPagesBySessions, recommendations));
  logger.info("GA4 report written", { records: normalisedRecords.length, recommendations: recommendations.length, outputJson, outputMd });
  return recommendations;
}

async function loadExportRecords(): Promise<{ files: string[]; records: unknown[] }> {
  const root = fromRoot(exportsDir);
  if (!existsSync(root)) {
    return { files: [], records: [] };
  }

  const entries = (await readdir(root)).filter((name) => name.endsWith(".csv") || name.endsWith(".json"));
  const records: unknown[] = [];

  for (const name of entries) {
    const raw = await readFile(join(root, name), "utf8");
    if (name.endsWith(".json")) {
      records.push(...recordsFromJson(raw));
    } else {
      records.push(...recordsFromCsv(raw));
    }
  }

  return { files: entries, records };
}

function recordsFromJson(raw: string): unknown[] {
  const parsed = JSON.parse(raw) as unknown;
  if (Array.isArray(parsed)) return parsed;
  if (isRecord(parsed) && Array.isArray(parsed.rows)) return parsed.rows;
  if (isRecord(parsed) && Array.isArray(parsed.data)) return parsed.data;
  return [];
}

function recordsFromCsv(raw: string): Record<string, string>[] {
  const rows = parseCsv(raw);
  if (rows.length < 2) return [];
  const headers = rows[0].map(normaliseHeader);
  return rows.slice(1)
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    const next = raw[index + 1];
    if (char === "\"" && quoted && next === "\"") {
      cell += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function normaliseRecord(value: unknown): Ga4Record | undefined {
  if (!isRecord(value)) return undefined;
  const pagePath = stringValue(value, ["page path", "page path and screen class", "landing page", "landing page + query string", "page"]);
  const pageUrl = stringValue(value, ["page url", "url", "full page url"]);
  const pageTitle = stringValue(value, ["page title", "title"]);
  const date = dateValue(stringValue(value, ["date", "day"]));
  const sourceMedium = stringValue(value, ["session source / medium", "source / medium", "source medium", "session source medium"]);
  const sessions = numberValue(value, ["sessions"]);
  const users = numberValue(value, ["users", "total users", "active users"]);
  const views = numberValue(value, ["views", "screen page views", "pageviews"]);
  const engagementRate = ratioValue(value, ["engagement rate"]);
  const averageEngagementTimeSeconds = durationValue(value, ["average engagement time", "avg engagement time", "average engagement time per session"]);
  const eventCount = numberValue(value, ["event count", "events"]);
  const conversions = numberValue(value, ["conversions"]);
  const keyEvents = numberValue(value, ["key events"]);
  const affiliateClickEvents = numberValue(value, ["affiliate clicks", "affiliate click events", "affiliate_click", "affiliate_clicks"]);

  if (!pagePath && !pageUrl) return undefined;
  if (sessions === undefined && users === undefined && views === undefined) return undefined;

  return {
    pagePath,
    pageUrl,
    pageTitle,
    date,
    sourceMedium,
    sessions: sessions ?? 0,
    users: users ?? 0,
    views: views ?? 0,
    engagementRate,
    averageEngagementTimeSeconds,
    eventCount,
    conversions,
    keyEvents,
    affiliateClickEvents,
  };
}

function aggregatePages(records: Ga4Record[]): Ga4PageSummary[] {
  const pages = new Map<string, {
    title?: string;
    sessions: number;
    users: number;
    views: number;
    engagementWeighted: number;
    engagementWeight: number;
    timeWeighted: number;
    timeWeight: number;
    eventCount: number;
    conversions: number;
    keyEvents: number;
    affiliateClickEvents: number;
  }>();

  for (const record of records) {
    const page = record.pageUrl ?? record.pagePath ?? "";
    if (!page) continue;
    const item = pages.get(page) ?? {
      title: record.pageTitle,
      sessions: 0,
      users: 0,
      views: 0,
      engagementWeighted: 0,
      engagementWeight: 0,
      timeWeighted: 0,
      timeWeight: 0,
      eventCount: 0,
      conversions: 0,
      keyEvents: 0,
      affiliateClickEvents: 0,
    };
    item.title ||= record.pageTitle;
    item.sessions += record.sessions;
    item.users += record.users;
    item.views += record.views;
    item.eventCount += record.eventCount ?? 0;
    item.conversions += record.conversions ?? 0;
    item.keyEvents += record.keyEvents ?? 0;
    item.affiliateClickEvents += record.affiliateClickEvents ?? 0;
    if (record.engagementRate !== undefined) {
      const weight = Math.max(record.sessions, 1);
      item.engagementWeighted += record.engagementRate * weight;
      item.engagementWeight += weight;
    }
    if (record.averageEngagementTimeSeconds !== undefined) {
      const weight = Math.max(record.sessions, 1);
      item.timeWeighted += record.averageEngagementTimeSeconds * weight;
      item.timeWeight += weight;
    }
    pages.set(page, item);
  }

  return Array.from(pages.entries()).map(([page, item]) => ({
    page,
    pageTitle: item.title,
    sessions: item.sessions,
    users: item.users,
    views: item.views,
    engagementRate: item.engagementWeight > 0 ? item.engagementWeighted / item.engagementWeight : undefined,
    averageEngagementTimeSeconds: item.timeWeight > 0 ? item.timeWeighted / item.timeWeight : undefined,
    eventCount: item.eventCount,
    conversions: item.conversions,
    keyEvents: item.keyEvents,
    affiliateClickEvents: item.affiliateClickEvents,
  }));
}

function buildRecommendations(pages: Ga4PageSummary[]): Ga4Recommendation[] {
  const recommendations: Ga4Recommendation[] = [];

  for (const page of pages) {
    if (page.sessions >= 100 && page.engagementRate !== undefined && page.engagementRate < 0.35) {
      recommendations.push(recommendation("weak_engagement", page, "High traffic with weak engagement suggests the page may not satisfy intent or needs clearer structure.", "Review intro clarity, content depth, page speed, and internal links before editing."));
    }
    if (page.sessions >= 100 && page.averageEngagementTimeSeconds !== undefined && page.averageEngagementTimeSeconds < 20) {
      recommendations.push(recommendation("content_refresh_review", page, "Average engagement time is low for a trafficked page.", "Review whether the page answer, evidence, headings, and next steps are strong enough."));
    }
    if (page.sessions >= 50 && page.conversions === 0 && page.keyEvents === 0) {
      recommendations.push(recommendation("cta_review", page, "Page has traffic but no conversion/key-event signal in the local export.", "Review CTA clarity, disclosure context, and whether the page should have a measured next step."));
    }
    if (page.sessions >= 50 && page.affiliateClickEvents === 0) {
      recommendations.push(recommendation("affiliate_placement_review", page, "Page has traffic but no affiliate-click events in the local export.", "Review whether an affiliate CTA is appropriate, useful, disclosed, and allowed by page risk rules."));
    }
    if (page.views >= 500 && (page.pageTitle === undefined || page.pageTitle.length < 20)) {
      recommendations.push(recommendation("metadata_review", page, "High-view page has missing or very short title data in the local export.", "Review title metadata and Search Console query intent before changing anything."));
    }
  }

  return recommendations
    .sort((a, b) => b.sessions - a.sessions || b.views - a.views || a.type.localeCompare(b.type))
    .slice(0, 100);
}

function recommendation(type: RecommendationType, page: Ga4PageSummary, reason: string, suggestedReview: string): Ga4Recommendation {
  return {
    draft_only: true,
    needs_human_review: true,
    type,
    page: page.page,
    pageTitle: page.pageTitle,
    sessions: page.sessions,
    users: page.users,
    views: page.views,
    engagementRate: page.engagementRate,
    averageEngagementTimeSeconds: page.averageEngagementTimeSeconds,
    conversions: page.conversions,
    keyEvents: page.keyEvents,
    affiliateClickEvents: page.affiliateClickEvents,
    reason,
    suggestedReview,
  };
}

function normaliseHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function stringValue(row: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key] ?? row[normaliseHeader(key)];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function numberValue(row: Record<string, unknown>, keys: string[]): number | undefined {
  const value = stringValue(row, keys);
  if (!value) return undefined;
  const parsed = Number(value.replace(/[% ,]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function ratioValue(row: Record<string, unknown>, keys: string[]): number | undefined {
  const value = stringValue(row, keys);
  if (!value) return undefined;
  const parsed = Number(value.replace(/[% ,]/g, ""));
  if (!Number.isFinite(parsed)) return undefined;
  return value.includes("%") || parsed > 1 ? parsed / 100 : parsed;
}

function durationValue(row: Record<string, unknown>, keys: string[]): number | undefined {
  const value = stringValue(row, keys);
  if (!value) return undefined;
  if (/^\d+:\d{2}(:\d{2})?$/.test(value)) {
    const parts = value.split(":").map(Number);
    return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
  }
  return numberValue(row, keys);
}

function dateValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString().slice(0, 10);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function renderMarkdown(files: string[], records: Ga4Record[], topPagesByViews: Ga4PageSummary[], topPagesBySessions: Ga4PageSummary[], recommendations: Ga4Recommendation[]): string {
  return `# GA4 Analytics Report

Generated: ${new Date().toISOString()}

Draft-only GA4 local import report for human review. This tool reads local exports only, does not authenticate with Google, does not write to Google or Supabase, and does not edit or publish pages.

## Import Summary

- Export folder: ${exportsDir}
- Imported files: ${files.length > 0 ? files.join(", ") : "none"}
- Normalised records: ${records.length}

## Top Pages By Views

${topPagesByViews.length > 0 ? topPagesByViews.slice(0, 10).map(renderPageSummary).join("\n") : "No page data imported.\n"}

## Top Pages By Sessions

${topPagesBySessions.length > 0 ? topPagesBySessions.slice(0, 10).map(renderPageSummary).join("\n") : "No session data imported.\n"}

## Recommendations

${recommendations.length > 0 ? recommendations.map(renderRecommendation).join("\n") : "No draft recommendations generated.\n"}`;
}

function renderPageSummary(item: Ga4PageSummary): string {
  return `- ${item.page}: ${item.views} views, ${item.sessions} sessions, ${item.users} users${item.engagementRate !== undefined ? `, ${(item.engagementRate * 100).toFixed(1)}% engagement` : ""}`;
}

function renderRecommendation(item: Ga4Recommendation): string {
  return `### ${item.type}: ${item.pageTitle ?? item.page}

- Draft only: yes
- Needs human review: yes
- Page: ${item.page}
- Sessions: ${item.sessions}
- Users: ${item.users}
- Views: ${item.views}
- Engagement rate: ${item.engagementRate !== undefined ? `${(item.engagementRate * 100).toFixed(1)}%` : "not available"}
- Average engagement time: ${item.averageEngagementTimeSeconds !== undefined ? `${Math.round(item.averageEngagementTimeSeconds)}s` : "not available"}
- Conversions: ${item.conversions}
- Key events: ${item.keyEvents}
- Affiliate-click events: ${item.affiliateClickEvents}
- Reason: ${item.reason}
- Suggested review: ${item.suggestedReview}
`;
}

if (isDirectRun(import.meta.url)) {
  await buildGa4Report();
}
