import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const dashboardPath = "data/local-dashboard/index.html";

const requiredMarkers = [
  "Watchdog HQ",
  "Local Dashboard Shell",
  "READ_ONLY_REPORT_ONLY",
  "Local only",
  "Read only",
  "No Supabase writes",
  "No publishing",
  "No approval/apply workflow",
  "canAutoApply",
  "approvedCount",
  "appliedCount",
  "Overview",
  "Command",
  "Approvals",
  "Agents",
  "Content",
  "SEO",
  "Affiliates",
  "Research",
  "Analytics",
];

const requiredSections = ["overview", "command", "approvals", "agents", "content", "seo", "affiliates", "research", "analytics"];

const unsafeMarkers = [
  { label: "canAutoApply true", pattern: /canAutoApply(?:<[^>]+>|\s)+true/i },
  { label: "approvedCount 1", pattern: /approvedCount(?:<[^>]+>|\s)+1\b/i },
  { label: "appliedCount 1", pattern: /appliedCount(?:<[^>]+>|\s)+1\b/i },
  { label: "publish now", pattern: /publish now/i },
  { label: "apply live", pattern: /apply live/i },
  { label: "write to Supabase", pattern: /write to Supabase/i },
  { label: "Supabase write enabled", pattern: /Supabase write enabled/i },
  { label: "approval enabled", pattern: /approval enabled/i },
  { label: "auto apply enabled", pattern: /auto apply enabled/i },
  { label: "live mode", pattern: /live mode/i },
  { label: "production write", pattern: /production write/i },
  { label: "service_role", pattern: /service_role/i },
  { label: "SUPABASE_SERVICE_ROLE", pattern: /SUPABASE_SERVICE_ROLE/i },
  { label: "API key", pattern: /API key/i },
];

interface StructureChecks {
  hasSafetyArea: boolean;
  hasDepartmentNavigation: boolean;
  hasDepartmentSections: boolean;
  enoughContentLength: boolean;
  sectionElementCount: number;
  cardClassCount: number;
  htmlLength: number;
}

export async function guardLocalDashboardUiContract(): Promise<void> {
  const absolutePath = fromRoot(dashboardPath);
  const missingRequiredMarkers: string[] = [];
  const missingSections: string[] = [];
  const unsafeMarkersFound: string[] = [];
  const errors: string[] = [];
  let structureChecks: StructureChecks | null = null;

  if (!existsSync(absolutePath)) {
    errors.push(`Missing generated dashboard: ${absolutePath}. Run npm run dashboard:build first.`);
  } else {
    const html = await readFile(absolutePath, "utf8");
    const lowerHtml = html.toLowerCase();

    for (const marker of requiredMarkers) {
      if (!lowerHtml.includes(marker.toLowerCase())) missingRequiredMarkers.push(marker);
    }

    for (const section of requiredSections) {
      if (!lowerHtml.includes(section)) missingSections.push(section);
    }

    for (const unsafe of unsafeMarkers) {
      if (unsafe.pattern.test(html)) unsafeMarkersFound.push(unsafe.label);
    }

    structureChecks = checkStructure(html);
    if (!structureChecks.hasSafetyArea) errors.push("Generated dashboard is missing a clear safety/status area.");
    if (!structureChecks.hasDepartmentNavigation) errors.push("Generated dashboard is missing dashboard section navigation.");
    if (!structureChecks.hasDepartmentSections) errors.push("Generated dashboard is missing expected department section/card structure.");
    if (!structureChecks.enoughContentLength) errors.push("Generated dashboard is too small and may be blank or incomplete.");
  }

  const passed =
    errors.length === 0 && missingRequiredMarkers.length === 0 && missingSections.length === 0 && unsafeMarkersFound.length === 0;
  const summary = {
    status: passed ? "passed" : "failed",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    localOnly: true,
    readOnly: true,
    canAutoApply: false,
    approvedCount: 0,
    appliedCount: 0,
    dashboardPath: absolutePath,
    requiredMarkersChecked: requiredMarkers.length,
    missingRequiredMarkers,
    requiredSectionsChecked: requiredSections.length,
    missingSections,
    unsafeMarkersChecked: unsafeMarkers.length,
    unsafeMarkersFound,
    structureChecks,
    errors,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!passed) {
    logger.error("Local dashboard UI contract guard failed", summary);
    process.exitCode = 1;
  }
}

function checkStructure(html: string): StructureChecks {
  const lowerHtml = html.toLowerCase();
  const sectionElementCount = (html.match(/<section\b/gi) ?? []).length;
  const cardClassCount = (html.match(/class="[^"]*\bcard\b[^"]*"/gi) ?? []).length;

  return {
    hasSafetyArea: lowerHtml.includes('aria-label="safety status"') && lowerHtml.includes("read_only_report_only"),
    hasDepartmentNavigation: lowerHtml.includes('aria-label="dashboard sections"') && requiredSections.every((section) => lowerHtml.includes(`#${section}`)),
    hasDepartmentSections: sectionElementCount >= requiredSections.length && cardClassCount >= 8,
    enoughContentLength: html.length >= 5000,
    sectionElementCount,
    cardClassCount,
    htmlLength: html.length,
  };
}

if (isDirectRun(import.meta.url)) {
  guardLocalDashboardUiContract().catch((error) => {
    logger.error("Local dashboard UI contract guard crashed", { error });
    process.exitCode = 1;
  });
}
