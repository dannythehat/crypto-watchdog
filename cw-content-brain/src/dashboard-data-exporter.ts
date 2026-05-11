import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

type ExportStatus = "passed" | "failed";

interface DashboardExport {
  path: string;
  data: Record<string, unknown>;
}

const sourceInput = "data/reports/daily_report_pack.json";
const reportJson = "data/reports/dashboard_data_export_report.json";
const reportMd = "data/reports/dashboard_data_export_report.md";

const dashboardFiles = {
  overview: "data/dashboard/overview.json",
  command: "data/dashboard/command.json",
  approvals: "data/dashboard/approvals.json",
  agents: "data/dashboard/agents.json",
  content: "data/dashboard/content.json",
  seo: "data/dashboard/seo.json",
  affiliates: "data/dashboard/affiliates.json",
  research: "data/dashboard/research.json",
  analytics: "data/dashboard/analytics.json",
} as const;

export async function exportDashboardData(): Promise<unknown> {
  const generatedAt = new Date().toISOString();
  const inputPath = fromRoot(sourceInput);
  if (!existsSync(inputPath)) {
    const failedReport = buildReport({
      generatedAt,
      sourceInputFound: false,
      exportedFiles: [],
      missingInputs: [sourceInput],
      exportStatus: "failed",
      safetyChecks: baseSafetyChecks(),
    });
    await writeJson(reportJson, failedReport);
    await writeText(reportMd, renderMarkdown(failedReport));
    logger.error("Dashboard data export failed: missing daily report pack", { sourceInput });
    process.exitCode = 1;
    return failedReport;
  }

  const pack = JSON.parse(await readFile(inputPath, "utf8")) as Record<string, unknown>;
  const exports = buildDashboardExports(generatedAt, pack).map((entry) => ({
    path: entry.path,
    data: sanitiseDashboardValue(entry.data) as Record<string, unknown>,
  }));
  const validation = validateExports(exports);
  if (validation.length > 0) {
    const failedReport = buildReport({
      generatedAt,
      sourceInputFound: true,
      exportedFiles: [],
      missingInputs: [],
      exportStatus: "failed",
      safetyChecks: {
        ...baseSafetyChecks(),
        unsafeOutputDetected: true,
        unsafeOutputReasons: validation,
      },
    });
    await writeJson(reportJson, failedReport);
    await writeText(reportMd, renderMarkdown(failedReport));
    logger.error("Dashboard data export failed safety validation", { validation });
    process.exitCode = 1;
    return failedReport;
  }

  for (const entry of exports) {
    await writeJson(entry.path, entry.data);
  }

  const report = buildReport({
    generatedAt,
    sourceInputFound: true,
    exportedFiles: exports.map((entry) => entry.path),
    missingInputs: [],
    exportStatus: "passed",
    safetyChecks: {
      ...baseSafetyChecks(),
      unsafeOutputDetected: false,
      exportedFileCount: exports.length,
    },
  });
  await writeJson(reportJson, report);
  await writeText(reportMd, renderMarkdown(report));
  logger.info("Dashboard data export written", {
    exportedFiles: exports.length,
    outputFolder: "data/dashboard",
    reportJson,
    reportMd,
  });
  return report;
}

