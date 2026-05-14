# Watchdog HQ Build Roadmap Status

This roadmap status file pairs with `docs/WATCHDOG_HQ_MASTER_BLUEPRINT.md`. Future AI/Codex work must read both files before proposing or building new phases.

## Status Summary

The Watchdog HQ base structure through the Content Operations Command Centre is built/merged in summary form. Build #51 is the current Content QA & Brand Voice Manager build. Before further specialist-agent expansion, Build #52A, #52B, and #52C now lock foundations, the Hive operating model, and the page/template library in the correct order. Build #52 onward must follow the Master Blueprint Lock unless Danny changes the roadmap.

| Build number | Build name | Status | Purpose | Main files/scripts | Safety notes | Date/PR placeholder |
|---|---|---|---|---|---|---|
| Phase 1 | Base cw-content-brain toolkit | built/merged | Standalone content operations foundation. | `scripts/`, `src/lib/`, schemas/prompts/workflow docs | Report-only, no live writes. | Earlier PRs |
| Phase 1A-1C | Sitemap/crawler/snapshot/export helper | built/merged | Discover URLs and analyse local snapshots/export helpers. | crawl, snapshot, export scripts | Export helper is owner-run/read-only; no Supabase writes. | Earlier PRs |
| Phase 1D | Confidence and priority queue | built/merged | Triage findings and prioritise possible fixes. | confidence and queue reports | Findings are possible issues, not automatic fixes. | Earlier PRs |
| Phase 1E | Rendered verifier | built/merged | Reduce false positives against rendered pages. | `scripts/verify_rendered_pages.ts` | Optional, read-only, no live edits. | Earlier PRs |
| Phase 2A | Metadata engine | built/merged | Draft metadata suggestions. | `content:metadata` | Draft-only, needs review. | Earlier PRs |
| Phase 2B | Internal link brain | built/merged | Suggest natural internal link opportunities. | `content:internal-links` | Draft-only, no live link insertion. | Earlier PRs |
| Phase 2C-2D | Affiliate vault / offer tracker | built/merged | Plan affiliate placements and track stale/expired offers. | `content:affiliates`, `content:offers` | No affiliate URL insertion; disclosure-first. | Earlier PRs |
| Phase 2E-2F | GSC/GA4 import connectors | built/merged | Import local analytics/search exports. | `content:gsc`, `content:ga4` | Local import only, no Google writes. | Earlier PRs |
| Phase 2G | SEO Intelligence | built/merged | Combine local SEO/content/analytics signals. | `content:seo-brain` | Report-only action queue. | Earlier PRs |
| Phase 2H | Research duplicate guard | built/merged | Check ideas against local content and risk wording. | `content:research-guard` | No live web verification in v1. | Earlier PRs |
| Phase 2I | Agent Registry | built/merged | Define initial Watchdog HQ workforce hierarchy. | `content:agents` | Registry only, no execution. | Earlier PRs |
| Phase 2J | Master Command Queue | built/merged | Daily command queue foundation. | `content:master-queue` | No approved/applied states. | Earlier PRs |
| Phase 2K | Fix Draft Generator | built/merged | Prepare local draft-only fix suggestions. | `content:fix-drafts` | No final publishable content or update payloads. | Earlier PRs |
| Phase 2L | Preview Diff Engine | built/merged | Simulated preview-only diff proposals. | `content:preview-diffs` | No patch files or live edits. | Earlier PRs |
| Phase 2M | Approval Queue planning | built/merged | Human decision planning queue. | `content:approvals` | Does not grant approval. | Earlier PRs |
| Phase 2N | Master AI Manager Daily Brief | built/merged | Plain-English daily brief. | `content:daily-brief` | Cautious language, report-only. | Earlier PRs |
| Phase 2O | QC v1 | built/merged | First QC manager report. | `content:qc` | Gatekeeper layer, no execution. | Earlier PRs |
| Phase 2P | Manager Escalation Router | built/merged | Manager-to-manager routing. | `content:manager-escalations` | Routing recommendations only. | Earlier PRs |
| Phase 2Q | Daily Run Orchestrator | built/merged | Run safe daily reports in order. | `content:daily-run` | Excludes live crawlers/export/connectors. | Earlier PRs |
| Phase 2R | Daily Report Pack | built/merged | Danny-ready daily report pack. | `content:daily-pack` | Summaries only, no approvals. | Earlier PRs |
| Phase 2S | Dashboard Data Export | built/merged | Local dashboard JSON export. | `content:dashboard-export` | Local dashboard data only. | Earlier PRs |
| Phase 2T | Dashboard Contract Validator | built/merged | Validate dashboard JSON contracts. | `content:dashboard-validate` | Fails unsafe states/URLs. | Earlier PRs |
| Phase 2U | Department Roadmap / Coverage Map | built/merged | Plan department and agent coverage. | `content:department-roadmap` | Planning-only. | Earlier PRs |
| Phase 2V | Local Dashboard Shell | built/merged | Static local dashboard viewer. | `dashboard:build`, `dashboard:validate` | Local-only HTML, no live app files. | Earlier PRs |
| Phase 2W | Dashboard Launcher / Smoke Test | built/merged | Open/smoke test local dashboard. | `dashboard:open`, `dashboard:smoke` | No server required, local-only. | Earlier PRs |
| Phase 2X | Dashboard UI Contract Guard | built/merged | Validate dashboard shell text/UI contract. | `dashboard:ui-guard` | Text/HTML validation only. | Earlier PRs |
| Source Watchlist v1 | Source watchlist planning | built/merged | Define future monitored source model. | `content:source-watchlist` | No live crawling/fetching. | Earlier PRs |
| Agent Output Contract v1 | Agent output lifecycle contract | built/merged | Require detected/suspected/verified/recommended separation. | `content:agent-output-contract` | approved/applied blocked. | Earlier PRs |
| Department Router v1 | Department inbox/task router | built/merged | Route future findings to managers. | `content:department-router` | Managers cannot approve/apply. | Earlier PRs |
| Human Decision Log v1 | Audit trail planning | built/merged | Define future audit entry schema. | `content:decision-log` | No live audit database. | Earlier PRs |
| Base HQ Runbook v1 | Operating manual | built/merged | Document base structure and future rules. | `content:base-runbook` | Planning/report-only. | Earlier PRs |
| Page Quality Profiler v1 | Page quality triage | built/merged | Detect weak/thin pages using local data. | `content:page-quality` | No live content edits. | Earlier PRs |
| Page Blueprint Agent v1 | Page structure planning | built/merged | Recommend page blueprints. | `content:page-blueprints` | Structure only. | Earlier PRs |
| Content Cluster Agent v1 | Related sections planning | built/merged | Plan related reviews/guides/warnings/links. | `content:clusters` | No link insertion. | PR #45 |
| Media + Video Brief Agent v1 | Media planning | built/merged | Plan screenshots/proof/images/video briefs. | `content:media-briefs` | No media generation/download/upload. | PR #46 |
| Agent Capability Registry v2 | Workforce capability map | built/merged | Map agents, departments, endpoints, maturity. | `content:agent-capabilities` | No AI/API calls. | PR #47 |
| QC Department v2 | Gatekeeper Grace expansion | built/merged | Define major QC checks before Danny. | `content:qc-v2` | Blocks unsafe recommendations. | PR #48 |
| Build #49 | Watchdog HQ Master Blueprint Lock v1 | built/merged | Lock canonical vision, safety rules, and roadmap. | `docs/WATCHDOG_HQ_MASTER_BLUEPRINT.md`, `docs/WATCHDOG_HQ_BUILD_ROADMAP_STATUS.md`, `content:blueprint-lock-validate` | Documentation + validation only. | PR #49 |
| Build #50 | Content Operations Command Centre v1 | built/merged | Create content operations planning command centre. | `content:ops-command`, `content:ops-command-validate`, `src/content-operations-command-centre-builder.ts`, `src/content-operations-command-centre-validator.ts` | READ_ONLY_REPORT_ONLY; no live edits, publishing, Supabase writes, API calls, media generation, or apply workflow. | PR #50 |
| Build #51 | Content QA & Brand Voice Manager v1 | built | Add tone, structure, formatting, and brand voice QA. | `content:qa-brand`, `content:qa-brand-validate`, `src/content-qa-brand-voice-manager-builder.ts`, `src/content-qa-brand-voice-manager-validator.ts` | READ_ONLY_REPORT_ONLY; no live edits, publishing, Supabase writes, affiliate insertion, API calls, media generation, trust rating changes, or final legal/policy wording. | This build |
| Build #52A | Watchdog HQ Multi-Agent Foundations Readiness Audit v1 | built | Audit whether new agents can be added without inventing new rules. | cw-content-brain/docs/WATCHDOG_HQ_FOUNDATIONS_READINESS_AUDIT.md | Documentation/control audit only; READ_ONLY_REPORT_ONLY; no live edits, publishing, Supabase writes, AI/API calls, media generation, trust rating changes, or Safe Apply. | This build |
| Build #52B | Watchdog HQ Hive Operating Model v1 | built | Lock the 4-layer Hive model, departments, managers, routing rules, ownership rules, status paths, and escalation model. | cw-content-brain/docs/WATCHDOG_HQ_HIVE_OPERATING_MODEL.md | Operating model only; do not build the 120+ specialist Hive all at once. | This build |
| Build #52C | CryptoWatchdog Page Template & Themed Hub Library v1 | built / ready for review | Create locked templates for reviews, themed hubs, guides, warnings, comparisons, promos, blog/news posts, trusted brand boxes, review cards, related sections, media placement, SEO, affiliate disclosure, QA/QC, and Danny approval rules. | TBD | Template/control library only; no live edits, publishing, affiliate insertion, media generation, or trust rating changes. | Planned |
| Build #53 | Review Evidence Intake Contract v1 | built / ready for review | Define Danny evidence intake format for reviews. | TBD | Evidence placeholders allowed; fake claims blocked. | Planned |
| Build #54 | Review Article Assembly Contract v1 | built / ready for review | Define how evidence becomes review draft structure. | TBD | No final claims without evidence. | Planned |
| Build #55 | Review Draft Safety Harness v1 | built / ready for review | Guard review drafts before rebuild work expands. | TBD | QC and Danny review required for high-risk content. | Planned |
| Build #56 | Review Rebuild Agent v1 | built / ready for review | Future report-only rebuild agent using Danny-added evidence. | TBD | No publish/apply; evidence-led only. | Planned |

