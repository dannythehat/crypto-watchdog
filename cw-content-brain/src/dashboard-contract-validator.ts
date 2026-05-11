import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

type ValidationStatus = "passed" | "failed";

interface DashboardFileContract {
  file: string;
  requiredFields: string[];
  exactValues?: Record<string, unknown>;
  customChecks?: Array<(data: unknown) => string | undefined>;
}

interface FileValidationResult {
  file: string;
  exists: boolean;
  parses: boolean;
  status: ValidationStatus;
  errors: string[];
  warnings: string[];
}

const reportJson = "data/reports/dashboard_contract_validation_report.json";
const reportMd = "data/reports/dashboard_contract_validation_report.md";

const dashboardContracts: DashboardFileContract[] = [
  {
    file: "data/dashboard/overview.json",
    requiredFields: [
      "generatedAt",
      "sourcePackGeneratedAt",
      "packStatus",
      "safetyMode",
      "canAutoApply",
      "approvedCount",
      "appliedCount",
      "headlineSummary",
      "statusCards",
      "statusCards.safeDraftsReady",
      "statusCards.needsDannyApproval",
      "statusCards.blockedRiskyItems",
      "statusCards.monitorOnly",
      "statusCards.moneyOpportunities",
      "statusCards.qcFindings",
      "statusCards.escalationItems",
      "statusCards.dailyRunStatus",
      "nextRecommendedBlocks",
      "safetyChecks",
    ],
    exactValues: {
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  },
  {
    file: "data/dashboard/command.json",
    requiredFields: [
      "generatedAt",
      "todayCommandQueue",
      "todayCommandQueue.safeDraftsReady",
      "todayCommandQueue.needsDannyApproval",
      "todayCommandQueue.blockedRiskyItems",
      "todayCommandQueue.monitorOnly",
      "todayCommandQueue.performanceChanges",
      "todayCommandQueue.moneyOpportunities",
      "topDannyDecisionItems",
      "blockedOrRiskyItems",
      "nextRecommendedBlocks",
      "canAutoApply",
    ],
    exactValues: { canAutoApply: false },
  },
  {
    file: "data/dashboard/approvals.json",
    requiredFields: [
      "generatedAt",
      "approvalSummary",
      "topDannyDecisionItems",
      "blockedOrRiskyItems",
      "approvalMode",
      "noRealApprovals",
      "canAutoApply",
      "approvedCount",
      "appliedCount",
    ],
    exactValues: {
      approvalMode: "PLANNING_ONLY",
      noRealApprovals: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  },
  {
    file: "data/dashboard/agents.json",
    requiredFields: ["generatedAt", "agentSummary", "escalationSummary", "managerRoutingEnabled", "hierarchy", "canAutoApply"],
    exactValues: {
      managerRoutingEnabled: true,
      canAutoApply: false,
    },
  },
  {
    file: "data/dashboard/content.json",
    requiredFields: ["generatedAt", "contentSummary", "safeDraftsReady", "monitorOnlyItems", "nextRecommendedBlocks", "canAutoApply"],
    exactValues: { canAutoApply: false },
  },
  {
    file: "data/dashboard/seo.json",
    requiredFields: ["generatedAt", "seoSummary", "performanceChanges", "monitorOnlyItems", "nextRecommendedBlocks", "canAutoApply"],
    exactValues: { canAutoApply: false },
  },
  {
    file: "data/dashboard/affiliates.json",
    requiredFields: ["generatedAt", "affiliateSummary", "moneyOpportunities", "blockedOrRiskyItems", "affiliateSafetyNote", "canAutoApply"],
    exactValues: { canAutoApply: false },
    customChecks: [validateAffiliateSafetyNote],
  },
  {
    file: "data/dashboard/research.json",
    requiredFields: ["generatedAt", "researchSummary", "blockedOrRiskyItems", "monitorOnlyItems", "nextRecommendedBlocks", "canAutoApply"],
    exactValues: { canAutoApply: false },
  },
  {
    file: "data/dashboard/analytics.json",
    requiredFields: ["generatedAt", "analyticsSummary", "performanceChanges", "monitorOnlyItems", "canAutoApply"],
    exactValues: { canAutoApply: false },
  },
];

export async function validateDashboardContracts(): Promise<unknown> {
  const filesChecked: FileValidationResult[] = [];

  for (const contract of dashboardContracts) {
    filesChecked.push(await validateFile(contract));
  }

  const missingFiles = filesChecked.filter((file) => !file.exists).map((file) => file.file);
  const invalidFiles = filesChecked.filter((file) => file.status === "failed").map((file) => file.file);
  const errors = filesChecked.flatMap((file) => file.errors.map((error) => `${file.file}: ${error}`));
  const warnings = filesChecked.flatMap((file) => file.warnings.map((warning) => `${file.file}: ${warning}`));
  const validationStatus: ValidationStatus = invalidFiles.length === 0 ? "passed" : "failed";

  const report = {
    generatedAt: new Date().toISOString(),
    phase: "2T",
    name: "Dashboard Contract Validator v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    validationStatus,
    filesChecked,
    missingFiles,
    invalidFiles,
    warnings,
    errors,
    contractSummary: {
      expectedFileCount: dashboardContracts.length,
      checkedFileCount: filesChecked.length,
      passedFileCount: filesChecked.filter((file) => file.status === "passed").length,
      failedFileCount: filesChecked.filter((file) => file.status === "failed").length,
      missingFileCount: missingFiles.length,
      errorCount: errors.length,
      warningCount: warnings.length,
    },
    safetyChecks: {
      reportOnly: true,
      localDashboardValidationOnly: true,
      noLiveWrites: true,
      noSupabaseWrites: true,
      noPublishing: true,
      noPatchFiles: true,
      noUpdatePayloads: true,
      noApprovedState: filesChecked.every((file) => !file.errors.some((error) => error.includes("approved"))),
      noAppliedState: filesChecked.every((file) => !file.errors.some((error) => error.includes("applied"))),
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  };

  await writeJson(reportJson, report);
  await writeText(reportMd, renderMarkdown(report));
  logger.info("Dashboard contract validation report written", {
    validationStatus,
    filesChecked: filesChecked.length,
    missingFiles: missingFiles.length,
    invalidFiles: invalidFiles.length,
    reportJson,
    reportMd,
  });

  if (validationStatus === "failed") {
    process.exitCode = 1;
  }
  return report;
}

async function validateFile(contract: DashboardFileContract): Promise<FileValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const absolutePath = fromRoot(contract.file);

  if (!existsSync(absolutePath)) {
    return {
      file: contract.file,
      exists: false,
      parses: false,
      status: "failed",
      errors: ["Required dashboard file is missing."],
      warnings,
    };
  }

  const raw = await readFile(absolutePath, "utf8");
  let data: unknown;
  try {
    data = JSON.parse(raw) as unknown;
  } catch (error) {
    return {
      file: contract.file,
      exists: true,
      parses: false,
      status: "failed",
      errors: [`JSON parsing failed: ${error instanceof Error ? error.message : "Unknown parse error"}`],
      warnings,
    };
  }

  runGlobalChecks(data, raw, errors);
  for (const field of contract.requiredFields) {
    if (!hasPath(data, field)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  for (const [field, expected] of Object.entries(contract.exactValues ?? {})) {
    const actual = getPath(data, field);
    if (actual !== expected) {
      errors.push(`Field ${field} must equal ${JSON.stringify(expected)}.`);
    }
  }

  for (const customCheck of contract.customChecks ?? []) {
    const customError = customCheck(data);
    if (customError) errors.push(customError);
  }

  return {
    file: contract.file,
    exists: true,
    parses: true,
    status: errors.length === 0 ? "passed" : "failed",
    errors,
    warnings,
  };
}

function runGlobalChecks(data: unknown, raw: string, errors: string[]): void {
  if (!hasPath(data, "generatedAt")) errors.push("Missing generatedAt.");
  if (getPath(data, "canAutoApply") !== false) errors.push("canAutoApply must be false.");

  const approvedCount = getPath(data, "approvedCount");
  if (typeof approvedCount !== "undefined" && approvedCount !== 0) {
    errors.push("approvedCount must be 0 when present.");
  }

  const appliedCount = getPath(data, "appliedCount");
  if (typeof appliedCount !== "undefined" && appliedCount !== 0) {
    errors.push("appliedCount must be 0 when present.");
  }

  if (/"canAutoApply"\s*:\s*true/.test(raw)) errors.push("Unsafe state detected: canAutoApply true.");
  if (/"approved"\s*:\s*true/.test(raw)) errors.push("Unsafe state detected: approved true.");
  if (/"applied"\s*:\s*true/.test(raw)) errors.push("Unsafe state detected: applied true.");
  if (/"(?:currentStage|statusStage|stage)"\s*:\s*"(?:approved|applied)"/.test(raw)) {
    errors.push("Unsafe state detected: approved/applied stage value.");
  }

  for (const unsafeUrl of externalUrls(raw)) {
    errors.push(`Raw external URL detected: ${unsafeUrl}`);
  }
}

function validateAffiliateSafetyNote(data: unknown): string | undefined {
  const note = String(getPath(data, "affiliateSafetyNote") ?? "").toLowerCase();
  const requiredPhrases = ["planning-only", "red-rated", "warning", "manual approval", "affiliate placement"];
  const missing = requiredPhrases.filter((phrase) => !note.includes(phrase));
  if (missing.length > 0) {
    return `affiliateSafetyNote is missing required safety wording: ${missing.join(", ")}`;
  }
  return undefined;
}

function externalUrls(raw: string): string[] {
  const urls = raw.match(/https?:\/\/[^"\s)]+/gi) ?? [];
  return urls.filter((urlText) => {
    try {
      const url = new URL(urlText);
      return url.hostname !== "cryptowatchdog.net" && !url.hostname.endsWith(".cryptowatchdog.net");
    } catch {
      return true;
    }
  });
}

function hasPath(value: unknown, path: string): boolean {
  return typeof getPath(value, path) !== "undefined";
}

function getPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => (isRecord(current) ? current[key] : undefined), value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function renderMarkdown(report: {
  generatedAt: string;
  validationStatus: ValidationStatus;
  filesChecked: FileValidationResult[];
  missingFiles: string[];
  invalidFiles: string[];
  errors: string[];
  warnings: string[];
  contractSummary: Record<string, unknown>;
}): string {
  return [
    "# Dashboard Contract Validator v1",
    "",
    "## Safety Summary",
    "",
    "- Safety mode: READ_ONLY_REPORT_ONLY",
    "- This command validates local dashboard JSON contracts only.",
    "- It does not create UI, approve work, apply changes, publish content, create patch files, create update payloads, write to Supabase, or edit live files.",
    "",
    "## Overall Validation Status",
    "",
    `- Status: ${report.validationStatus}`,
    `- Generated: ${report.generatedAt}`,
    "",
    "## Files Checked",
    "",
    renderFilesTable(report.filesChecked),
    "",
    "## Missing Files",
    "",
    renderList(report.missingFiles, "No dashboard files are missing."),
    "",
    "## Invalid Files",
    "",
    renderList(report.invalidFiles, "No dashboard files are invalid."),
    "",
    "## Errors",
    "",
    renderList(report.errors, "No validation errors."),
    "",
    "## Warnings",
    "",
    renderList(report.warnings, "No validation warnings."),
    "",
    "## Contract Summary",
    "",
    Object.entries(report.contractSummary)
      .map(([key, value]) => `- ${key}: ${String(value)}`)
      .join("\n"),
    "",
    "This validator is read-only and report-only. It does not create dashboard UI, approve, apply, publish, patch, or write to Supabase.",
  ].join("\n");
}

function renderFilesTable(files: FileValidationResult[]): string {
  if (files.length === 0) return "No files were checked.";
  return [
    "| File | Exists | Parses | Status | Errors | Warnings |",
    "|---|---:|---:|---|---:|---:|",
    ...files.map((file) => `| ${file.file} | ${file.exists} | ${file.parses} | ${file.status} | ${file.errors.length} | ${file.warnings.length} |`),
  ].join("\n");
}

function renderList(items: string[], emptyText: string): string {
  if (items.length === 0) return emptyText;
  return items.map((item) => `- ${item}`).join("\n");
}

if (isDirectRun(import.meta.url)) {
  validateDashboardContracts().catch((error) => {
    logger.error("Dashboard contract validation failed", { error });
    process.exitCode = 1;
  });
}