function buildDashboardExports(generatedAt: string, pack: Record<string, unknown>): DashboardExport[] {
  const sourcePackGeneratedAt = stringAt(pack, "generatedAt") ?? "";
  const packStatus = stringAt(pack, "packStatus") ?? "unknown";
  const safetyMode = stringAt(pack, "safetyMode") ?? "READ_ONLY_REPORT_ONLY";
  const commandQueueSummary = recordAt(pack, "commandQueueSummary");
  const dailyRunSummary = recordAt(pack, "dailyRunSummary");
  const qcSummary = recordAt(pack, "qcSummary");
  const escalationSummary = recordAt(pack, "escalationSummary");
  const topDannyDecisionItems = listAt(pack, "topDannyDecisionItems");
  const blockedOrRiskyItems = listAt(pack, "blockedOrRiskyItems");
  const monitorOnlyItems = listAt(pack, "monitorOnlyItems");
  const moneyOpportunities = listAt(pack, "moneyOpportunities");
  const nextRecommendedBlocks = listAt(pack, "nextRecommendedBlocks");
  const performanceChanges = listAt(recordAt(pack, "commandQueueSummary"), "performanceChanges");
  const safeDraftsReady = numberAt(commandQueueSummary, "safeDraftsReady");
  const needsDannyApproval = numberAt(commandQueueSummary, "needsDannyApproval");
  const blockedRiskyItems = numberAt(commandQueueSummary, "blockedRiskyItems");
  const monitorOnly = numberAt(commandQueueSummary, "monitorOnly");
  const moneyOpportunityCount = numberAt(commandQueueSummary, "moneyOpportunities");
  const qcFindings = numberAt(recordAt(qcSummary, "summaryCounts"), "findingCount");
  const escalationItems = numberAt(escalationSummary, "itemCount");

  return [
    {
      path: dashboardFiles.overview,
      data: withSafety({
        generatedAt,
        sourcePackGeneratedAt,
        packStatus,
        safetyMode,
        headlineSummary: stringAt(recordAt(pack, "executiveSummary"), "plainEnglishSummary") ?? "Daily report pack is available for local dashboard review.",
        statusCards: {
          safeDraftsReady,
          needsDannyApproval,
          blockedRiskyItems,
          monitorOnly,
          moneyOpportunities: moneyOpportunityCount,
          qcFindings,
          escalationItems,
          dailyRunStatus: stringAt(dailyRunSummary, "overallStatus") ?? "unknown",
        },
        nextRecommendedBlocks,
        safetyChecks: recordAt(pack, "safetyChecks"),
      }),
    },
    {
      path: dashboardFiles.command,
      data: withSafety({
        generatedAt,
        todayCommandQueue: {
          safeDraftsReady,
          needsDannyApproval,
          blockedRiskyItems,
          monitorOnly,
          performanceChanges: numberAt(commandQueueSummary, "performanceChanges"),
          moneyOpportunities: moneyOpportunityCount,
        },
        topDannyDecisionItems,
        blockedOrRiskyItems,
        nextRecommendedBlocks,
      }),
    },
    {
      path: dashboardFiles.approvals,
      data: withSafety({
        generatedAt,
        approvalSummary: recordAt(pack, "approvalSummary"),
        topDannyDecisionItems,
        blockedOrRiskyItems,
        approvalMode: "PLANNING_ONLY",
        noRealApprovals: true,
      }),
    },
    {
      path: dashboardFiles.agents,
      data: withSafety({
        generatedAt,
        agentSummary: recordAt(pack, "agentSummary"),
        escalationSummary,
        managerRoutingEnabled: true,
        hierarchy: "Danny → Master AI Manager → Department AI Managers → Specialist Agents",
      }),
    },
    {
      path: dashboardFiles.content,
      data: withSafety({
        generatedAt,
        contentSummary: recordAt(pack, "contentSummary"),
        safeDraftsReady: topDannyDecisionItems.filter((item) => riskAt(item) !== "high"),
        monitorOnlyItems,
        nextRecommendedBlocks,
      }),
    },
    {
      path: dashboardFiles.seo,
      data: withSafety({
        generatedAt,
        seoSummary: recordAt(pack, "seoSummary"),
        performanceChanges,
        monitorOnlyItems,
        nextRecommendedBlocks,
      }),
    },
    {
      path: dashboardFiles.affiliates,
      data: withSafety({
        generatedAt,
        affiliateSummary: recordAt(pack, "affiliateSummary"),
        moneyOpportunities,
        blockedOrRiskyItems,
        affiliateSafetyNote:
          "Affiliate opportunities are planning-only. Red-rated or warning pages require manual approval before any affiliate placement.",
      }),
    },
    {
      path: dashboardFiles.research,
      data: withSafety({
        generatedAt,
        researchSummary: recordAt(pack, "researchSummary"),
        blockedOrRiskyItems,
        monitorOnlyItems,
        nextRecommendedBlocks,
      }),
    },
    {
      path: dashboardFiles.analytics,
      data: withSafety({
        generatedAt,
        analyticsSummary: recordAt(pack, "analyticsSummary"),
        performanceChanges,
        monitorOnlyItems,
      }),
    },
  ];
}

function withSafety(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...data,
    canAutoApply: false,
    approvedCount: 0,
    appliedCount: 0,
  };
}

function sanitiseDashboardValue(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitiseDashboardValue(item));
  }
  if (isRecord(value)) {
    const output: Record<string, unknown> = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      if (childKey === "canAutoApply") {
        output[childKey] = false;
        continue;
      }
      if ((childKey === "approved" || childKey === "applied") && childValue === true) {
        output[childKey] = false;
        continue;
      }
      if ((childKey === "stage" || childKey === "currentStage" || childKey === "statusStage") && (childValue === "approved" || childValue === "applied")) {
        output[childKey] = "recommended";
        continue;
      }
      output[childKey] = sanitiseDashboardValue(childValue, childKey);
    }
    if (!("canAutoApply" in output)) output.canAutoApply = false;
    return output;
  }
  if (typeof value === "string") {
    return sanitiseString(value, key);
  }
  return value;
}

function sanitiseString(value: string, key: string): string {
  const redacted = value.replace(/https?:\/\/[^\s)"']+/gi, (match) => {
    try {
      const url = new URL(match);
      if (url.hostname === "cryptowatchdog.net" || url.hostname.endsWith(".cryptowatchdog.net")) return match;
    } catch {
      return "[url redacted]";
    }
    return "[external url redacted]";
  });
  if ((key === "stage" || key === "currentStage" || key === "statusStage") && (redacted === "approved" || redacted === "applied")) {
    return "recommended";
  }
  return redacted;
}