## Future Roadmap

| Build #57 | Review Rebuild Report Schema v1 | built / ready for review | Define local report schema and validation contract for Rewrite Rita outputs. |
| Build #58 | Review Rebuild Report Validator v1 | built / ready for review | Define validator contract for checking Rewrite Rita rebuild reports against Build 57 schema. |
| Build #59 | Agent Registry and Capability Registry v1 | built / ready for review | Define registered agents, departments, capabilities, permissions, delegated approvals, blocked actions, and escalation routes. |
| Build #60 | Workflow State Machine and Handoff Contract v1 | built / ready for review | Define controlled task statuses, handoffs, manager routing, QA routing, Danny review routing, rejection loops, and report-only lifecycle movement. | `docs:workflow-state-machine` | Must remain READ_ONLY_REPORT_ONLY. |
| Build #61 | Audit Trail and Event Log Contract v1 | built / ready for review | Define audit/event logging contract for workflow state changes, handoffs, validations, QA decisions, The Gaffer decisions, and Danny decisions. |Future roadmap items remain planned until Danny explicitly authorises them:
| Build #62 | Rollback and Incident Control Contract v1 | built / ready for review | Define controlled rollback, incident, blocked-action, governance-failure, and recovery rules. | cw-content-brain/docs/WATCHDOG_HQ_ROLLBACK_INCIDENT_CONTROL_CONTRACT.md |

