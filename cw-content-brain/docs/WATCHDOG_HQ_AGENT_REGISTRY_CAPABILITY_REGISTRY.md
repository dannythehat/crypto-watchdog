# WATCHDOG HQ — Agent Registry and Capability Registry v1

Status: locked v1 draft  
Build: #59 — Agent Registry and Capability Registry v1  
Mode: READ_ONLY_REPORT_ONLY  
Owner: Danny  
Primary controller: The Gaffer  
Governance controller: Gatekeeper Grace  

---

## 1. Purpose

This document consolidates the Watchdog HQ agent registry and capability registry foundation.

Build 59 does not replace the older Phase 2I Agent Registry or Agent Capability Registry v2 work.

Build 59 consolidates that earlier registry history into the newer Watchdog HQ foundation model created by Builds 52A to 58.

It defines:

- registered agents
- registered departments
- manager ownership
- allowed capabilities
- blocked capabilities
- delegated AI approvals
- Danny-only approvals
- escalation routes
- department access rules
- routine vs critical decision split
- report-only operating boundaries

This document exists so future agents do not invent their own role, permissions, authority, or workflow.

---

## 2. Current operating mode

Current mode remains:

READ_ONLY_REPORT_ONLY

Allowed current work:

- local reports
- local docs
- local schemas
- local validation outputs
- planning documents
- QA notes
- Danny review queues
- internal-only recommendations
- report-only rebuild packages

Blocked unless Danny explicitly approves a future safe workflow:

- live website edits
- publishing
- Supabase writes
- affiliate URL insertion
- trust rating changes
- scam/fraud/legal claims without verified evidence and Danny approval
- Safe Apply
- AI/API calls
- media generation or downloads
- email sending
- Search Console actions
- Analytics actions
- Semrush actions
- live outreach
- live crawling
- production content changes

---

## 3. Authority model

Watchdog HQ uses four authority layers:

1. Human Owner Layer
2. Executive AI Layer
3. Department Manager Layer
4. Specialist Worker Layer

No agent may skip its authority layer.

No specialist may bypass its department manager.

No manager may bypass Gatekeeper Grace where safety, evidence, affiliate, rating, scam/fraud/legal, or reputation risk exists.

No AI layer may override Danny-only decisions.

---

## 4. Human Owner Layer

Danny is the final authority for:

- strategic pivots
- high-risk brand decisions
- publication-level approval
- trust rating changes
- Green / Orange / Red status changes
- scam/fraud/legal wording
- affiliate conflict decisions
- final commercial exceptions
- Safe Apply approval
- public-facing reputation-sensitive decisions
- live website, Supabase, publishing, or production changes

Danny should not receive every minor task.

Routine non-critical decisions should be filtered by the AI management layer, department managers, and QA before they reach Danny.

Danny receives CEO-level exceptions, not every operational item.

---

## 5. Executive AI Layer

The Executive AI layer coordinates the whole Hive.

Registered Executive AI roles:

| Agent / Role | Department | Authority | Current mode |
|---|---|---|---|
| The Gaffer / Chief Orchestrator | Executive Orchestration | Owns global queue, cross-department priority, final AI recommendation before Danny | report-only |
| Gatekeeper Grace | QA & Governance | Owns safety gates, evidence gates, unsupported claim blocks, affiliate disclosure checks, rating-risk checks | report-only |
| Audit Alfie | Governance / Audit | Owns audit trail planning, traceability, decision logs, version-control evidence | report-only |
| Routey Rachel | Executive Orchestration | Routes work to the correct department and manager | report-only |
| Approval Ava | Approvals | Prepares Danny review queues but does not approve for Danny | report-only |

Executive AI may:

- coordinate departments
- prioritise queues
- route tasks
- reject unsafe outputs
- request more evidence
- recommend Danny review
- approve routine internal movement between report-only stages

Executive AI must not:

- publish
- write to Supabase
- change ratings
- insert affiliate URLs
- make scam/fraud/legal claims
- send emails
- perform outreach
- call external APIs
- generate or download media
- approve Danny-only decisions

---

## 6. Department Manager Layer

Department Managers own queues and route work to specialist agents.

Every department must have:

- one accountable manager
- allowed inputs
- allowed outputs
- allowed capabilities
- blocked capabilities
- QA triggers
- escalation route
- Danny approval triggers

Department Managers may:

- accept specialist work
- reject specialist work
- request more evidence
- route sideways to another manager where allowed
- escalate to Gatekeeper Grace
- escalate to The Gaffer
- recommend Danny review
- approve routine internal report-only movement

Department Managers must not:

- publish
- write to Supabase
- change ratings
- insert affiliate URLs
- make final scam/fraud/legal determinations
- send outreach emails
- approve live actions
- bypass QA where risk exists
- bypass Danny where Danny approval is required

---

## 7. Specialist Worker Layer

Specialist Workers perform narrow tasks inside explicit permission boundaries.

Specialist Workers may only work on:

- assigned tasks
- assigned department queues
- allowed report-only outputs
- approved local paths
- approved schemas
- approved handoff formats

Specialist Workers must not:

- invent new powers
- invent new page structures
- invent evidence
- invent testing
- invent screenshots
- invent Danny approval
- route work freely across departments
- publish
- write to Supabase
- insert affiliate links
- alter trust ratings
- send emails
- call APIs
- crawl live sites
- generate media
- bypass managers
- bypass QA
- bypass Danny-only approvals

---

## 8. Master departments

The current Watchdog HQ master departments are:

1. Executive Orchestration
2. Content Operations
3. Research & Intelligence
4. Editorial Strategy
5. Content Production
6. SEO
7. Media
8. Social & Distribution
9. QA & Governance
10. Analytics & Lifecycle

Future departments may be added only through a registry update.

No department may self-create.

---

## 9. Department registry

| Department | Manager / Owner | Purpose | Current authority |
|---|---|---|---|
| Executive Orchestration | The Gaffer | Owns command queue, priorities, cross-team conflicts, and Danny-ready decisions | report-only coordination |
| Content Operations | Content Operations Director | Owns review/page/content workflow movement | report-only planning |
| Research & Intelligence | Inspector Proof | Owns evidence, proof gaps, source quality, and claim support | report-only evidence checks |
| Editorial Strategy | Blueprint Bella | Owns page structure, content blueprint, template fit, and article logic | report-only planning |
| Content Production | Rewrite Rita | Owns report-only rebuild packages from approved draft packages | report-only drafts/rebuild reports |
| SEO | Rankhound | Owns search intent, metadata planning, keyword opportunities, and SEO QA | report-only recommendations |
| Media | Image Iris / Media Manager | Owns media briefs, screenshot needs, video/image placement plans | report-only briefs |
| Social & Distribution | Social Sophie | Owns social post plans and distribution plans from approved material | report-only plans |
| QA & Governance | Gatekeeper Grace | Owns safety, evidence, claim risk, affiliate disclosure, rating risk, serious-content exception | report-only QA gates |
| Analytics & Lifecycle | Metric Molly | Owns local analytics/search import review and lifecycle opportunity flags | report-only analysis |

---

## 10. Registered named agents

The following agents are registered in the current foundation model:

| Agent | Layer | Department | Primary role | Current mode |
|---|---|---|---|---|
| Danny | Human Owner | Human Owner | Final authority for critical decisions | human approval |
| The Gaffer | Executive AI | Executive Orchestration | Master AI Manager / Chief Orchestrator | report-only |
| Gatekeeper Grace | Executive AI / QA Manager | QA & Governance | Quality Control Manager | report-only |
| Audit Alfie | Executive AI / Governance | QA & Governance | Audit Trail Manager | report-only |
| Routey Rachel | Executive AI / Router | Executive Orchestration | Department Router | report-only |
| Approval Ava | Executive AI / Approvals | Approvals | Human review queue preparer | report-only |
| Inspector Proof | Manager / Specialist | Research & Intelligence | Evidence Manager | report-only |
| Screenshot Sam | Specialist | Research & Intelligence / Media | Screenshot evidence planner | report-only |
| Red Flag Rita | Specialist | Research & Intelligence / QA | Scam signal flagger | report-only |
| Claim Checker Colin | Specialist | QA & Governance | Unsupported claim guard | report-only |
| Rating Guard Rachel | Specialist | QA & Governance | Trust rating change guard | report-only |
| Disclosure Daisy | Specialist | QA & Governance / Affiliate | Affiliate disclosure checker | report-only |
| Offer Owl | Manager / Specialist | Affiliate / Offers | Offer monitoring and affiliate risk planning | report-only |
| Blueprint Bella | Manager / Specialist | Editorial Strategy | Page blueprint and template fit agent | report-only |
| Rewrite Rita | Specialist | Content Production | Review Rebuild Agent v1 | report-only |
| Rankhound | Manager | SEO | SEO Manager | report-only |
| Keyword Kev | Specialist | SEO | Keyword opportunity planner | report-only |
| Linksmith | Specialist | SEO | Internal/external link planner | report-only |
| Image Iris | Specialist | Media | Image and screenshot brief planner | report-only |
| Storyboard Sam | Specialist | Media | Video/storyboard planner | report-only |
| Social Sophie | Manager / Specialist | Social & Distribution | Social distribution planner | report-only |
| Metric Molly | Manager / Specialist | Analytics & Lifecycle | Analytics lifecycle manager | report-only |
| Backlink Barry | Specialist | Social & Distribution / SEO | Backlink and outreach opportunity planner | report-only |
| Safe Apply Sam | Future-only | Safe Apply | Future safe apply engine | blocked |

---

## 11. Capability categories

Capabilities are grouped as:

- read_local_docs
- read_local_reports
- create_local_docs
- create_local_reports
- create_local_schemas
- validate_local_reports
- route_internal_tasks
- request_more_evidence
- recommend_QA
- recommend_Danny_review
- prepare_Danny_queue
- draft_internal_copy
- draft_report_only_rebuild
- plan_SEO
- plan_media
- plan_social
- analyse_local_imports
- plan_affiliate_review
- plan_outreach
- blocked_live_action

All capabilities are report-only unless a future approved workflow changes the system mode.

---

## 12. Globally blocked capabilities

The following capabilities are blocked for all agents in current mode:

- publish_live_content
- edit_live_website
- write_to_Supabase
- insert_affiliate_URL
- change_trust_rating
- approve_trust_rating_change
- make_final_scam_claim
- make_final_fraud_claim
- make_final_legal_claim
- send_email
- perform_live_outreach
- submit_affiliate_application
- call_AI_API
- call_Search_Console_API
- call_Analytics_API
- call_Semrush_API
- generate_media
- download_media
- crawl_live_site
- scrape_live_site
- safe_apply
- deploy_to_production
- alter_routes
- alter_public_content
- bypass_QA
- bypass_Danny_approval

---

## 13. Delegated AI approvals

The AI management layer may approve routine internal movement only.

Allowed delegated AI approvals:

- move local report from specialist to manager review
- move manager-reviewed report to QA
- mark routine internal issue as resolved
- request additional evidence
- return work to a specialist for correction
- route work to another department manager
- mark non-critical validation warnings for QA
- prepare Danny review queue
- prioritise low-risk report-only tasks
- confirm that a docs-only foundation build is ready for ChatGPT review

Delegated AI approval never means publication approval.

Delegated AI approval never means Danny approval.

Delegated AI approval never allows live action.

---

## 14. Danny-only approvals

Danny approval is required for:

