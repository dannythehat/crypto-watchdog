import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

interface DashboardSource {
  id: string;
  label: string;
  file: string;
}

const outputHtml = "data/local-dashboard/index.html";

const dashboardSources: DashboardSource[] = [
  { id: "overview", label: "Overview", file: "data/dashboard/overview.json" },
  { id: "command", label: "Command", file: "data/dashboard/command.json" },
  { id: "approvals", label: "Approvals", file: "data/dashboard/approvals.json" },
  { id: "agents", label: "Agents", file: "data/dashboard/agents.json" },
  { id: "content", label: "Content", file: "data/dashboard/content.json" },
  { id: "seo", label: "SEO", file: "data/dashboard/seo.json" },
  { id: "affiliates", label: "Affiliates", file: "data/dashboard/affiliates.json" },
  { id: "research", label: "Research", file: "data/dashboard/research.json" },
  { id: "analytics", label: "Analytics", file: "data/dashboard/analytics.json" },
];

export async function buildLocalDashboardShell(): Promise<void> {
  const loaded = await loadDashboardData();
  const missing = dashboardSources.filter((source) => !loaded.has(source.id)).map((source) => source.file);
  if (missing.length > 0) {
    logger.error("Local dashboard shell build failed: missing dashboard data", { missing });
    process.exitCode = 1;
    return;
  }

  const html = renderDashboard(loaded);
  await writeText(outputHtml, html);
  logger.info("Local dashboard shell written", { outputHtml, sections: dashboardSources.length });
}

async function loadDashboardData(): Promise<Map<string, unknown>> {
  const loaded = new Map<string, unknown>();
  for (const source of dashboardSources) {
    const path = fromRoot(source.file);
    if (!existsSync(path)) continue;
    loaded.set(source.id, JSON.parse(await readFile(path, "utf8")) as unknown);
  }
  return loaded;
}

