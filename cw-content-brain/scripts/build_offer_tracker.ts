import { isDirectRun, readJson, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { SnapshotTableName } from "../src/lib/types.js";

type AffiliateStatus = "active" | "paused" | "expired" | "blocked" | "needs_review";
type OfferClassification = "current" | "expires_soon" | "expired" | "stale_check" | "paused" | "blocked" | "needs_review";
type OfferUseStatus = "safe_to_use" | "needs_review" | "blocked";
type RecommendedAction = "renew_offer" | "verify_terms" | "pause_placements" | "remove_expired_cta" | "update_disclosure" | "human_review_required";

interface AffiliateVaultConfig {
  readOnly: boolean;
  writeBackToSupabase: boolean;
  records: AffiliateVaultRecord[];
}

interface AffiliateVaultRecord {
  brandName: string;
  category: string;
  affiliateUrl: string;
  cleanDisplayUrl: string;
  network: string;
  commissionType: string;
  countriesAllowed: string[];
  approvedPageTypes: SnapshotTableName[];
  blockedPageTypes: SnapshotTableName[];
  allowedRiskRatings: string[];
  disclosureRequired: boolean;
  disclosureText: string;
  offerText: string;
  offerExpiryDate?: string;
  lastCheckedDate?: string;
  status: AffiliateStatus;
  notes?: string;
}

interface OfferTrackerItem {
  draft_only: true;
  needs_human_review: true;
  brandName: string;
  category: string;
  cleanDisplayUrl: string;
  network: string;
  commissionType: string;
  countriesAllowed: string[];
  approvedPageTypes: SnapshotTableName[];
  blockedPageTypes: SnapshotTableName[];
  allowedRiskRatings: string[];
  disclosureRequired: boolean;
  disclosureTextPresent: boolean;
  offerTextPresent: boolean;
  offerExpiryDate?: string;
  lastCheckedDate?: string;
  sourceStatus: AffiliateStatus;
  classification: OfferClassification;
  useStatus: OfferUseStatus;
  recommendedActions: RecommendedAction[];
  notes: string[];
}

const outputJson = "data/reports/offer_tracker_report.json";
const outputMd = "data/reports/offer_tracker_report.md";
const vaultPath = "config/affiliate_vault.json";
const exampleVaultPath = "config/affiliate_vault.example.json";
const staleAfterDays = 90;
const expiringSoonDays = 30;

export async function buildOfferTracker(): Promise<OfferTrackerItem[]> {
  const vault = await loadVault();
  const items = vault.records.map(classifyRecord);

  await writeJson(outputJson, {
    generatedAt: new Date().toISOString(),
    disclaimer: "Draft-only offer/deal tracker for human review. This report does not expose raw affiliate URLs, edit pages, publish content, write to Supabase, or verify live offers.",
    draft_only: true,
    needs_human_review: true,
    affiliateRecordCount: vault.records.length,
    safeToUseCount: items.filter((item) => item.useStatus === "safe_to_use").length,
    needsReviewCount: items.filter((item) => item.useStatus === "needs_review").length,
    blockedCount: items.filter((item) => item.useStatus === "blocked").length,
    safeToUse: items.filter((item) => item.useStatus === "safe_to_use"),
    needsReview: items.filter((item) => item.useStatus === "needs_review"),
    blocked: items.filter((item) => item.useStatus === "blocked"),
    items,
  });
  await writeText(outputMd, renderMarkdown(items));
  logger.info("Offer tracker report written", { items: items.length, outputJson, outputMd });
  return items;
}

async function loadVault(): Promise<AffiliateVaultConfig> {
  let vault: AffiliateVaultConfig;
  try {
    vault = await readJson<AffiliateVaultConfig>(vaultPath);
  } catch {
    vault = await readJson<AffiliateVaultConfig>(exampleVaultPath);
  }

  if (!vault.readOnly || vault.writeBackToSupabase) {
    throw new Error("Affiliate vault must remain read-only with writeBackToSupabase disabled");
  }

  return vault;
}

function classifyRecord(record: AffiliateVaultRecord): OfferTrackerItem {
  const classification = classificationFor(record);
  const actions = actionsFor(record, classification);
  const notes = notesFor(record, classification);

  return {
    draft_only: true,
    needs_human_review: true,
    brandName: record.brandName,
    category: record.category,
    cleanDisplayUrl: record.cleanDisplayUrl,
    network: record.network,
    commissionType: record.commissionType,
    countriesAllowed: record.countriesAllowed,
    approvedPageTypes: record.approvedPageTypes,
    blockedPageTypes: record.blockedPageTypes,
    allowedRiskRatings: record.allowedRiskRatings,
    disclosureRequired: record.disclosureRequired,
    disclosureTextPresent: Boolean(record.disclosureText?.trim()),
    offerTextPresent: Boolean(record.offerText?.trim()),
    offerExpiryDate: record.offerExpiryDate,
    lastCheckedDate: record.lastCheckedDate,
    sourceStatus: record.status,
    classification,
    useStatus: useStatusFor(classification),
    recommendedActions: actions,
    notes,
  };
}

function classificationFor(record: AffiliateVaultRecord): OfferClassification {
  if (record.status === "blocked") return "blocked";
  if (record.status === "paused") return "paused";
  if (record.status === "expired") return "expired";
  if (record.status === "needs_review") return "needs_review";
  if (!record.offerExpiryDate || !record.lastCheckedDate) return "needs_review";

  const today = startOfToday(new Date());
  const expiry = dateOnly(record.offerExpiryDate);
  const lastChecked = dateOnly(record.lastCheckedDate);
  if (!expiry || !lastChecked) return "needs_review";
  if (expiry.getTime() < today.getTime()) return "expired";

  const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
  const daysSinceCheck = Math.floor((today.getTime() - lastChecked.getTime()) / 86400000);
  if (daysSinceCheck > staleAfterDays) return "stale_check";
  if (daysToExpiry <= expiringSoonDays) return "expires_soon";
  return "current";
}

function useStatusFor(classification: OfferClassification): OfferUseStatus {
  if (classification === "current") return "safe_to_use";
  if (classification === "blocked" || classification === "expired") return "blocked";
  return "needs_review";
}

function actionsFor(record: AffiliateVaultRecord, classification: OfferClassification): RecommendedAction[] {
  const actions = new Set<RecommendedAction>();

  if (classification === "expired") {
    actions.add("remove_expired_cta");
    actions.add("renew_offer");
    actions.add("pause_placements");
  }
  if (classification === "expires_soon") {
    actions.add("renew_offer");
    actions.add("verify_terms");
  }
  if (classification === "stale_check") {
    actions.add("verify_terms");
  }
  if (classification === "paused" || classification === "blocked") {
    actions.add("pause_placements");
  }
  if (classification === "needs_review") {
    actions.add("human_review_required");
    actions.add("verify_terms");
  }
  if (record.disclosureRequired && !record.disclosureText.trim()) {
    actions.add("update_disclosure");
  }
  if (!record.offerText.trim()) {
    actions.add("verify_terms");
  }
  if (actions.size === 0) {
    actions.add("verify_terms");
  }

  return Array.from(actions);
}

function notesFor(record: AffiliateVaultRecord, classification: OfferClassification): string[] {
  const notes = [
    `Classified as ${classification} from local vault dates and source status only.`,
    "Raw affiliate URLs are intentionally excluded from this report.",
  ];

  if (classification === "current") notes.push("Record appears safe to use only after human review confirms the live offer and disclosure.");
  if (classification === "expires_soon") notes.push(`Offer expires within ${expiringSoonDays} days and should be renewed or checked before more placements are suggested.`);
  if (classification === "stale_check") notes.push(`Last checked date is more than ${staleAfterDays} days old, so terms should be verified before use.`);
  if (classification === "expired") notes.push("Offer date has passed; remove or pause any CTA until a renewed offer is approved.");
  if (classification === "paused") notes.push("Vault status is paused; do not suggest new placements until the owner reactivates it.");
  if (classification === "blocked") notes.push("Vault status is blocked; do not use this offer.");
  if (classification === "needs_review") notes.push("Vault status, missing dates, invalid dates, or incomplete fields require human review before use.");
  if (record.disclosureRequired && !record.disclosureText.trim()) notes.push("Disclosure is required but no disclosure text is present.");
  if (!record.offerText.trim()) notes.push("Offer text is missing and should be verified before any CTA is drafted.");
  if (record.notes?.trim()) notes.push(`Vault notes: ${record.notes.trim()}`);

  return notes;
}

function dateOnly(value: string): Date | undefined {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function startOfToday(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function renderMarkdown(items: OfferTrackerItem[]): string {
  return `# Offer Tracker Report

Generated: ${new Date().toISOString()}

Draft-only offer/deal tracker for human review. This report does not expose raw affiliate URLs, edit pages, publish content, write to Supabase, or verify live offers.

## Summary

- Safe to use: ${items.filter((item) => item.useStatus === "safe_to_use").length}
- Needs review: ${items.filter((item) => item.useStatus === "needs_review").length}
- Blocked: ${items.filter((item) => item.useStatus === "blocked").length}

## Safe To Use

${renderGroup(items.filter((item) => item.useStatus === "safe_to_use"))}

## Needs Review

${renderGroup(items.filter((item) => item.useStatus === "needs_review"))}

## Blocked

${renderGroup(items.filter((item) => item.useStatus === "blocked"))}`;
}

function renderGroup(items: OfferTrackerItem[]): string {
  return items.length > 0 ? items.map(renderItem).join("\n") : "No records in this group.\n";
}

function renderItem(item: OfferTrackerItem): string {
  return `### ${item.brandName}

- Draft only: yes
- Needs human review: yes
- Category: ${item.category}
- Display URL: ${item.cleanDisplayUrl}
- Network: ${item.network}
- Commission type: ${item.commissionType}
- Classification: ${item.classification}
- Use status: ${item.useStatus}
- Offer expiry date: ${item.offerExpiryDate ?? "missing"}
- Last checked date: ${item.lastCheckedDate ?? "missing"}
- Recommended actions: ${item.recommendedActions.join(", ")}
- Notes: ${item.notes.join(" ")}
`;
}

if (isDirectRun(import.meta.url)) {
  await buildOfferTracker();
}