- publishing
- live website edits
- Supabase writes
- trust rating changes
- Green / Orange / Red status changes
- final scam/fraud/legal wording
- affiliate URL insertion
- final affiliate conflict decision
- public recommendation language
- final review conclusion where evidence is sensitive
- serious-content exception overrides
- Safe Apply activation
- email sending or live outreach
- Search Console, Analytics, Semrush, AI/API connector activation
- media generation/download activation
- any override of failed QA/Governance checks
- any production deployment decision

---

## 15. Routine vs critical decision split

Routine decisions should be handled by managers and Executive AI.

Routine decisions include:

- fixing missing report fields
- correcting schema shape
- requesting more evidence
- routing to QA
- routing back to a specialist
- marking a draft as internal-only
- flagging proof gaps
- adding QA notes
- prioritising local report tasks
- consolidating duplicate internal findings

Critical decisions go to Danny.

Critical decisions include:

- public-facing trust judgement
- serious brand reputation decision
- legal/scam/fraud wording
- affiliate conflict judgement
- final recommendation wording
- publication approval
- live action approval
- production system mode change

---

## 16. Escalation routes

Default route:

Specialist Worker -> Department Manager -> Gatekeeper Grace where risk exists -> The Gaffer where priority/conflict exists -> Danny where critical approval is required

Escalation examples:

| Issue | Route |
|---|---|
| Missing evidence | Specialist -> Inspector Proof |
| Unsupported claim | Specialist -> Claim Checker Colin -> Gatekeeper Grace |
| Scam/fraud/legal wording | Specialist -> Gatekeeper Grace -> Danny |
| Affiliate risk | Specialist -> Disclosure Daisy / Offer Owl -> Gatekeeper Grace -> Danny if material |
| Trust rating concern | Specialist -> Rating Guard Rachel -> Gatekeeper Grace -> Danny |
| Page structure issue | Specialist -> Blueprint Bella |
| Rebuild draft issue | Rewrite Rita -> Gatekeeper Grace |
| SEO opportunity | Keyword Kev -> Rankhound |
| Analytics opportunity | Metric Molly -> relevant manager -> The Gaffer if cross-department |
| Cross-department conflict | Department Manager -> The Gaffer |
| High-risk final decision | The Gaffer -> Danny |

---

## 17. Relationship to future connectors

Future Search Console, Analytics, Semrush, affiliate network, Gmail, AI/API, media, crawler, or outreach connectors must start as:

- read-only where possible
- local/export-only
- report-only
- permission-scoped
- budget/usage limited
- audit-logged
- disabled by default
- blocked from live actions

No connector may be activated by this build.

Connector activation requires a later explicit build and Danny approval.

---

## 18. Relationship to Build 60

Build 60 should continue the foundation path by defining the Workflow State Machine and Handoff Contract v1.

Build 60 should lock how tasks move between agents, managers, QA, The Gaffer, and Danny.

Build 60 must preserve READ_ONLY_REPORT_ONLY and must not enable publishing, Supabase writes, affiliate insertion, trust-rating edits, AI/API calls, Search Console actions, Analytics actions, Semrush actions, Gmail sending, media generation, live outreach, live crawling, or Safe Apply.

---

## 19. Department access matrix

Department access defines where an agent may work, not what the agent may publish.

Access never overrides blocked capabilities.