- stronger content operations dashboard
- review factory
- evidence library
- SEO growth engine
- affiliate intelligence
- source monitoring
- social/media distribution
- backlink intelligence
- analytics intelligence
- controlled approvals
- Safe Apply Engine only much later

## Build #52A — Watchdog HQ Multi-Agent Foundations Readiness Audit v1

Status: built

Purpose:
Audit whether Watchdog HQ has the reusable foundations needed to plug in future agents without inventing new rules.

Formal readiness question:
**Can a new agent be added without inventing new rules?**

This build must verify or define the minimum shared foundations: agent identity, permission model, state machine, shared schemas, knowledge architecture, observability, rollback and incident control, and human approval and escalation rules.

It must also verify or define the required control artifacts or equivalents: root `AGENTS.md`, agent registry, capability registry, shared schemas, workflow/state map, knowledge map, logging/tracing spec, incident and rollback playbook, and test/evaluation harness.

## Build #52B — Watchdog HQ Hive Operating Model v1

Status: planned after #52A

Purpose:
Lock the future 4-layer Hive model without building the full specialist army immediately.

The model is:
1. Owner Layer
2. Executive AI Layer
3. Department Manager Layer
4. Specialist Worker Layer

This build must define the target departments, ownership rules, routing rules, allowed handoffs, rejection loops, escalation paths, governance gates, and human override rules.

