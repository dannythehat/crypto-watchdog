import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const dashboardFiles = [
  "data/dashboard/overview.json",
  "data/dashboard/command.json",
  "data/dashboard/approvals.json",
  "data/dashboard/agents.json",
  "data/dashboard/content.json",
  "data/dashboard/seo.json",
  "data/dashboard/affiliates.json",
  "data/dashboard/research.json",
  "data/dashboard/analytics.json",
];

const expectedSections = ["Overview", "Command", "Approvals", "Agents", "Content", "SEO", "Affiliates", "Research", "Analytics"];
const outputHtml = "data/local-dashboard/index.html";

export async function validateLocalDashboardShell(): Promise<void> {
  const errors: string[] = [];

  for (const file of dashboardFiles) {
    if (!existsSync(fromRoot(file))) {
      errors.push(`Missing dashboard input: ${file}`);
    }
  }

  const htmlPath = fromRoot(outputHtml);
  if (!existsSync(htmlPath)) {
    errors.push(`Missing generated dashboard: ${outputHtml}`);
  } else {
    const html = await readFile(htmlPath, "utf8");
    validateHtml(html, errors);
  }

  if (errors.length > 0) {
    logger.error("Local dashboard shell validation failed", { errors });
    process.exitCode = 1;
    return;
  }

  logger.info("Local dashboard shell validation passed", {
    dashboardInputs: dashboardFiles.length,
    sections: expectedSections.length,
    outputHtml,
  });
}

function validateHtml(html: string, errors: string[]): void {
  for (const section of expectedSections) {
    if (!html.includes(section)) {
      errors.push(`Generated dashboard is missing section: ${section}`);
    }
  }

  const requiredText = ["READ_ONLY_REPORT_ONLY", "canAutoApply <strong>false</strong>", "approvedCount <strong>0</strong>", "appliedCount <strong>0</strong>"];
  for (const text of requiredText) {
    if (!html.includes(text)) {
      errors.push(`Generated dashboard is missing safety text: ${text}`);
    }
  }

  const unsafePatterns = [
    { label: "canAutoApply true", pattern: /canAutoApply(?:<[^>]+>|\s)+true/i },
    { label: "approvedCount greater than 0", pattern: /approvedCount\s*(?:<[^>]+>|\s)*[1-9]\d*/i },
    { label: "appliedCount greater than 0", pattern: /appliedCount\s*(?:<[^>]+>|\s)*[1-9]\d*/i },
    { label: "unsafe publish wording", pattern: /\bpublish\b/i },
    { label: "unsafe apply live wording", pattern: /apply live/i },
    { label: "unsafe Supabase write wording", pattern: /write to Supabase/i },
  ];

  for (const unsafe of unsafePatterns) {
    if (unsafe.pattern.test(html)) {
      errors.push(`Generated dashboard contains ${unsafe.label}.`);
    }
  }
}

if (isDirectRun(import.meta.url)) {
  validateLocalDashboardShell().catch((error) => {
    logger.error("Local dashboard shell validation failed", { error });
    process.exitCode = 1;
  });
}
