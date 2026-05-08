import { isDirectRun, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import { auditAffiliatePlacement } from "./audit_affiliate_placement.js";
import { auditContentLinking } from "./audit_content_linking.js";
import { auditContentQuality } from "./audit_content_quality.js";
import { loadContentSnapshot } from "./load_content_snapshot.js";

interface SnapshotRunStep {
  name: string;
  status: "completed" | "failed";
  detail?: string;
}

export async function runContentSnapshotAudit(): Promise<void> {
  const startedAt = new Date().toISOString();
  const steps: SnapshotRunStep[] = [];
  let normalisedCount = 0;
  let failure: unknown;

  try {
    const records = await loadContentSnapshot();
    normalisedCount = records.length;
    steps.push({ name: "load_content_snapshot", status: "completed" });
  } catch (error) {
    steps.push({ name: "load_content_snapshot", status: "failed", detail: errorMessage(error) });
    failure = error;
  }

  if (!failure) {
    for (const [name, step] of [
      ["audit_content_quality", auditContentQuality],
      ["audit_affiliate_placement", auditAffiliatePlacement],
      ["audit_content_linking", auditContentLinking],
    ] as const) {
      try {
        await step();
        steps.push({ name, status: "completed" });
      } catch (error) {
        steps.push({ name, status: "failed", detail: errorMessage(error) });
        failure = error;
        break;
      }
    }
  }

  await writeJson("logs/content-snapshot-run.json", {
    startedAt,
    finishedAt: new Date().toISOString(),
    normalisedCount,
    outputs: [
      "data/content_snapshot/normalised_content.json",
      "data/reports/content_quality_report.json",
      "data/reports/affiliate_placement_report.json",
      "data/reports/content_linking_report.json",
      "logs/content-snapshot-run.json",
    ],
    steps,
    readOnly: true,
    writeBackToSupabase: false,
  });

  logger.info("Content snapshot audit complete", { normalisedCount });

  if (failure) {
    throw failure;
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

if (isDirectRun(import.meta.url)) {
  await runContentSnapshotAudit();
}