## Build #52C — CryptoWatchdog Page Template & Themed Hub Library v1

Status: planned

Purpose:
Create the locked page/template architecture library that future AI agents must follow for reviews, themed hub pages, guides, warnings, comparisons, promos, news/blog posts and related content sections.

This build must define themed hub pages, trusted brand boxes, review cards, comparison tables, related blog sections, related guide sections, internal link rules, external/source link rules, media placement notes, affiliate disclosure rules, CryptoWatchdog final word rules, human/witty brand voice rules and serious-content exception rules.



## Build #52C completion note

Status: built / ready for review. Locked output: cw-content-brain/docs/WATCHDOG_HQ_PAGE_TEMPLATE_THEMED_HUB_LIBRARY.md. Next planned build: Build #53 — Review Evidence Intake Contract v1.



## Build #53 completion note

Status: built / ready for review. Locked output: cw-content-brain/docs/WATCHDOG_HQ_REVIEW_EVIDENCE_INTAKE_CONTRACT.md.

Build 53 defines the review evidence intake contract, including screenshots, deposit notes, withdrawal notes, support notes, regulation/licensing notes, public complaint patterns, source links, proof gaps, confidence levels, sensitivity levels, usage rules, escalation triggers, Danny approval fields, and the temporary access rule that sensitive evidence remains restricted until the later permissions/capability build.

Next planned build: Build #54 — Review Article Assembly Contract v1.

## Build #54 completion note

Status: built / ready for review. Locked output: cw-content-brain/docs/WATCHDOG_HQ_REVIEW_ARTICLE_ASSEMBLY_CONTRACT.md.

Build 54 defines how approved evidence becomes structured review draft packages using the Build 52C page/template library and Build 53 evidence intake contract.

It locks template selection, evidence gates, section assembly rules, claim-strength limits, safe wording, blocked wording, proof-gap handling, trust-status handling, affiliate handling, related content handling, QA handoff, Danny approval handoff, and draft package output rules.

Next planned build: Build #55 — Review Draft Safety Harness v1.

## Build #55 completion note

Status: built / ready for review. Locked output: cw-content-brain/docs/WATCHDOG_HQ_REVIEW_DRAFT_SAFETY_HARNESS.md.