function renderDashboard(data: Map<string, unknown>): string {
  const overview = record(data.get("overview"));
  const statusCards = record(overview.statusCards);
  const safetyMode = text(overview.safetyMode, "READ_ONLY_REPORT_ONLY");
  const canAutoApply = valueAt(overview, "canAutoApply", false);
  const approvedCount = valueAt(overview, "approvedCount", 0);
  const appliedCount = valueAt(overview, "appliedCount", 0);
  const generatedAt = text(overview.generatedAt, new Date().toISOString());

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Watchdog HQ Local Dashboard</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #080b10;
      --panel: #111720;
      --panel-2: #161f2b;
      --line: #263445;
      --text: #edf3f8;
      --muted: #93a4b6;
      --accent: #7dd3fc;
      --good: #86efac;
      --warn: #facc15;
      --danger: #fb7185;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: radial-gradient(circle at top left, rgba(125, 211, 252, 0.12), transparent 28rem), var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0;
    }
    header {
      border-bottom: 1px solid var(--line);
      background: rgba(8, 11, 16, 0.94);
      position: sticky;
      top: 0;
      z-index: 10;
      backdrop-filter: blur(14px);
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
    }
    .brand h1 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 750;
    }
    .brand p {
      margin: 0.25rem 0 0;
      color: var(--muted);
      font-size: 0.9rem;
    }
    .status {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    .pill {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 0.45rem 0.7rem;
      background: var(--panel);
      color: var(--muted);
      font-size: 0.8rem;
      white-space: nowrap;
    }
    .pill strong { color: var(--text); }
    .safe {
      border-color: rgba(134, 239, 172, 0.45);
      color: var(--good);
    }
    .banner {
      margin: 0 1.25rem 1rem;
      border: 1px solid rgba(125, 211, 252, 0.45);
      background: rgba(125, 211, 252, 0.09);
      border-radius: 8px;
      padding: 0.8rem 1rem;
      color: #dff7ff;
      font-weight: 650;
    }
    main {
      display: grid;
      grid-template-columns: 15rem 1fr;
      min-height: calc(100vh - 7rem);
    }
    nav {
      border-right: 1px solid var(--line);
      padding: 1rem;
      background: rgba(12, 17, 24, 0.72);
    }
    nav a {
      display: block;
      color: var(--muted);
      text-decoration: none;
      border-radius: 6px;
      padding: 0.65rem 0.75rem;
      margin-bottom: 0.25rem;
      font-weight: 650;
    }
    nav a:hover { background: var(--panel-2); color: var(--text); }
    .content {
      padding: 1.25rem;
      display: grid;
      gap: 1rem;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: 0.8rem;
    }
    .card, section {
      border: 1px solid var(--line);
      background: rgba(17, 23, 32, 0.94);
      border-radius: 8px;
      box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
    }
    .card { padding: 1rem; }
    .card span {
      display: block;
      color: var(--muted);
      font-size: 0.82rem;
      margin-bottom: 0.35rem;
    }
    .card strong {
      font-size: 1.6rem;
    }
    section {
      padding: 1rem;
      scroll-margin-top: 7rem;
    }
    section h2 {
      margin: 0 0 0.35rem;
      font-size: 1.05rem;
    }
    section p {
      margin: 0 0 0.8rem;
      color: var(--muted);
      line-height: 1.5;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      gap: 0.75rem;
    }
    .mini {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 0.8rem;
      background: var(--panel-2);
      min-width: 0;
    }
    .mini b {
      display: block;
      margin-bottom: 0.3rem;
    }
    .mini small {
      color: var(--muted);
      overflow-wrap: anywhere;
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      color: #cbd5e1;
      font-size: 0.78rem;
      line-height: 1.45;
    }
    @media (max-width: 820px) {
      main { grid-template-columns: 1fr; }
      nav {
        position: sticky;
        top: 6.8rem;
        z-index: 5;
        border-right: 0;
        border-bottom: 1px solid var(--line);
        display: flex;
        overflow-x: auto;
        gap: 0.25rem;
      }
      nav a { white-space: nowrap; margin-bottom: 0; }
      .topbar { align-items: flex-start; flex-direction: column; }
      .status { justify-content: flex-start; }
    }
  </style>
</head>
<body>
  <header>
    <div class="topbar">
      <div class="brand">
        <h1>Watchdog HQ Local Dashboard</h1>
        <p>Content Brain viewer generated ${escapeHtml(generatedAt)}</p>
      </div>
      <div class="status" aria-label="Safety status">
        <span class="pill safe"><strong>${escapeHtml(safetyMode)}</strong></span>
        <span class="pill">canAutoApply <strong>${escapeHtml(String(canAutoApply))}</strong></span>
        <span class="pill">approvedCount <strong>${escapeHtml(String(approvedCount))}</strong></span>
        <span class="pill">appliedCount <strong>${escapeHtml(String(appliedCount))}</strong></span>
      </div>
    </div>
    <div class="banner">Local read-only dashboard. View-only Content Brain data. No live writes, no database writes, no approval workflow.</div>
  </header>
  <main>
    <nav aria-label="Dashboard sections">
      ${dashboardSources.map((source) => `<a href="#${source.id}">${escapeHtml(source.label)}</a>`).join("\n      ")}
    </nav>
    <div class="content">
      <div class="cards">
        ${statusCard("Safe Drafts Ready", statusCards.safeDraftsReady)}
        ${statusCard("Needs Danny Approval", statusCards.needsDannyApproval)}
        ${statusCard("Blocked Risky Items", statusCards.blockedRiskyItems)}
        ${statusCard("Monitor Only", statusCards.monitorOnly)}
        ${statusCard("Money Opportunities", statusCards.moneyOpportunities)}
        ${statusCard("QC Findings", statusCards.qcFindings)}
        ${statusCard("Escalation Items", statusCards.escalationItems)}
        ${statusCard("Daily Run Status", statusCards.dailyRunStatus)}
      </div>
      ${dashboardSources.map((source) => renderSection(source, data.get(source.id))).join("\n      ")}
    </div>
  </main>
</body>
</html>`;
}

function renderSection(source: DashboardSource, value: unknown): string {
  const item = record(value);
  const summary = summaryText(source.id, item);
  return `<section id="${source.id}">
        <h2>${escapeHtml(source.label)}</h2>
        <p>${escapeHtml(summary)}</p>
        <div class="grid">
          ${summaryCards(item)}
        </div>
      </section>`;
}

function summaryText(id: string, value: Record<string, unknown>): string {
  if (id === "overview") return text(value.headlineSummary, "High-level local dashboard status.");
  if (id === "command") return "Daily command queue, decision items, risk items, and recommended next blocks.";
  if (id === "approvals") return "Planning-only approval queue for Danny review. No real approvals are recorded here.";
  if (id === "agents") return text(value.hierarchy, "Agent hierarchy and manager routing summary.");
  if (id === "affiliates") return text(value.affiliateSafetyNote, "Affiliate review data for planning only.");
  return `${id[0]?.toUpperCase() ?? ""}${id.slice(1)} department data prepared for local review.`;
}

function summaryCards(value: Record<string, unknown>): string {
  const visibleKeys = Object.keys(value).filter((key) => !["generatedAt", "canAutoApply", "approvedCount", "appliedCount"].includes(key));
  return visibleKeys
    .slice(0, 8)
    .map((key) => {
      const raw = value[key];
      const display = typeof raw === "object" && raw !== null ? JSON.stringify(raw, null, 2).slice(0, 900) : String(raw ?? "");
      return `<div class="mini"><b>${escapeHtml(labelise(key))}</b><small><pre>${escapeHtml(display)}</pre></small></div>`;
    })
    .join("\n          ");
}

function statusCard(label: string, value: unknown): string {
  return `<div class="card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value ?? 0))}</strong></div>`;
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function valueAt(value: Record<string, unknown>, key: string, fallback: unknown): unknown {
  return typeof value[key] === "undefined" ? fallback : value[key];
}

function labelise(value: string): string {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

if (isDirectRun(import.meta.url)) {
  buildLocalDashboardShell().catch((error) => {
    logger.error("Local dashboard shell build failed", { error });
    process.exitCode = 1;
  });
}
