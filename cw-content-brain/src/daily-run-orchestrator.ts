import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

type StepStatus = "passed" | "failed";
type OverallStatus = "passed" | "failed";

interface DailyRunStep {
  stepNumber: number;
  command: string;
  purpose: string;
  status: StepStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  exitCode: number;
}

interface PlannedStep {
  stepNumber: number;
  scriptName: string;
  command: string;
  purpose: string;
}

const outputJson = "data/reports/daily_run_orchestrator_report.json";
const outputMd = "data/reports/daily_run_orchestrator_report.md";

const plannedSteps: PlannedStep[] = [
  {
    stepNumber: 1,
    scriptName: "content:research-guard",
    command: "npm run content:research-guard",
    purpose: "Review local proposed content ideas for duplication, cannibalisation, and evidence risks.",
  },
  {
    stepNumber: 2,
    scriptName: "content:agents",
    command: "npm run content:agents",
    purpose: "Refresh the local Watchdog HQ agent registry and hierarchy report.",
  },
  {
    stepNumber: 3,
    scriptName: "content:master-queue",
    command: "npm run content:master-queue",
    purpose: "Build the local Master Command Queue from available planning reports.",
  },
  {
    stepNumber: 4,
    scriptName: "content:fix-drafts",
    command: "npm run content:fix-drafts",
    purpose: "Generate safe draft-only fix suggestions from the command queue.",
  },
  {
    stepNumber: 5,
    scriptName: "content:preview-diffs",
    command: "npm run content:preview-diffs",
    purpose: "Create preview-only textual diffs from fix draft suggestions.",
  },
  {
    stepNumber: 6,
    scriptName: "content:approvals",
    command: "npm run content:approvals",
    purpose: "Create the local approval-planning queue without granting approval.",
  },
  {
    stepNumber: 7,
    scriptName: "content:daily-brief",
    command: "npm run content:daily-brief",
    purpose: "Summarise the local Watchdog HQ reports into Danny's daily brief.",
  },
  {
    stepNumber: 8,
    scriptName: "content:qc",
    command: "npm run content:qc",
    purpose: "Run cross-department quality control over worker and manager outputs.",
  },
  {
    stepNumber: 9,
    scriptName: "content:manager-escalations",
    command: "npm run content:manager-escalations",
    purpose: "Route manager-to-manager escalations before anything reaches Danny.",
  },
];

const excludedCommands = [
  "npm run crawl",
  "npm run content:export",
  "npm run content:gsc",
  "npm run content:ga4",
  "npm run content:verify-rendered",
  "publishing/apply/live-site commands",
];

export async function runDailyOrchestrator(): Promise<unknown> {
  const completedSteps: DailyRunStep[] = [];
  const skippedSteps: PlannedStep[] = [];
  let overallStatus: OverallStatus = "passed";

  for (const step of plannedSteps) {
    const result = await runStep(step);
    completedSteps.push(result);
    if (result.status === "failed") {
      overallStatus = "failed";
      skippedSteps.push(...plannedSteps.filter((candidate) => candidate.stepNumber > step.stepNumber));
      break;
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    phase: "2Q",
    name: "Daily Run Orchestrator v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    overallStatus,
    steps: completedSteps,
    skippedSteps,
    safetyChecks: {
      fixedCommandListOnly: true,
      liveCommandsExcluded: true,
      supabaseWritesExcluded: true,
      publishingExcluded: true,
      patchFilesGenerated: false,
      updatePayloadsGenerated: false,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
      excludedCommands,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Daily run orchestrator report written", {
    overallStatus,
    completedSteps: completedSteps.length,
    skippedSteps: skippedSteps.length,
    outputJson,
    outputMd,
  });

  if (overallStatus === "failed") {
    process.exitCode = 1;
  }
  return report;
}

async function runStep(step: PlannedStep): Promise<DailyRunStep> {
  const started = Date.now();
  const startedAt = new Date(started).toISOString();
  const exitCode = await runNpmScript(step.scriptName);
  const finished = Date.now();
  return {
    stepNumber: step.stepNumber,
    command: step.command,
    purpose: step.purpose,
    status: exitCode === 0 ? "passed" : "failed",
    startedAt,
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    exitCode,
  };
}

async function runNpmScript(scriptName: string): Promise<number> {
  return new Promise((resolve) => {
    const npm = npmInvocation(scriptName);
    const child = spawn(npm.command, npm.args, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false,
      windowsHide: true,
      env: process.env,
    });

    child.on("error", (error) => {
      logger.error("Daily run step failed to start", { scriptName, error });
      resolve(1);
    });

    child.on("close", (code) => {
      resolve(typeof code === "number" ? code : 1);
    });
  });
}

