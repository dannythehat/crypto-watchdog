import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const blueprintPath = "docs/WATCHDOG_HQ_MASTER_BLUEPRINT.md";
const roadmapPath = "docs/WATCHDOG_HQ_BUILD_ROADMAP_STATUS.md";
const readmePath = "README.md";

const requiredBlueprintPhrases = [
  "Watchdog HQ",
  "CryptoWatchdog",
  "The Gaffer",
  "Gatekeeper Grace",
  "Audit Alfie",
  "Danny",
  "Evidence first",
  "READ_ONLY_REPORT_ONLY",
  "Content Operations",
  "SEO",
  "Keyword",
  "Internal Linking",
  "External Linking",
  "Affiliate",
  "Social",
  "Images",
  "Video",
  "Brand Voice",
  "Review production workflow",
  "Drafting reviews with placeholders is allowed",
  "Fake evidence/testing claims are blocked",
  "Safe Apply comes much later",
  "Trusted DeFi wallets",
  "DeFi wallets",
  "Page and article templates",
  "No humour on serious scam-loss pages",
  "Human and witty brand voice",
  "CryptoWatchdog final word",
  "Related blog posts",
  "Review cards",
  "Beautiful trusted brand boxes",
  "Themed hub pages",
];

const unsafeMarkers = [
  { label: "live publishing enabled", pattern: /(live publishing enabled|publish now|ready to publish)/i },
  { label: "Supabase write enabled", pattern: /(supabase write enabled|write to supabase now|supabase update payload ready)/i },
  { label: "auto apply enabled", pattern: /(auto apply enabled|apply live|safe apply enabled now)/i },
  { label: "affiliate URL insertion", pattern: /(insert affiliate urls?|affiliate url insertion enabled|add affiliate url now)/i },
  { label: "trust rating change", pattern: /(change trust ratings? now|trust rating change enabled|apply green rating|apply orange rating|apply red rating)/i },
  { label: "final scam/fraud accusation", pattern: /(final scam accusation|final fraud accusation|confirmed scam without approval|confirmed fraud without approval)/i },
  { label: "secret exposure", pattern: /(service_role|SUPABASE_SERVICE_ROLE|api key value|secret access enabled)/i },
];

export async function validateWatchdogHqBlueprintLock(): Promise<void> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequiredPhrases: string[] = [];
  const unsafeMarkersFound: string[] = [];
  const absoluteBlueprintPath = fromRoot(blueprintPath);
  const absoluteRoadmapPath = fromRoot(roadmapPath);

  const blueprint = await readRequiredText(blueprintPath, errors);
  const roadmap = await readRequiredText(roadmapPath, errors);
  const readme = await readRequiredText(readmePath, errors);

  if (readme && !readme.includes("docs/WATCHDOG_HQ_MASTER_BLUEPRINT.md")) errors.push("README must link to docs/WATCHDOG_HQ_MASTER_BLUEPRINT.md.");
  if (readme && !readme.includes("docs/WATCHDOG_HQ_BUILD_ROADMAP_STATUS.md")) errors.push("README must link to docs/WATCHDOG_HQ_BUILD_ROADMAP_STATUS.md.");

  if (blueprint) {
    for (const phrase of requiredBlueprintPhrases) {
      if (!blueprint.includes(phrase)) missingRequiredPhrases.push(phrase);
    }
    for (const unsafe of unsafeMarkers) {
      if (unsafe.pattern.test(blueprint)) unsafeMarkersFound.push(`blueprint:${unsafe.label}`);
    }
  }

  if (roadmap) {
    for (const buildNumber of ["Build #49", "Build #50", "Build #51", "Build #52", "Build #53", "Build #54", "Build #55", "Build #56"]) {
      if (!roadmap.includes(buildNumber)) errors.push(`Roadmap must include ${buildNumber}.`);
    }
    for (const status of ["built/merged", "planned"]) {
      if (!roadmap.includes(status)) errors.push(`Roadmap must include ${status} statuses.`);
    }
    if (!roadmap.includes("in_progress") && !roadmap.includes("built")) errors.push("Roadmap must mark Build #49 as in_progress or built.");
    for (const unsafe of unsafeMarkers) {
      if (unsafe.pattern.test(roadmap)) unsafeMarkersFound.push(`roadmap:${unsafe.label}`);
    }
  }

  const passed = errors.length === 0 && missingRequiredPhrases.length === 0 && unsafeMarkersFound.length === 0;
  const summary = {
    status: passed ? "passed" : "failed",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    blueprintPath: absoluteBlueprintPath,
    roadmapPath: absoluteRoadmapPath,
    requiredPhrasesChecked: requiredBlueprintPhrases.length,
    missingRequiredPhrases,
    unsafeMarkersFound,
    errors,
    warnings,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (!passed) {
    logger.error("Watchdog HQ Master Blueprint Lock validation failed", summary);
    process.exitCode = 1;
  }
}

async function readRequiredText(path: string, errors: string[]): Promise<string> {
  const absolutePath = fromRoot(path);
  if (!existsSync(absolutePath)) {
    errors.push(`Missing required file: ${absolutePath}.`);
    return "";
  }
  return readFile(absolutePath, "utf8");
}

if (isDirectRun(import.meta.url)) {
  validateWatchdogHqBlueprintLock().catch((error) => {
    logger.error("Watchdog HQ Master Blueprint Lock validation crashed", { error });
    process.exitCode = 1;
  });
}