Build 55 defines the validation layer for assembled review draft packages before future Review Rebuild Agent work expands.

It locks the harness input/output objects, verdicts, allowed next states, validation checks, severity values, safety issue object, blocking issue rules, warning issue rules, detailed check definitions, pass rules, rejection rules, rejection loops, safe harness outputs, QA handoff, Danny handoff, and Build 56 handoff.

Next planned build: Build #56 — Review Rebuild Agent v1.

## Build #56 completion note

Status: built / ready for review. Locked output: cw-content-brain/docs/WATCHDOG_HQ_REVIEW_REBUILD_AGENT.md.

Build 56 defines Rewrite Rita, the first report-only Review Rebuild Agent v1.

Rewrite Rita uses the Build 52C page/template library, Build 53 evidence intake contract, Build 54 article assembly contract, and Build 55 draft safety harness. It may prepare local/report-only rebuild reports only.

It locks agent identity, required inputs, allowed harness verdicts, rebuild output object, section rebuild object, rewrite rules, blocked actions, report-only output principle, detailed rewrite behaviour, output folder rules, QA routing, Danny routing, failure routing, serious-content handling, affiliate handling, trust-status handling, proof-gap handling, claim handling, rebuild report acceptance criteria, future implementation constraints, and Build 57 handoff.

Next planned build: Build #57 — Review Rebuild Report Schema v1.

## Build #57 completion note

Status: built / ready for review. Locked output: cw-content-brain/docs/WATCHDOG_HQ_REVIEW_REBUILD_REPORT_SCHEMA.md.

Build 57 defines the local/report-only schema that future Rewrite Rita rebuild reports must follow.

The schema supports existing weak page rebuilds and new draft review rebuilds. In both cases, the output remains a local/report-only rebuild report, not a live article edit.

It locks required top-level fields, source documents, input status, harness status, rebuild status values, rebuilt section fields, claim strength values, evidence usage summary, proof-gap summary, escalation summary, blocked claims removed, cautious wording used, affiliate disclosure status, trust-status handling, serious-content handling, QA handoff, Danny review queue, recommended next actions, blocked action confirmations, validation status, and existing/new content handling.

Next planned build: Build #58 — Review Rebuild Report Validator v1.

## Build #58 completion note

Status: built / ready for review. Locked output: cw-content-brain/docs/WATCHDOG_HQ_REVIEW_REBUILD_REPORT_VALIDATOR.md.

Build 58 defines the validation contract that future Rewrite Rita rebuild reports must pass before moving to QA or Danny review.

It locks validator inputs, validator output object, allowed verdicts, passing rules, warning rules, rejection rules, routing rules, blocked action checks, schema checks, safety checks, evidence checks, harness checks, section checks, affiliate checks, trust-status checks, serious-content checks, QA handoff checks, Danny review checks, issue severity rules, validation report naming, routing outputs, and acceptance criteria.

It also confirms the future operating model: routine non-critical issues route through the AI management layer and department leads, while Danny receives CEO-level exceptions and critical approvals.

Next planned build: Build #59 — Agent Registry and Capability Registry v1.

## Build #59 completion note

Status: built / ready for review. Locked output: cw-content-brain/docs/WATCHDOG_HQ_AGENT_REGISTRY_CAPABILITY_REGISTRY.md.

Build 59 consolidates the older Agent Registry and Agent Capability Registry v2 history into the current Watchdog HQ foundation model. It defines registered agents, departments, manager ownership, capability boundaries, globally blocked capabilities, delegated AI approvals, Danny-only approvals, routine vs critical decisions, escalation routes, connector boundaries, marketing/outreach boundaries, and registry update rules.

Build 59 confirms that Danny should receive CEO-level exceptions and critical approvals, not every operational task. Routine non-critical issues should move through department managers, The Gaffer, and QA before reaching Danny.

