# Watchdog HQ Hive Operating Model v1

Build: #52B — Watchdog HQ Hive Operating Model v1
Status: draft for PR review
Safety mode: READ_ONLY_REPORT_ONLY
Safety boundaries: no live edits, no publishing, no Supabase writes, no Safe Apply.
Scope: operating model only

## Purpose

This document locks the Watchdog HQ Hive operating model before more specialist agents are added.

The goal is to stop drift, duplication, messy handoffs, and uncontrolled agent growth.

Build #52B does **not** build the full 120+ specialist army. It defines the structure, ownership rules, routing rules, status paths, and escalation model that future agents must follow.

## Core Rule

Every task must have:

- one owning department
- one owning manager
- one clear current status
- one allowed next route
- one evidence trail
- one escalation route
- one final human owner for high-risk decisions

No specialist worker may invent its own process.

## Four-Layer Hive Model

### Layer 1 — Human Owner

**Danny**

Danny is the final authority for:

- strategic direction
- exceptions
- high-risk brand decisions
- publishing-sensitive decisions
- rating changes
- affiliate-link decisions
- scam/fraud/legal wording
- future Safe Apply approval
- any override of failed governance gates

Danny should not receive every low-level task. The Hive must filter, route, and clean decisions before they reach him.

### Layer 2 — Executive AI Layer

The Executive AI layer manages cross-department direction and prevents chaos.

Core executive roles:

| Executive role | Purpose |
| --- | --- |
| Chief Orchestrator / The Gaffer | Owns the full HQ queue, cross-department priorities, and final AI recommendation before Danny. |
| Content Operations Director | Oversees page, article, review, guide, hub, and refresh work. |
| SEO Director | Oversees keyword, metadata, internal linking, indexation, and search-intent work. |
| Brand Governance Director | Oversees tone, trust, serious-content exceptions, claim safety, and brand consistency. |
| Distribution Director | Oversees future social, newsletter, outreach, and distribution planning. |
| Media Director | Oversees future image, video, proof visual, and media brief planning. |
| Analytics Director | Oversees performance signals, decay detection, refresh triggers, and reporting. |

Executive AI roles may coordinate departments, but they do not publish, apply, write to Supabase, insert affiliate links, change ratings, or bypass Danny.

### Layer 3 — Department Manager Layer

Department Managers own work queues and route tasks to specialist workers.

Manager rules:

- Every department has one accountable manager.
- Managers may assign or reject specialist work.
- Managers may request more evidence.
- Managers may route sideways to another manager where allowed.
- Managers may escalate to Quality Control, The Gaffer, or Danny.
- Managers must preserve lifecycle status and evidence gaps.
- Managers must not publish, apply, change ratings, insert affiliate links, or make final legal/scam/fraud claims.

### Layer 4 — Specialist Worker Layer

Specialist workers do narrow, bounded tasks.

Specialist rules:

- Specialists work only inside their department or assigned route.
- Specialists produce findings, drafts, outlines, briefs, recommendations, or reports.
- Specialists must use the Agent Output Contract.
- Specialists must include evidence gaps and confidence level.
- Specialists must not communicate freely across the Hive unless routed by a manager.
- Specialists must not approve, apply, publish, or make final high-risk decisions.

## Ten Master Departments / 10 master departments

| Department | Owner / Manager | Purpose |
| --- | --- | --- |
| Executive Orchestration | The Gaffer | Owns command queue, priorities, cross-team conflicts, and Danny-ready recommendations. |
| Content Operations | Blueprint Bella | Owns page structure, content refreshes, guides, reviews, hubs, and article quality planning. |
| Research & Intelligence | Inspector Proof | Owns source quality, evidence gaps, proof requirements, and claim support. |
| Editorial Strategy | Brand Governance Director / Rewrite Rita later | Owns tone, structure, positioning, article intent, and serious-content handling. |
| Content Production | Content Operations Director | Owns future draft production workflows once approved. |
| SEO | Rankhound | Owns search intent, metadata, keywords, internal linking strategy, and SEO checks. |
| Media | Pixel Pete | Owns image needs, video briefs, proof visuals, alt text, and media planning. |
| Social & Distribution | Social Sophie | Owns future social, distribution, outreach, and promotion planning. |
| QA & Governance | Gatekeeper Grace | Owns safety, evidence, claim risk, affiliate disclosure, rating risk, and governance gates. |
| Analytics & Lifecycle | Metric Molly | Owns performance signals, content decay, refresh triggers, and monitoring queues. |

## Ownership Rules

Every work item must be assigned to one primary owning department.

Secondary departments may support, but they do not own the task unless the manager formally reroutes it.

Examples:

