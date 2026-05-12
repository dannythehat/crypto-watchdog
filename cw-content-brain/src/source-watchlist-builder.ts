import { isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

type EvidenceValue = "high" | "medium" | "low";
type RiskLevel = "low" | "medium" | "high";
type AllowedNow = "planning_only";

interface SourceCategory {
  id: string;
  name: string;
  description: string;
  sourceTypes: string[];
  responsibleDepartment: string;
  futureManager: string;
  defaultEvidenceValue: EvidenceValue;
  defaultRiskLevel: RiskLevel;
}

interface WatchlistItem {
  id: string;
  category: string;
  sourceType: string;
  exampleSourceName: string;
  purpose: string;
  evidenceValue: EvidenceValue;
  riskLevel: RiskLevel;
  futureCheckFrequency: string;
  responsibleDepartment: string;
  futureManager: string;
  futureWorkerAgent: string;
  allowedNow: AllowedNow;
  requiresHumanApproval: boolean;
  lifecycle: string[];
  notes: string;
}

const outputJson = "data/reports/source_watchlist_report.json";
const outputMd = "data/reports/source_watchlist_report.md";

const fullLifecycle = ["possible_signal", "suspected_issue", "verified_evidence", "recommended_action", "approved_action", "applied_action"];
const lifecycle = ["possible_signal", "suspected_issue", "verified_evidence", "recommended_action"];

const sourceCategories: SourceCategory[] = [
  {
    id: "official-company-sources",
    name: "Official company sources",
    description: "Owner-controlled or official public pages for crypto companies, products, support, status, and programme terms.",
    sourceTypes: ["official websites", "blog/news pages", "terms/privacy pages", "status pages", "support pages", "affiliate programme pages"],
    responsibleDepartment: "Research",
    futureManager: "Research AI Manager",
    defaultEvidenceValue: "high",
    defaultRiskLevel: "medium",
  },
  {
    id: "regulator-enforcement-sources",
    name: "Regulator and enforcement sources",
    description: "Public regulator, enforcement, consumer-protection, and standards-body notices that may affect reviews or warnings.",
    sourceTypes: ["FCA", "SEC", "CFTC", "FTC", "ESMA", "EBA", "IOSCO", "national financial regulators", "consumer protection agencies"],
    responsibleDepartment: "Trust & Safety",
    futureManager: "Trust & Safety AI Manager",
    defaultEvidenceValue: "high",
    defaultRiskLevel: "high",
  },
  {
    id: "app-store-reputation-sources",
    name: "App/store/reputation sources",
    description: "Public user-review and reputation surfaces that may show user experience patterns, complaints, or reputation shifts.",
    sourceTypes: ["Trustpilot", "Google Play", "Apple App Store", "Chrome Web Store", "Reddit/community threads", "X/Twitter public posts", "YouTube comments/reviews"],
    responsibleDepartment: "Research",
    futureManager: "Research AI Manager",
    defaultEvidenceValue: "medium",
    defaultRiskLevel: "high",
  },
  {
    id: "blockchain-evidence-sources",
    name: "Blockchain/evidence sources",
    description: "Public blockchain explorers and contract pages that can support wallet, token, or smart-contract evidence review.",
    sourceTypes: ["Etherscan", "BscScan", "Solscan", "Arbiscan", "wallet explorer evidence", "smart contract verification pages"],
    responsibleDepartment: "Evidence / Testing",
    futureManager: "Trust & Safety AI Manager",
    defaultEvidenceValue: "high",
    defaultRiskLevel: "high",
  },
  {
    id: "security-research-sources",
    name: "Security/research sources",
    description: "Security alerts, incident reports, abuse databases, and research feeds that may support evidence-led risk review.",
    sourceTypes: ["Chainabuse", "ScamSniffer", "CertiK alerts", "SlowMist", "PeckShield", "Immunefi reports", "security incident reports"],
    responsibleDepartment: "Trust & Safety",
    futureManager: "Trust & Safety AI Manager",
    defaultEvidenceValue: "high",
    defaultRiskLevel: "high",
  },
  {
    id: "seo-content-sources",
    name: "SEO/content sources",
    description: "Local or future search/content intelligence sources used for refresh, metadata, internal-link, and research planning.",
    sourceTypes: ["Google Search Console imports", "GA4 imports", "SERP topics", "competing review pages", "keyword gaps", "duplicate/cannibalisation checks"],
    responsibleDepartment: "SEO",
    futureManager: "SEO AI Manager",
    defaultEvidenceValue: "medium",
    defaultRiskLevel: "medium",
  },
  {
    id: "affiliate-commercial-sources",
    name: "Affiliate/commercial sources",
    description: "Public or owner-provided commercial programme information for offer freshness, commission, disclosure, and CTA review.",
    sourceTypes: ["affiliate dashboards", "public affiliate programme pages", "offer terms", "commission terms", "landing pages", "deal expiry pages"],
    responsibleDepartment: "Affiliates",
    futureManager: "Affiliates AI Manager",
    defaultEvidenceValue: "medium",
    defaultRiskLevel: "high",
  },
];

const watchlistItems: WatchlistItem[] = [
  item("official-platform-site", "official-company-sources", "official websites", "Official platform website", "Track future product, region, fee, or positioning changes that may trigger review refresh planning.", "high", "medium", "weekly", "Research", "Research AI Manager", "Source Watchlist Agent", true, "Official sources can support update planning, but page edits still need human review."),
  item("official-news-blog", "official-company-sources", "blog/news pages", "Official company blog/news page", "Spot future product updates, incident posts, feature launches, and policy changes for content refresh review.", "high", "medium", "weekly", "Content", "Content AI Manager", "Content Refresh Draft Agent", true, "Company announcements are useful signals, not automatic verification of safety or quality."),
  item("official-terms-policy", "official-company-sources", "terms/privacy pages", "Official terms or privacy page", "Identify future legal, fee, eligibility, privacy, or country-availability changes that may require cautious review updates.", "high", "high", "monthly", "Trust & Safety", "Trust & Safety AI Manager", "Risk Language Guard Agent", true, "Legal and policy interpretation must stay human-reviewed."),
  item("official-status-support", "official-company-sources", "status pages", "Official status or support page", "Watch for outage, withdrawal, account-access, and support pattern signals that may affect evidence checklists.", "medium", "medium", "weekly", "Operations", "Operations AI Manager", "Complaint Signal Agent", true, "Status signals need context before becoming content recommendations."),
  item("regulator-warning-notice", "regulator-enforcement-sources", "financial regulator notices", "Regulator warning or enforcement notice", "Plan future review when a public regulator notice may affect a company, wallet, token, or service.", "high", "high", "daily when enabled", "Trust & Safety", "Trust & Safety AI Manager", "Red Flag Evidence Agent", true, "No scam/fraud accusation or rating change can be generated without evidence review."),
  item("consumer-protection-notice", "regulator-enforcement-sources", "consumer protection agencies", "Consumer protection agency notice", "Surface future consumer-risk signals and complaint themes for evidence-led review.", "high", "high", "weekly", "Trust & Safety", "Trust & Safety AI Manager", "Reputation Risk Agent", true, "Consumer notices are sensitive and must be reviewed before publication decisions."),
  item("trustpilot-reputation", "app-store-reputation-sources", "Trustpilot", "Public review profile", "Detect future reputation shifts, complaint themes, or support issues that may justify research tasks.", "medium", "high", "weekly", "Research", "Research AI Manager", "Complaint Signal Agent", true, "User reviews are signals, not proof on their own."),
  item("mobile-app-store", "app-store-reputation-sources", "Google Play / Apple App Store", "Public mobile app listing", "Watch for app rating changes, update notes, availability changes, and recurring user complaints.", "medium", "medium", "weekly", "Analytics", "Analytics AI Manager", "Traffic Change Agent", true, "App-store comments need sampling and context before content use."),
  item("public-community-threads", "app-store-reputation-sources", "Reddit/community threads", "Public community discussion", "Spot repeated themes, emerging questions, or user confusion that may become research or content opportunities.", "low", "high", "weekly", "Research", "Research AI Manager", "Source Watchlist Agent", true, "Community claims are unverified until corroborated."),
  item("public-social-posts", "app-store-reputation-sources", "X/Twitter public posts", "Public social posts", "Detect future social-signal spikes or complaint clusters for manual research triage.", "low", "high", "daily when enabled", "Social", "Social AI Manager", "Social Monitoring Agent", true, "Public posts must not be treated as verified evidence without corroboration."),
  item("wallet-explorer-evidence", "blockchain-evidence-sources", "wallet explorer evidence", "Public wallet explorer page", "Support future evidence checklists for wallet movements, token contracts, or transaction patterns.", "high", "high", "manual only", "Evidence / Testing", "Trust & Safety AI Manager", "Red Flag Evidence Agent", true, "Explorer data requires expert context and must not create accusations automatically."),
  item("contract-verification", "blockchain-evidence-sources", "smart contract verification pages", "Smart contract verification page", "Flag future contract verification, proxy, ownership, or token metadata signals for manual research.", "high", "high", "manual only", "Evidence / Testing", "Trust & Safety AI Manager", "Claims Evidence Agent", true, "Contract signals are technical evidence inputs, not final conclusions."),
  item("abuse-report-database", "security-research-sources", "Chainabuse / abuse databases", "Public abuse report database", "Plan future review of abuse report patterns where evidence quality and corroboration can be checked.", "medium", "high", "weekly", "Trust & Safety", "Trust & Safety AI Manager", "Scam Pattern Watch Agent", true, "Abuse reports are allegations until reviewed and corroborated."),
  item("security-alert-feed", "security-research-sources", "security incident reports", "Public security incident report", "Detect future incidents that may require evidence checklists, content refresh, or risk-language review.", "high", "high", "daily when enabled", "Trust & Safety", "Trust & Safety AI Manager", "Risk Language Guard Agent", true, "Incident reports must be cited and reviewed before content changes."),
  item("local-gsc-imports", "seo-content-sources", "Google Search Console imports", "Local Search Console export", "Use local owner-provided exports to plan CTR, page 2, metadata, and content refresh opportunities.", "medium", "low", "after owner import", "SEO", "SEO AI Manager", "Keyword Gap Agent", false, "V1 already supports local imports; no live Google API connector is active."),
  item("local-ga4-imports", "seo-content-sources", "GA4 imports", "Local GA4 export", "Use local owner-provided exports to plan engagement, CTA, conversion, and refresh review.", "medium", "low", "after owner import", "Analytics", "Analytics AI Manager", "Page Performance Agent", false, "V1 already supports local imports; no live Google API connector is active."),
  item("serp-topic-research", "seo-content-sources", "SERP topics", "Search result topic patterns", "Plan future research into search intent, competitor coverage, keyword gaps, and content opportunities.", "medium", "medium", "manual only", "SEO", "SEO AI Manager", "Search Intent Agent", true, "No live SERP scraping is active in this phase."),
  item("affiliate-programme-page", "affiliate-commercial-sources", "public affiliate programme pages", "Public affiliate programme page", "Track future offer, commission, country, disclosure, and programme-status changes for review.", "medium", "high", "monthly", "Affiliates", "Affiliates AI Manager", "Offer Monitoring Agent", true, "Commercial changes require approval before CTA or disclosure updates."),
  item("offer-terms-expiry", "affiliate-commercial-sources", "offer terms / deal expiry pages", "Public offer terms page", "Detect future stale or expired offer signals for the offer tracker and affiliate placement review.", "medium", "high", "weekly", "Affiliates", "Affiliates AI Manager", "Deal Expiry Agent", true, "Expired/stale offer handling must not publish automatically."),
  item("landing-page-claims", "affiliate-commercial-sources", "landing pages", "Public commercial landing page", "Watch for future offer claims, pricing, restrictions, or guarantee wording that may affect safe CTA drafts.", "medium", "high", "monthly", "Affiliates", "Affiliates AI Manager", "Affiliate Safety Guard Agent", true, "Do not copy commercial claims without evidence and human review."),
];

const futureAgentRoutes = [
  { signalType: "company_update", from: "Source Watchlist Agent", to: "Content AI Manager", reason: "Official company changes may require review refresh planning.", approvalRequiredBeforeAction: true },
  { signalType: "regulator_or_enforcement_signal", from: "Source Watchlist Agent", to: "Trust & Safety AI Manager", reason: "Regulator signals are high-risk and need evidence review before content or rating changes.", approvalRequiredBeforeAction: true },
  { signalType: "affiliate_or_offer_change", from: "Source Watchlist Agent", to: "Affiliates AI Manager", reason: "Commercial changes may affect CTA, disclosure, or offer freshness planning.", approvalRequiredBeforeAction: true },
  { signalType: "seo_or_content_opportunity", from: "Source Watchlist Agent", to: "SEO AI Manager", reason: "Search and analytics signals should become draft-only metadata, internal-link, or refresh tasks.", approvalRequiredBeforeAction: false },
  { signalType: "unclear_or_sensitive_signal", from: "Department AI Manager", to: "Quality Control Manager", reason: "Weak evidence, sensitive claims, or mixed-source signals need QC before Danny sees them.", approvalRequiredBeforeAction: true },
];

const evidenceRules = [
  "A possible signal is not a verified fact.",
  "User reviews, public posts, and community threads require corroboration before any content claim.",
  "Regulator, legal, security, and blockchain evidence must be reviewed before trust/rating, scam/fraud, or warning language is drafted.",
  "Commercial and affiliate claims must be checked against approved owner records before CTA or disclosure work.",
  "Future connectors must keep Detected -> Suspected -> Verified -> Recommended -> Approved -> Applied stages separate.",
];

const escalationRules = [
  "High-risk regulator, enforcement, security, blockchain, legal, or scam/fraud signals route to Trust & Safety before Danny.",
  "Affiliate, deal, commission, and CTA signals route to Affiliates and may require Trust & Safety review.",
  "SEO/content opportunities route to SEO or Content for draft-only planning.",
  "Duplicate, cannibalisation, or weak-evidence signals route to Research and Quality Control.",
  "Only the Master AI Manager should escalate clean, important decisions to Danny.",
];

const blockedActions = [
  "No live crawling/fetching in Source Watchlist v1.",
  "No source monitoring is active yet.",
  "No publishing.",
  "No Supabase writes.",
  "No live website edits.",
  "No approval/apply workflow.",
  "No affiliate links inserted.",
  "No scam/fraud accusations generated.",
  "No trust rating changes.",
  "No legal conclusions.",
  "No user/company data collection.",
  "No credentials or secrets required.",
  "No approved or applied actions.",
];

const nextRecommendedBuilds = [
  "Add a local source-watchlist config file once Danny wants editable source definitions.",
  "Add manual CSV/JSON import support for owner-provided source notes before live connectors.",
  "Add source signal deduplication and confidence scoring.",
  "Add manager routing into the existing escalation router once source signals exist.",
  "Add live connectors only after Danny approves specific sources, frequency, and safety rules.",
];

export async function buildSourceWatchlist(): Promise<unknown> {
  const report = {
    generatedAt: new Date().toISOString(),
    phase: "Source Watchlist v1",
    name: "Source Watchlist Planning Report v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    disclaimer:
      "Planning/report-only source watchlist. No source monitoring is active, no live crawling/fetching happens, and no approved/applied actions exist in v1.",
    lifecycleModel: {
      principle: "Detected -> Suspected -> Verified -> Recommended -> Approved -> Applied",
      fullLifecycle,
      v1AllowedStages: lifecycle,
      v1BlockedStages: ["approved_action", "applied_action"],
      note: "The watchlist defines future signal handling only. It does not claim that any source has been checked.",
    },
    sourceCategories,
    watchlistItems,
    futureAgentRoutes,
    evidenceRules,
    escalationRules,
    blockedActions,
    nextRecommendedBuilds,
    safetyChecks: {
      reportOnly: true,
      planningOnly: true,
      noSourceMonitoringActive: true,
      noLiveCrawling: true,
      noLiveFetching: true,
      noSupabaseWrites: true,
      noPublishing: true,
      noLiveWebsiteEdits: true,
      noAffiliateLinksInserted: true,
      noScamFraudAccusations: true,
      noTrustRatingChanges: true,
      noLegalConclusions: true,
      noUserCompanyDataCollection: true,
      noSecretsRequired: true,
      humanApprovalBeforeFutureConnectors: true,
      humanApprovalBeforeRatingContentAffiliateLegalAction: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Source watchlist planning report written", {
    categories: sourceCategories.length,
    watchlistItems: watchlistItems.length,
    outputJson,
    outputMd,
  });
  return report;
}

function item(
  id: string,
  category: string,
  sourceType: string,
  exampleSourceName: string,
  purpose: string,
  evidenceValue: EvidenceValue,
  riskLevel: RiskLevel,
  futureCheckFrequency: string,
  responsibleDepartment: string,
  futureManager: string,
  futureWorkerAgent: string,
  requiresHumanApproval: boolean,
  notes: string,
): WatchlistItem {
  return {
    id,
    category,
    sourceType,
    exampleSourceName,
    purpose,
    evidenceValue,
    riskLevel,
    futureCheckFrequency,
    responsibleDepartment,
    futureManager,
    futureWorkerAgent,
    allowedNow: "planning_only",
    requiresHumanApproval,
    lifecycle,
    notes,
  };
}

function renderMarkdown(report: {
  generatedAt: string;
  sourceCategories: SourceCategory[];
  watchlistItems: WatchlistItem[];
  futureAgentRoutes: Array<{ signalType: string; from: string; to: string; reason: string; approvalRequiredBeforeAction: boolean }>;
  evidenceRules: string[];
  escalationRules: string[];
  blockedActions: string[];
  nextRecommendedBuilds: string[];
}): string {
  const categoryRows = report.sourceCategories
    .map((category) => `| ${category.name} | ${category.responsibleDepartment} | ${category.futureManager} | ${category.defaultEvidenceValue} | ${category.defaultRiskLevel} |`)
    .join("\n");
  const itemRows = report.watchlistItems
    .map((item) => `| ${item.exampleSourceName} | ${item.category} | ${item.evidenceValue} | ${item.riskLevel} | ${item.futureManager} | ${item.allowedNow} |`)
    .join("\n");
  const routeRows = report.futureAgentRoutes
    .map((route) => `| ${route.signalType} | ${route.from} | ${route.to} | ${route.approvalRequiredBeforeAction ? "yes" : "review"} |`)
    .join("\n");

  return `# Source Watchlist Planning Report v1

Generated: ${report.generatedAt}

Safety mode: READ_ONLY_REPORT_ONLY
canAutoApply: false
approvedCount: 0
appliedCount: 0

## Safety Summary

Source Watchlist v1 is planning/report-only. No source monitoring is active yet, no live crawling/fetching happens, no Supabase writes happen, no publishing happens, no live website edits happen, no affiliate links are inserted, no scam/fraud accusations are generated, no trust ratings change, and no credentials or secrets are required.

## Source Categories

| Category | Department | Future Manager | Evidence Value | Risk |
| --- | --- | --- | --- | --- |
${categoryRows}

## Watchlist Items

| Example Source | Category | Evidence Value | Risk | Future Manager | Allowed Now |
| --- | --- | --- | --- | --- | --- |
${itemRows}

## Future Agent Routes

| Signal | From | To | Approval Before Action |
| --- | --- | --- | --- |
${routeRows}

## Evidence Rules

${report.evidenceRules.map((rule) => `- ${rule}`).join("\n")}

## Escalation Rules

${report.escalationRules.map((rule) => `- ${rule}`).join("\n")}

## Blocked Actions

${report.blockedActions.map((action) => `- ${action}`).join("\n")}

## Next Recommended Builds

${report.nextRecommendedBuilds.map((build) => `- ${build}`).join("\n")}

## Human Approval

Human approval is required before any future live monitoring connector and before any rating, content, affiliate, legal, publishing, or live-site action. V1 produces no approved or applied actions.
`;
}

if (isDirectRun(import.meta.url)) {
  buildSourceWatchlist().catch((error) => {
    logger.error("Source watchlist planning report failed", { error });
    process.exitCode = 1;
  });
}
