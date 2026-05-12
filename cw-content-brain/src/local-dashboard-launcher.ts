import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const dashboardPath = "data/local-dashboard/index.html";

export function launchLocalDashboard(): void {
  const absolutePath = fromRoot(dashboardPath);
  if (!existsSync(absolutePath)) {
    logger.error("Local dashboard HTML is missing. Run npm run dashboard:build first.", {
      expectedPath: absolutePath,
      safetyMode: "READ_ONLY_REPORT_ONLY",
      localOnly: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    });
    process.exitCode = 1;
    return;
  }

  const fileUrl = pathToFileURL(absolutePath).href;
  const summary = {
    status: "ready",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    localOnly: true,
    readOnly: true,
    canAutoApply: false,
    approvedCount: 0,
    appliedCount: 0,
    htmlPath: absolutePath,
    fileUrl,
    note: "Paste the fileUrl into a browser. This launcher does not start a server, publish, apply changes, or write to Supabase.",
  };
  console.log(JSON.stringify(summary, null, 2));
}

if (isDirectRun(import.meta.url)) {
  launchLocalDashboard();
}
