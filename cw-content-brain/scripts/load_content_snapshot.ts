import { isDirectRun, readJson, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { ContentSnapshotConfig, NormalisedContentRecord, SnapshotTableName } from "../src/lib/types.js";

const outputPath = "data/content_snapshot/normalised_content.json";

export async function loadContentSnapshot(): Promise<NormalisedContentRecord[]> {
  const config = await readJson<ContentSnapshotConfig>("config/content_snapshot.config.json");
  validateConfig(config);

  if (!config.enabled) {
    await writeJson(outputPath, []);
    return [];
  }

  const records: NormalisedContentRecord[] = [];

  for (const [tableName, path] of Object.entries(config.tables) as Array<[SnapshotTableName, string]>) {
    const rows = await readJson<unknown[]>(path);
    if (!Array.isArray(rows)) {
      throw new Error(`Snapshot table ${tableName} must be a JSON array`);
    }

    rows.forEach((row, index) => {
      records.push(normaliseRow(tableName, row, index));
    });
  }

  await writeJson(outputPath, records);
  logger.info("Normalised content snapshot written", { records: records.length, outputPath });
  return records;
}

function validateConfig(config: ContentSnapshotConfig): void {
  if (config.source !== "local-json-export") {
    throw new Error("Only local-json-export snapshots are supported in Phase 1B");
  }
  if (!config.readOnly || config.writeBackToSupabase) {
    throw new Error("Content snapshot config must remain read-only with writeBackToSupabase disabled");
  }
}

function normaliseRow(sourceTable: SnapshotTableName, value: unknown, index: number): NormalisedContentRecord {
  if (!isRecord(value)) {
    throw new Error(`Snapshot row ${sourceTable}[${index}] must be an object`);
  }

  const slug = stringField(value, "slug") ?? `missing-slug-${sourceTable}-${index}`;
  return {
    sourceTable,
    id: stringField(value, "id") ?? `${sourceTable}-${index}`,
    slug,
    url: urlFor(sourceTable, slug),
    title: stringField(value, "title") ?? stringField(value, "name"),
    status: stringField(value, "status"),
    category: stringField(value, "category") ?? stringField(value, "category_name"),
    rating: stringField(value, "rating") ?? stringField(value, "severity"),
    trust_score: numberField(value, "trust_score"),
    summary: stringField(value, "summary") ?? stringField(value, "description"),
    body: stringField(value, "body") ?? stringField(value, "content") ?? stringField(value, "description"),
    verdict: stringField(value, "verdict"),
    pros: arrayField(value, "pros"),
    cons: arrayField(value, "cons"),
    deposit_info: stringField(value, "deposit_info"),
    withdrawal_info: stringField(value, "withdrawal_info"),
    fees_info: stringField(value, "fees_info"),
    video_url: stringField(value, "video_url"),
    interview_url: stringField(value, "interview_url"),
    detailed_audit: jsonTextField(value, "detailed_audit"),
    evidence: evidenceField(value, "evidence"),
    created_at: stringField(value, "created_at"),
    updated_at: stringField(value, "updated_at"),
  };
}

function urlFor(sourceTable: SnapshotTableName, slug: string): string {
  const prefix: Record<SnapshotTableName, string> = {
    reviews: "/reviews/",
    blog_posts: "/blog/",
    warnings: "/warnings/",
    categories: "/categories/",
  };
  return `https://cryptowatchdog.net${prefix[sourceTable]}${slug}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(row: Record<string, unknown>, key: string): string | undefined {
  const value = row[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function jsonTextField(row: Record<string, unknown>, key: string): string | undefined {
  const value = row[key];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (Array.isArray(value) || isRecord(value)) {
    return JSON.stringify(value, null, 2);
  }
  return undefined;
}

function evidenceField(row: Record<string, unknown>, key: string): string[] | undefined {
  const value = row[key];
  if (Array.isArray(value)) {
    const evidence = value
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }
        if (Array.isArray(item) || isRecord(item)) {
          return JSON.stringify(item, null, 2);
        }
        return undefined;
      })
      .filter((item): item is string => Boolean(item));
    return evidence.length > 0 ? evidence : undefined;
  }
  if (isRecord(value)) {
    return [JSON.stringify(value, null, 2)];
  }
  return undefined;
}

function numberField(row: Record<string, unknown>, key: string): number | undefined {
  const value = row[key];
  return typeof value === "number" ? value : undefined;
}

function arrayField(row: Record<string, unknown>, key: string): string[] | undefined {
  const value = row[key];
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value.map((item) => String(item)).filter(Boolean);
}

if (isDirectRun(import.meta.url)) {
  await loadContentSnapshot();
}