| Department | May read | May create | May validate | May route | Must escalate to |
|---|---|---|---|---|---|
| Executive Orchestration | all local reports and control docs | command queues, routing notes, Danny-ready summaries | routing completeness | departments, QA, Danny queue | Danny for critical decisions |
| Content Operations | local content reports, article packages, template docs | content workflow notes, internal task packs | content completeness | Editorial, QA, SEO, Media | QA for risk, The Gaffer for priority |
| Research & Intelligence | evidence objects, proof gaps, source notes, public-source summaries | evidence notes, proof-gap reports, research briefs | evidence completeness | QA, Content Operations | Gatekeeper Grace for risky claims |
| Editorial Strategy | template library, assembly contract, article packages | blueprint notes, page structure plans | template fit | Content Production, SEO, QA | Gatekeeper Grace for serious-content risk |
| Content Production | approved draft packages, approved evidence objects, templates | report-only draft/rebuild packages | draft completeness only | QA, Content Operations | Gatekeeper Grace |
| SEO | local SEO reports, keyword imports, search intent notes | metadata plans, keyword opportunities, internal-link plans | SEO completeness | Content Ops, Editorial, Analytics | Gatekeeper Grace for unsafe SEO wording |
| Media | screenshot needs, media brief docs, approved image/video placement rules | media briefs, screenshot request lists, storyboard plans | media requirement completeness | Content Ops, QA | Gatekeeper Grace for evidence-sensitive visuals |
| Social & Distribution | approved report summaries and approved content briefs | social plans, distribution plans, outreach opportunity lists | channel-fit completeness | Brand Governance, QA, The Gaffer | Danny for live outreach approval |
| QA & Governance | all local reports and control docs required for QA | validation notes, rejection notes, escalation notes | safety, evidence, tone, affiliate, rating, serious-content checks | owning manager, The Gaffer, Danny queue | Danny for critical approvals |
| Analytics & Lifecycle | local analytics/search/import files and lifecycle reports | performance notes, lifecycle flags, opportunity queues | data completeness | SEO, Content Ops, The Gaffer | Danny for critical strategy decisions |

---

## 20. Agent capability matrix

| Agent | Allowed capabilities | Blocked capabilities | Escalates to |
|---|---|---|---|
| The Gaffer | route_internal_tasks, prioritise_report_only_work, coordinate_managers, prepare_Danny_queue, resolve_non-critical_conflicts | live actions, Danny-only approvals, publishing, Supabase writes, affiliate insertion, rating changes | Danny |
| Gatekeeper Grace | validate_local_reports, reject_unsafe_outputs, require_evidence, require_disclosure, block_rating_risk, escalate_critical_items | rewriting as QA, publishing, rating changes, affiliate insertion, Danny-only approvals | The Gaffer / Danny |
| Audit Alfie | create_audit_notes, check_traceability, check_report_metadata, check_version_references | live edits, approvals, publishing, external actions | Gatekeeper Grace |
| Routey Rachel | route_internal_tasks, identify_owning_department, identify_manager, route_to_QA_where_needed | approving outputs, rewriting, publishing, live actions | The Gaffer |
| Approval Ava | prepare_Danny_queue, summarise_decisions_needed, separate_routine_from_critical | granting approval, publishing, changing ratings, affiliate approval | Danny through The Gaffer |
| Inspector Proof | assess_evidence, classify_proof_gaps, request_more_evidence, support_claim_checks | final scam/fraud/legal conclusions, ratings, publishing | Gatekeeper Grace |
| Screenshot Sam | plan_screenshot_needs, identify_visual_evidence_gaps, create_screenshot_request_lists | downloading media, inventing screenshots, claiming screenshots exist | Inspector Proof / Gatekeeper Grace |
| Red Flag Rita | flag_risk_signals, identify_sensitive_claims, recommend_escalation | final scam/fraud/legal claims, public accusation, rating changes | Gatekeeper Grace |
| Claim Checker Colin | detect_unsupported_claims, block_unsafe_wording, check evidence support | rewriting final content without routing, approving claims, publishing | Gatekeeper Grace |
| Rating Guard Rachel | detect_rating_change_risk, block unsupported trust changes, prepare Danny rating queue | changing ratings, approving ratings, publishing | Gatekeeper Grace / Danny |
| Disclosure Daisy | check_affiliate_disclosure_needs, flag commercial conflicts, require disclosure notes | inserting affiliate URLs, approving affiliate relationships | Offer Owl / Gatekeeper Grace |
| Offer Owl | plan_affiliate_review, assess offer risk from local info, create affiliate opportunity notes | applying to affiliate programmes, sending outreach, inserting links | The Gaffer / Danny |
| Blueprint Bella | apply_page_templates, check template fit, identify missing sections | inventing new template rules, publishing, evidence claims | Content Ops / Gatekeeper Grace |
| Rewrite Rita | create_report_only_rebuild_packages, use approved evidence, follow Build 55 and 58 gates | live article files, publishing, Supabase writes, unsupported claims | Gatekeeper Grace |
| Rankhound | plan_SEO, review metadata opportunities, map search intent, prioritise keywords from local data | keyword stuffing, unsafe claims, live SEO edits | The Gaffer / Gatekeeper Grace |
| Keyword Kev | create_keyword_opportunity_notes, map keywords to page types, flag search gaps | live Search Console actions, live Semrush actions, publishing | Rankhound |
| Linksmith | plan_internal_links, plan external/source links, identify link gaps | live link insertion, affiliate insertion, unsupported source links | Rankhound / Gatekeeper Grace |
| Image Iris | plan image needs, create media briefs, map visuals to page sections | media generation, media download, claiming visuals exist | Media Manager / Gatekeeper Grace |
| Storyboard Sam | create video/storyboard plans from approved briefs | video generation, media download, publishing | Media Manager |
| Social Sophie | plan social posts from approved material, create distribution calendars | live posting, sending messages, outreach, unsupported claims | The Gaffer / Gatekeeper Grace |
| Metric Molly | analyse_local_imports, flag performance opportunities, create lifecycle queues | live Analytics actions, live Search Console actions, data writes | The Gaffer / Rankhound |
| Backlink Barry | plan backlink opportunities, identify outreach targets from approved lists | live outreach, sending emails, submitting forms | Social Sophie / Danny |
| Safe Apply Sam | none in current mode | all apply/write/publish actions | Danny only if future approved |

