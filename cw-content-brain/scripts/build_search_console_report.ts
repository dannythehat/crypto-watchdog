import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fromRoot, isDirectRun, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";

type Device = "desktop" | "mobile" | "tablet" | "unknown";
type RecommendationType = "low_ctr_high_impression" | "page_2_opportunity" | "rising_keyword" | "falling_keyword" | "metadata_review" | "internal_link_review" | "content_refresh_review";

interface GscRecord {
  query?: string;
  page?: string;
  country?: string;
  device?: Device;
  date?: string;
  clicks: number;
  impressions: number;
  ctr?: number;
  averagePosition?: number;
}

interface GscSummaryItem {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition?: number;
}

interface GscRecommendation {
  draft_only: true;
  needs_human_review: true;
  type: RecommendationType;
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition?: number;
  reason: string;
  suggestedReview: string;
}

const exportsDir = "data/search_console/exports";
const outputJson = "data/reports/search_console_report.json";
const outputMd = "data/reports/search_console_report.md";

export async function buildSearchConsoleReport(): Promise<GscRecommendation[]> {
  const { files, records } = await loadExportRecords();
  const normalisedRecords = records.map(normaliseRecord).filter((record): record is GscRecord => Boolean(record));
  const topQueries = topItems(normalisedRecords, "query", 25);
  const topPages = topItems(normalisedRecords, "page", 25);
  const recommendations = buildRecommendations(normalisedRecords);

  await writeJson(outputJson, {
    generatedAt: new Date().toISOString(),
    disclaimer: "Draft-only Search Console import report for human review. This tool reads local exports only, does not authenticate with Google, does not write to Google or Supabase, and does not edit or publish pages.",
    draft_only: true,
    needs_human_review: true,
    exportFolder: exportsDir,
    importedFiles: files,
    recordCount: normalisedRecords.length,
    topQueries,
    topPages,
    recommendationCount: recommendations.length,
    recommendations,
  });
  await writeText(outputMd, renderMarkdown(files, normalisedRecords, topQueries, topPages, recommendations));
  logger.info("Search Console report written", { records: normalisedRecords.length, recommendations: recommendations.length, outputJson, outputMd });
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

function normaliseRecord(value: unknown): GscRecord | undefined {
  if (!isRecord(value)) return undefined;
  const query = stringValue(value, ["query", "top queries", "search query"]);
  const page = stringValue(value, ["page", "pages", "url", "landing page"]);
  const country = stringValue(value, ["country", "countries"]);
  const device = deviceValue(stringValue(value, ["device", "devices"]));
  const date = dateValue(stringValue(value, ["date", "day"]));
  const clicks = numberValue(value, ["clicks"]);
  const impressions = numberValue(value, ["impressions"]);
  const ctr = ratioValue(value, ["ctr", "click through rate"]);
  const averagePosition = numberValue(value, ["position", "average position", "avg position"]);

  if (!query && !page) return undefined;
  if (clicks === undefined && impressions === undefined) return undefined;

  return {
    query,
    page,
    country,
    device,
    date,
    clicks: clicks ?? 0,
    impressions: impressions ?? 0,
    ctr,
    averagePosition,
  };
}

function buildRecommendations(records: GscRecord[]): GscRecommendation[] {
  const queryPage = aggregate(records, (record) => `${record.query ?? ""}|${record.page ?? ""}`);
  const recommendations: GscRecommendation[] = [];

  for (const item of queryPage) {
    const [query, page] = item.key.split("|");
    if (item.impressions >= 500 && item.ctr < 0.015 && item.averagePosition !== undefined && item.averagePosition <= 12) {
      recommendations.push(recommendation("low_ctr_high_impression", query, page, item, "High impressions with low CTR suggest title/meta description review may be worthwhile.", "Review metadata, SERP intent, and whether the page promise is clear."));
    }
    if (item.impressions >= 100 && item.averagePosition !== undefined && item.averagePosition > 10 && item.averagePosition <= 20) {
      recommendations.push(recommendation("page_2_opportunity", query, page, item, "Average position is on page 2, where content refresh and internal links may help after human review.", "Review content freshness, internal links, heading coverage, and evidence depth."));
    }
  }

  recommendations.push(...trendRecommendations(records));
  return recommendations
    .sort((a, b) => b.impressions - a.impressions || a.type.localeCompare(b.type))
    .slice(0, 100);
}

function trendRecommendations(records: GscRecord[]): GscRecommendation[] {
  const dated = records.filter((record) => record.date && record.query);
  const dates = Array.from(new Set(dated.map((record) => record.date as string))).sort();
  if (dates.length < 2) return [];

  const midpoint = Math.floor(dates.length / 2);
  const early = new Set(dates.slice(0, midpoint));
  const late = new Set(dates.slice(midpoint));
  const byQuery = new Map<string, { early: number; late: number; clicks: number; impressions: number; positionTotal: number; positionCount: number }>();

  for (const record of dated) {
    const query = record.query as string;
    const bucket = byQuery.get(query) ?? { early: 0, late: 0, clicks: 0, impressions: 0, positionTotal: 0, positionCount: 0 };
    if (early.has(record.date as string)) bucket.early += record.impressions;
    if (late.has(record.date as string)) bucket.late += record.impressions;
    bucket.clicks += record.clicks;
    bucket.impressions += record.impressions;
    if (record.averagePosition !== undefined) {
      bucket.positionTotal += record.averagePosition * Math.max(record.impressions, 1);
      bucket.positionCount += Math.max(record.impressions, 1);
    }
    byQuery.set(query, bucket);
  }

  const output: GscRecommendation[] = [];
  for (const [query, bucket] of byQuery) {
    if (bucket.early >= 50 && bucket.late >= bucket.early * 1.5) {
      output.push(recommendation("rising_keyword", query, undefined, summaryFromBucket(query, bucket), "Query impressions are rising in the later export period.", "Check whether existing metadata/internal links support this growing intent."));
    }
    if (bucket.early >= 50 && bucket.late <= bucket.early * 0.6) {
      output.push(recommendation("falling_keyword", query, undefined, summaryFromBucket(query, bucket), "Query impressions fell in the later export period.", "Review freshness, ranking intent, and whether competitors or SERP layout may have changed."));
    }
  }
  return output;
}

function recommendation(type: RecommendationType, query: string | undefined, page: string | undefined, item: GscSummaryItem, reason: string, suggestedReview: string): GscRecommendation {
  const refreshType: RecommendationType = type === "low_ctr_high_impression" ? "metadata_review" : type === "page_2_opportunity" ? "content_refresh_review" : type;
  return {
    draft_only: true,
    needs_human_review: true,
    type: refreshType,
    query: query || undefined,
    page: page || undefined,
    clicks: item.clicks,
    impressions: item.impressions,
    ctr: item.ctr,
    averagePosition: item.averagePosition,
    reason,
    suggestedReview,
  };
}

function topItems(records: GscRecord[], key: "query" | "page", limit: number): GscSummaryItem[] {
  return aggregate(records, (record) => record[key] ?? "").filter((item) => item.key).slice(0, limit);
}

function aggregate(records: GscRecord[], keyFor: (record: GscRecord) => string): GscSummaryItem[] {
  const map = new Map<string, { clicks: number; impressions: number; weightedPosition: number; positionWeight: number }>();
  for (const record of records) {
    const key = keyFor(record).trim();
    if (!key) continue;
    const item = map.get(key) ?? { clicks: 0, impressions: 0, weightedPosition: 0, positionWeight: 0 };
    item.clicks += record.clicks;
    item.impressions += record.impressions;
    if (record.averagePosition !== undefined) {
      const weight = Math.max(record.impressions, 1);
      item.weightedPosition += record.averagePosition * weight;
      item.positionWeight += weight;
    }
    map.set(key, item);
  }

  return Array.from(map.entries()).map(([key, item]) => ({
    key,
    clicks: item.clicks,
    impressions: item.impressions,
    ctr: item.impressions > 0 ? item.clicks / item.impressions : 0,
    averagePosition: item.positionWeight > 0 ? item.weightedPosition / item.positionWeight : undefined,
  })).sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);
}