function npmInvocation(scriptName: string): { command: string; args: string[] } {
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath) {
    return { command: process.execPath, args: [npmExecPath, "run", scriptName] };
  }
  const bundledNpmCli = resolve(dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
  if (existsSync(bundledNpmCli)) {
    return { command: process.execPath, args: [bundledNpmCli, "run", scriptName] };
  }
  return { command: process.platform === "win32" ? "npm.cmd" : "npm", args: ["run", scriptName] };
}

function renderMarkdown(report: {
  generatedAt: string;
  name: string;
  safetyMode: string;
  canAutoApply: false;
  approvedCount: 0;
  appliedCount: 0;
  overallStatus: OverallStatus;
  steps: DailyRunStep[];
  skippedSteps: PlannedStep[];
  safetyChecks: Record<string, unknown>;
}): string {
  const failedStep = report.steps.find((step) => step.status === "failed");
  return [
    `# ${report.name}`,
    "",
    "## Safety Summary",
    "",
    `Generated: ${report.generatedAt}`,
    `Safety mode: ${report.safetyMode}`,
    `canAutoApply: ${report.canAutoApply}`,
    `approvedCount: ${report.approvedCount}`,
    `appliedCount: ${report.appliedCount}`,
    "This orchestrator uses a fixed internal command list only. It excludes live crawlers, Supabase export, Search Console import, GA4 import, rendered verification, publishing, apply, and live-site commands.",
    "",
    "## Overall Status",
    "",
    report.overallStatus,
    "",
    "## Step Results",
    "",
    renderStepTable(report.steps),
    "",
    "## Skipped Steps",
    "",
    report.skippedSteps.length ? renderPlannedStepList(report.skippedSteps) : "No steps were skipped.",
    "",
    "## Failure Summary",
    "",
    failedStep
      ? `Step ${failedStep.stepNumber} failed: ${failedStep.command} exited with code ${failedStep.exitCode}.${report.skippedSteps.length > 0 ? " Remaining steps were skipped." : ""}`
      : "No failures were recorded.",
    "",
    "## Safety Checks",
    "",
    Object.entries(report.safetyChecks).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(", ") : value}`).join("\n"),
    "",
    "## Final Safety Statement",
    "",
    "This daily run orchestrator is read-only/report-only. It does not approve, apply, publish, create patch files, create update payloads, write to Supabase, run live crawlers, run Google imports, verify rendered live pages, or edit live site files.",
  ].join("\n");
}

function renderStepTable(steps: DailyRunStep[]): string {
  if (steps.length === 0) return "No steps were run.";
  const rows = steps.map((step) => `| ${step.stepNumber} | ${step.command} | ${step.status} | ${step.exitCode} | ${step.durationMs} | ${step.startedAt} | ${step.finishedAt} |`);
  return ["| Step | Command | Status | Exit | Duration ms | Started | Finished |", "| --- | --- | --- | --- | ---: | --- | --- |", ...rows].join("\n");
}

function renderPlannedStepList(steps: PlannedStep[]): string {
  return steps.map((step) => `- Step ${step.stepNumber}: ${step.command} - ${step.purpose}`).join("\n");
}

if (isDirectRun(import.meta.url)) {
  runDailyOrchestrator().catch((error) => {
    logger.error("Daily run orchestrator failed", { error });
    process.exitCode = 1;
  });
}