| Work type | Owning department | Support departments |
| --- | --- | --- |
| Thin review page | Content Operations | SEO, Research & Intelligence, QA & Governance |
| Missing meta title | SEO | Content Operations |
| Unsupported claim | QA & Governance | Research & Intelligence |
| Missing evidence/proof | Research & Intelligence | QA & Governance, Content Operations |
| Affiliate disclosure issue | QA & Governance | Content Operations |
| Media/video need | Media | Content Operations, QA & Governance |
| Social post idea | Social & Distribution | Brand Governance, QA & Governance |
| Content decay / traffic drop | Analytics & Lifecycle | SEO, Content Operations |
| Cross-department conflict | Executive Orchestration | Relevant managers |
| High-risk final decision | Danny | The Gaffer, Gatekeeper Grace |

## Communication Rules

Specialists may communicate with:

- their own department manager
- another specialist in the same department if the manager allows it
- a defined next-stage team if the workflow explicitly allows it

Specialists may not freely route work across departments.

Cross-department work must go through:

1. Department Manager
2. Relevant second Department Manager
3. QA & Governance where risk exists
4. The Gaffer where prioritisation or conflict exists
5. Danny only for final human decisions

## Quality Control Rules

QA & Governance never silently edits and passes work.

Gatekeeper Grace may:

- pass low-risk report-only work
- request revision
- request more evidence
- reject back to the owning department
- route to Research & Intelligence
- escalate to The Gaffer
- recommend Danny review
- block due to risk

QA must reject or escalate:

- unsupported scam/fraud wording
- legal/policy conclusions
- rating-impacting recommendations
- affiliate-link insertion recommendations
- evidence gaps hidden as facts
- invented testing or proof
- unsafe publishing/apply assumptions
- serious-content tone violations

## Status Paths

Future work must move through clear statuses.

Allowed planning/report-only statuses:

- Detected
- Suspected
- Verified
- Recommended
- Needs Department Review
- Needs Evidence
- Needs SEO
- Needs Media
- Needs QA
- Rejected to Content
- Rejected to SEO
- Rejected to Research
- Rejected to Media
- Rejected to Social
- Escalated to Manager
- Escalated to The Gaffer
- Awaiting Human Review
- Monitor Only
- Blocked

Future-only statuses, still blocked in current mode:

- Approved for Publish
- Published
- Approved for Apply
- Applied
- Monitoring / Refresh Queue

Current mode remains READ_ONLY_REPORT_ONLY. Approved, published, and applied states are not active yet. The Hive operating model remains documentation/control-only with no live edits, no publishing, no Supabase writes, and no Safe Apply.

## Standard Workflow

Default safe workflow:

1. Specialist detects or drafts a finding.
2. Specialist creates Agent Output Contract style output.
3. Department Manager reviews the output.
4. Manager either accepts, rejects, requests evidence, or routes sideways.
5. QA & Governance checks risk, evidence, tone, affiliate, rating, and claim safety.
6. The Gaffer receives only clean cross-department or priority items.
7. Danny receives only key decisions requiring human judgement.
8. Nothing is published, applied, or written live in current mode.

## Rejection Loops

Rejected work must return to the correct owner with:

- rejection reason
- evidence gap
- required fix
- next allowed status
- whether QA review is required again

Examples:

| Rejection reason | Return route |
| --- | --- |
| Missing proof | Research & Intelligence |
| Weak page structure | Content Operations |
| Poor keyword fit | SEO |
| Unsafe claim wording | QA & Governance |
| Missing disclosure | QA & Governance |
| Media gap | Media |
| Tone mismatch | Editorial Strategy |
| Cross-team conflict | Executive Orchestration |

## Human Approval Rules

Danny approval is required for:

- publishing
- live-site edits
- Supabase writes
- trust rating changes
- affiliate-link insertion
- final scam/fraud wording
- legal or policy-sensitive wording
- AI/API activation
- live crawling/fetching
- media generation/downloads
- Safe Apply
- any override of failed QA/Governance checks

Current Build #52B does not enable any of these actions.

## Do Not Build the Full Army Yet

The 120+ specialist Hive is a target model, not an immediate build instruction. Build #52B locks the rule: do not build the full 120+ specialist army in one go.

Future agents should be added only after:

- the owning department is clear
- manager ownership is clear
- capability endpoint is clear
- input/output contract is clear
- routing path is clear
- QA requirements are clear
- blocked actions are clear
- validator coverage exists or is intentionally deferred

## Build #52B Conclusion

Build #52B locks the Hive operating model as a controlled structure.

A new future agent can now be planned against:

- a four-layer hierarchy
- one owning department
- one manager
- clear communication limits
- defined routing rules
- defined status paths
- QA and governance gates
- Danny approval rules
- READ_ONLY_REPORT_ONLY safety boundaries

The next build remains:

**Build #52C — CryptoWatchdog Page Template & Themed Hub Library v1**