function validateExports(exports: DashboardExport[]): string[] {
  const reasons: string[] = [];
  for (const entry of exports) {
    const text = JSON.stringify(entry.data);
    if (/"canAutoApply"\s*:\s*true/.test(text)) reasons.push(`${entry.path}: canAutoApply true detected`);
    if (/"approved"\s*:\s*true/.test(text)) reasons.push(`${entry.path}: approved true detected`);
    if (/"applied"\s*:\s*true/.test(text)) reasons.push(`${entry.path}: applied true detected`);
    if (/"(?:stage|currentStage|statusStage)"\s*:\s*"(?:approved|applied)"/.test(text)) reasons.push(`${entry.path}: approved/applied stage detected`);
    const externalUrls = text.match(/https?:\/\/[^"\s)]+/gi) ?? [];
    for (const rawUrl of externalUrls) {
      try {
        const url = new URL(rawUrl);
        if (url.hostname !== "cryptowatchdog.net" && !url.hostname.endsWith(".cryptowatchdog.net")) {
          reasons.push(`${entry.path}: external URL detected`);
          break;
        }
      } catch {
        reasons.push(`${entry.path}: malformed URL detected`);
        break;
      }
    }
  }
  return reasons;
}

function buildReport(args: {
  generatedAt: string;
  sourceInputFound: boolean;
  exportedFiles: string[];
  missingInputs: string[];
  exportStatus: ExportStatus;
  safetyChecks: Record<string, unknown>;
}): Record<string, unknown> {
  return {
    generatedAt: args.generatedAt,
    phase: "2S",
    name: "Dashboard Data Export Layer v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    canAutoApply: false,
    approvedCount: 0,
    appliedCount: 0,
    sourceInput,
    sourceInputFound: args.sourceInputFound,
    exportedFiles: args.exportedFiles,
    missingInputs: args.missingInputs,
    exportStatus: args.exportStatus,
    safetyChecks: args.safetyChecks,
  };
}

function baseSafetyChecks(): Record<string, unknown> {
  return {
    reportOnly: true,
    localDashboardDataOnly: true,
    noLiveWrites: true,
    noSupabaseWrites: true,
    noPublishing: true,
    noPatchFiles: true,
    noUpdatePayloads: true,
    noApprovedState: true,
    noAppliedState: true,
    canAutoApply: false,
    approvedCount: 0,
    appliedCount: 0,
  };
}

function renderMarkdown(report: Record<string, unknown>): string {
  const exportedFiles = Array.isArray(report.exportedFiles) ? report.exportedFiles : [];
  const missingInputs = Array.isArray(report.missingInputs) ? report.missingInputs : [];
  return [
    "# Dashboard Data Export Layer v1",
    "",
    "## Safety Summary",
    "",
    "- Safety mode: READ_ONLY_REPORT_ONLY",
    "- This command creates local dashboard JSON only.",
    "- It does not create a dashboard UI, approve work, apply changes, publish content, create patches, create update payloads, write to Supabase, or edit live files.",
    "",
    "## Input File Status",
    "",
    `- Source input: ${sourceInput}`,
    `- Source input found: ${String(report.sourceInputFound)}`,
    missingInputs.length ? `- Missing inputs: ${missingInputs.join(", ")}` : "- Missing inputs: none",
    "",
    "## Exported Dashboard Files",
    "",
    exportedFiles.length ? ["| File |", "|---|", ...exportedFiles.map((file) => `| ${file} |`)].join("\n") : "No dashboard files were exported.",
    "",
    "## Export Status",
    "",
    `- Status: ${String(report.exportStatus)}`,
    "",
    "This is a local data export for future Watchdog HQ dashboard tabs only. Nothing has been approved, applied, published, patched, or written to Supabase.",
  ].join("\n");
}

function recordAt(value: unknown, key: string): Record<string, unknown> {
  const found = isRecord(value) ? value[key] : undefined;
  return isRecord(found) ? found : {};
}

function listAt(value: unknown, key: string): unknown[] {
  const found = isRecord(value) ? value[key] : undefined;
  return Array.isArray(found) ? found : [];
}

function stringAt(value: unknown, key: string): string | undefined {
  const found = isRecord(value) ? value[key] : undefined;
  return typeof found === "string" && found.trim() ? found : undefined;
}

function numberAt(value: unknown, key: string): number {
  const found = isRecord(value) ? value[key] : undefined;
  return typeof found === "number" ? found : 0;
}

function riskAt(value: unknown): string {
  const found = isRecord(value) ? value.riskLevel : undefined;
  return typeof found === "string" ? found : "unknown";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

if (isDirectRun(import.meta.url)) {
  exportDashboardData().catch((error) => {
    logger.error("Dashboard data export failed", { error });
    process.exitCode = 1;
  });
}
