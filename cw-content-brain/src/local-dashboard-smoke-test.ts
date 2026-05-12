import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const dashboardPath = "data/local-dashboard/index.html";

const requiredMarkers = [
  "READ_ONLY_REPORT_ONLY",
  "canAutoApply <strong>false</strong>",
  "approvedCount <strong>0</strong>",
  "appliedCount <strong>0</strong>",
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

const unsafeMarkers = [
  { label: "canAutoApply true", pattern: /canAutoApply(?:<[^>]+>|\s)+true/i },
  { label: "apply live", pattern: /apply live/i },
  { label: "write to Supabase", pattern: /write to Supabase/i },
  { label: "publish now", pattern: /publish now/i },
  { label: "approvedCount 1", pattern: /approvedCount(?:<[^>]+>|\s)+1\b/i },
  { label: "appliedCount 1", pattern: /appliedCount(?:<[^>]+>|\s)+1\b/i },
  { label: "service_role", pattern: /service_role/i },
  { label: "SUPABASE_SERVICE_ROLE", pattern: /SUPABASE_SERVICE_ROLE/i },
  { label: "API key", pattern: /API key/i },
];

export async function smokeTestLocalDashboard(): Promise<void> {
  const absolutePath = fromRoot(dashboardPath);
  const missingRequiredMarkers: string[] = [];
  const unsafeMarkersFound: string[] = [];
  const errors: string[] = [];

  if (!existsSync(absolutePath)) {
    errors.push(`Missing generated dashboard: ${absolutePath}. Run npm run dashboard:build first.`);
  } else {
    const html = await readFile(absolutePath, "utf8");
    for (const marker of requiredMarkers) {
      if (!html.includes(marker)) missingRequiredMarkers.push(marker);
    }
    for (const unsafe of unsafeMarkers) {
      if (unsafe.pattern.test(html)) unsafeMarkersFound.push(unsafe.label);
    }
  }

  const passed = errors.length === 0 && missingRequiredMarkers.length === 0 && unsafeMarkersFound.length === 0;
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
    unsafeMarkersChecked: unsafeMarkers.length,
    unsafeMarkersFound,
    errors,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (!passed) {
    logger.error("Local dashboard smoke test failed", summary);
    process.exitCode = 1;
  }
}

if (isDirectRun(import.meta.url)) {
  smokeTestLocalDashboard().catch((error) => {
    logger.error("Local dashboard smoke test crashed", { error });
    process.exitCode = 1;
  });
}