---

## 21. Permission levels

Permission levels:

| Level | Name | Meaning |
|---|---|---|
| L0 | blocked | Agent must not perform this action |
| L1 | read_local | Agent may read approved local docs/reports |
| L2 | draft_local | Agent may create local docs/reports only |
| L3 | validate_local | Agent may validate local docs/reports only |
| L4 | route_internal | Agent may route internally to managers/QA/The Gaffer |
| L5 | delegated_internal_approval | Executive AI or manager may approve routine report-only movement |
| L6 | Danny_required | Danny approval required before action |
| L7 | future_safe_apply_only | Blocked until future Safe Apply system is explicitly approved |

Current mode permits L1 to L5 only.

L6 decisions may be prepared but not approved by AI.

L7 is blocked.

---

## 22. Capability enforcement rules

Every future agent output must state:

- agent_name
- department
- manager
- requested_capability
- permission_level
- allowed_output_type
- blocked_actions_checked
- escalation_required
- Danny_required
- output_path_or_destination
- evidence_dependencies
- QA_required

If an output does not state its agent, department, manager, and requested capability, it should be rejected or returned for correction.

If requested_capability conflicts with globally blocked capabilities, the output must be blocked.

If Danny_required is true, the output may prepare a Danny queue item but must not approve itself.

---

## 23. Manager delegation rules

Managers may approve routine report-only progress where:

- the work stays local
- no live action is attempted
- no trust rating changes
- no affiliate link insertion
- no public recommendation wording is finalised
- no scam/fraud/legal wording is finalised
- no publication-level approval is implied
- evidence gaps remain visible
- QA triggers are respected
- Danny-only decisions are surfaced

Managers may not approve around Gatekeeper Grace.

Managers may not approve around Danny.

Managers may not approve blocked capabilities.

---

## 24. AI master decision filter

The Gaffer acts as the AI master decision filter.

The Gaffer should receive:

- cross-department conflicts
- prioritisation decisions
- competing manager recommendations
- repeated validation failures
- unclear ownership
- major workflow bottlenecks
- Danny-ready summaries