Build 59 remains READ_ONLY_REPORT_ONLY. It does not enable live publishing, Supabase writes, affiliate insertion, trust-rating edits, AI/API calls, Search Console actions, Analytics actions, Semrush actions, Gmail sending, media generation, live outreach, live crawling, or Safe Apply.

Next planned build: Build #60 — Workflow State Machine and Handoff Contract v1.


## Build #60 completion note

Status: built / ready for review. Locked output: cw-content-brain/docs/WATCHDOG_HQ_WORKFLOW_STATE_MACHINE_HANDOFF_CONTRACT.md.

Build 60 defines the Watchdog HQ workflow state machine and handoff contract.

It locks task states, allowed transitions, department handoff routes, manager acceptance rules, agent completion rules, validator completion rules, QA pass rules, Danny review queue rules, handoff rejection reasons, audit trail event schema, duplicate work protection, local/report-only output paths, CEO-level approval filtering, future data connector routing, and marketing/affiliate outreach routing.

Build 60 keeps Watchdog HQ in READ_ONLY_REPORT_ONLY mode. It does not enable live publishing, Supabase writes, website edits, affiliate insertion, email sending, external submissions, rating changes, or Safe Apply.

Next planned build: Build #62 — Rollback and Incident Control Contract v1.


## Build #61 completion note

Status: built / ready for review. Locked output: cw-content-brain/docs/WATCHDOG_HQ_AUDIT_TRAIL_EVENT_LOG_CONTRACT.md.

Build 61 defines the audit trail and event log contract for Watchdog HQ. It locks audit_event structure, event types, trace_id rules, workflow_id rules, workflow_status_before and workflow_status_after rules, actor and actor_type rules, permission_check, safety_check, approval_status, source_agent and target_agent handoff tracking, rejection_reason, escalation_reason, blocked_action, rollback_reference, Danny review recording, PR audit events, blueprint_updated, roadmap_updated, and validator failure events.

Build 61 remains READ_ONLY_REPORT_ONLY. It does not create a live logger, database writer, Supabase integration, website editor, publishing workflow, affiliate inserter, trust-rating editor, AI/API caller, live crawler, or approval/apply workflow.

Next planned build: Build #62 — Rollback and Incident Control Contract v1.

## Build #62 completion note

Status: built / ready for review. Locked output: cw-content-brain/docs/WATCHDOG_HQ_ROLLBACK_INCIDENT_CONTROL_CONTRACT.md.

Build 62 defines the rollback and incident control contract for Watchdog HQ. It locks incident_opened, incident_type, severity, containment_action, rollback_requested, rollback_required, rollback_completed, blocked_action_detected, validation_failed, validator_failed, state_before, state_after, rollback_from_state, rollback_to_state, incident_closed, repeated_failure_loop, override_requested, blueprint_drift, roadmap_drift, and incident routing rules.

Build 62 completes the first foundation-control contract set: agent identity, capability boundaries, workflow states, controlled handoffs, audit events, rollback rules, incident handling, safety locks, escalation paths, Danny approval protection, and Gatekeeper Grace governance.

Current mode remains READ_ONLY_REPORT_ONLY. Build 62 does not create live scripts, publish, write to Supabase, edit website content, insert affiliate links, change trust ratings, perform live rollback automation, or create an approval/apply workflow.

Next planned checkpoint: Foundation Module Completion Review — confirm the foundation-control layer is ready before starting the next agent/workforce build.


## Foundation Closure Safety Lock — Build 62A

Build 62A closes the foundation-control safety wording gap by explicitly confirming that READ_ONLY_REPORT_ONLY blocks all live site edits.

The following remain blocked:

- no live publishing
- no live site edits
- no Supabase writes
- no affiliate insertion
- no trust-rating edits
- no approval/apply workflow
- no real content publishing
- no deleting/changing production data
- no AI/API calls unless explicitly approved in a future controlled build

This confirms the foundation-control module is ready for formal completion review before the next workforce/agent build is selected.