function summaryFromBucket(query: string, bucket: { clicks: number; impressions: number; positionTotal: number; positionCount: number }): GscSummaryItem {
  return {
    key: query,
    clicks: bucket.clicks,
    impressions: bucket.impressions,
    ctr: bucket.impressions > 0 ? bucket.clicks / bucket.impressions : 0,
    averagePosition: bucket.positionCount > 0 ? bucket.positionTotal / bucket.positionCount : undefined,
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

function deviceValue(value: string | undefined): Device | undefined {
  const normalised = value?.toLowerCase();
  if (normalised === "desktop" || normalised === "mobile" || normalised === "tablet") return normalised;
  return normalised ? "unknown" : undefined;
}

function dateValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString().slice(0, 10);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function renderMarkdown(files: string[], records: GscRecord[], topQueries: GscSummaryItem[], topPages: GscSummaryItem[], recommendations: GscRecommendation[]): string {
  return `# Search Console Report

Generated: ${new Date().toISOString()}

Draft-only Search Console import report for human review. This tool reads local exports only, does not authenticate with Google, does not write to Google or Supabase, and does not edit or publish pages.

## Import Summary

- Export folder: ${exportsDir}
- Imported files: ${files.length > 0 ? files.join(", ") : "none"}
- Normalised records: ${records.length}

## Top Queries

${topQueries.length > 0 ? topQueries.slice(0, 10).map(renderSummaryItem).join("\n") : "No query data imported.\n"}

## Top Pages

${topPages.length > 0 ? topPages.slice(0, 10).map(renderSummaryItem).join("\n") : "No page data imported.\n"}

## Recommendations

${recommendations.length > 0 ? recommendations.map(renderRecommendation).join("\n") : "No draft recommendations generated.\n"}`;
}

function renderSummaryItem(item: GscSummaryItem): string {
  return `- ${item.key}: ${item.clicks} clicks, ${item.impressions} impressions, ${(item.ctr * 100).toFixed(2)}% CTR${item.averagePosition !== undefined ? `, avg position ${item.averagePosition.toFixed(1)}` : ""}`;
}

function renderRecommendation(item: GscRecommendation): string {
  return `### ${item.type}: ${item.query ?? item.page ?? "Search Console opportunity"}

- Draft only: yes
- Needs human review: yes
- Query: ${item.query ?? "not available"}
- Page: ${item.page ?? "not available"}
- Clicks: ${item.clicks}
- Impressions: ${item.impressions}
- CTR: ${(item.ctr * 100).toFixed(2)}%
- Average position: ${item.averagePosition !== undefined ? item.averagePosition.toFixed(1) : "not available"}
- Reason: ${item.reason}
- Suggested review: ${item.suggestedReview}
`;
}

if (isDirectRun(import.meta.url)) {
  await buildSearchConsoleReport();
}