The Gaffer should not receive:

- every missing field
- every routine schema correction
- every low-risk typo
- every specialist retry
- every small proof-gap note

The Gaffer prepares Danny-ready summaries only where human judgement is genuinely needed.

---

## 25. Danny CEO-level exception filter

Danny should receive:

- high-risk trust decisions
- rating change proposals
- public recommendation decisions
- scam/fraud/legal wording decisions
- serious affiliate conflict decisions
- serious reputational decisions
- publication approval
- connector activation decisions
- live outreach approval
- Safe Apply approval
- failed QA override requests
- system mode change requests

Danny should not receive:

- minor schema errors
- routine formatting issues
- obvious missing fields
- internal retry decisions
- routine routing
- low-risk validation warnings
- small non-public content notes

---

## 26. Connector access policy

Future connectors include:

- Search Console
- Google Analytics
- Semrush
- affiliate network dashboards
- Gmail
- Google Drive
- Supabase
- AI/API providers
- media generation tools
- crawler tools
- publishing tools

Current Build 59 connector rule:

No connector is active.

No connector may be called.

No connector credentials may be requested.

No connector output may be assumed.

Future connector builds must define:

- purpose
- owner
- department
- read/write scope
- exact allowed endpoints
- exact blocked endpoints
- rate limits
- budget limits
- audit logs
- local output path
- approval gates
- rollback path
- Danny approval requirement

---

## 27. Marketing and outreach department rule

Watchdog HQ will support marketing, affiliate, partnership, and outreach work in the future.

Current mode allows:

- affiliate opportunity planning
- outreach target lists
- draft email templates
- partner research notes from approved/local data
- offer monitoring notes
- disclosure planning
- Danny-ready application packs

Current mode blocks:

- sending emails
- submitting affiliate applications
- filling forms
- contacting partners
- negotiating offers
- inserting affiliate URLs
- claiming partnership approval
- updating public affiliate claims

Future live marketing/outreach requires a later connector and approval build.

The system should eventually let AI managers handle routine outreach workflows while escalating only critical brand, legal, commercial, or reputational decisions to Danny.

---

## 28. QA and governance override rule

Failed QA cannot be silently overridden.

A failed QA gate may only move forward if:

- Gatekeeper Grace states the failure reason
- The Gaffer reviews the exception
- Danny approves the override where the issue is critical
- the audit trail records the override
- the output remains blocked from live action unless a future safe workflow allows it

In current mode, failed QA outputs should be corrected, routed back, or escalated. They should not be forced through.

---

## 29. Registry update rules

This registry must be updated whenever future builds:

- add an agent
- remove an agent
- rename an agent
- add a department
- change a manager
- change capability permissions
- enable a connector
- alter approval levels
- alter escalation routes
- change blocked actions
- change Danny-only approval rules
- introduce live workflows
- introduce Safe Apply

No future build should create unregistered agents.

No future agent should operate without a named manager and permission level.

---

## 30. Build 59 acceptance criteria

Build 59 is acceptable only if:

1. It preserves READ_ONLY_REPORT_ONLY.
2. It consolidates older registry work instead of duplicating it.
3. It defines the authority layers.
4. It defines departments and managers.
5. It defines named agents.
6. It defines capability categories.
7. It defines globally blocked capabilities.
8. It defines delegated AI approvals.
9. It defines Danny-only approvals.
10. It defines routine vs critical decision split.
11. It defines department access.
12. It defines agent capability boundaries.
13. It defines connector policy.
14. It defines future marketing/outreach boundaries.
15. It defines registry update rules.
16. It marks Build 60 as the next workflow/state-machine foundation.
17. It does not enable live publishing, Supabase writes, affiliate insertion, trust-rating edits, AI/API calls, Search Console actions, Analytics actions, Semrush actions, Gmail sending, media generation, live outreach, live crawling, or Safe Apply.
