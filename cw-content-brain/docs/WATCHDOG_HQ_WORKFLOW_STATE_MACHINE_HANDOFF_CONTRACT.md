# Watchdog HQ Workflow State Machine and Handoff Contract v1

Build: #60 — Workflow State Machine and Handoff Contract v1  
Mode: READ_ONLY_REPORT_ONLY  
Owner: Danny  
Control layer: Watchdog HQ / CryptoWatchdog Content Brain  
Status: Locked foundation contract

---

## 1. Purpose

This document defines the controlled workflow state machine and handoff contract for Watchdog HQ.

Its job is to stop agents, managers, QA, validators, and future tools from inventing their own task statuses, handoff routes, escalation paths, or approval assumptions.

Every future task must have:

- one current workflow state
- one owning department
- one owning manager or agent
- one allowed next route
- clear blocked routes
- clear QA requirements
- clear Danny approval requirements
- a local/report-only audit trail
- no live action unless a future approved workflow explicitly allows it

This contract protects the Watchdog HQ structure from drift.

---

## 2. Locked operating mode

Current system mode:

READ_ONLY_REPORT_ONLY

Allowed outputs:

- local reports
- local validation reports
- local draft packages
- local rebuild reports
- local QA handoff notes
- local Danny review queue items
- roadmap and blueprint updates
- structured planning documents

Blocked unless Danny explicitly approves a later safe workflow:

- live publishing
- Supabase writes
- live content edits
- affiliate URL insertion
- trust rating changes
- scam/fraud/legal accusations without verified evidence and approval
- sending emails
- outreach submissions
- live crawling
- API-driven changes to Search Console, Analytics, Semrush, affiliate platforms, or email
- automatic approval of high-risk decisions
- deletion of live content
- bypassing QA or The Gaffer

---

## 3. Relationship to previous builds

Build 60 depends on:

- Build 52A — foundations readiness audit
- Build 52B — Hive operating model
- Build 52C — page/template and themed hub library
- Build 53 — review evidence intake contract
- Build 54 — review article assembly contract
- Build 55 — review draft safety harness
- Build 56 — Review Rebuild Agent v1
- Build 57 — Review Rebuild Report Schema v1
- Build 58 — Review Rebuild Report Validator v1
- Build 59 — Agent Registry and Capability Registry v1

Build 60 does not replace those documents.

Build 60 defines how work moves between them.

---

## 4. Core workflow principle

No agent owns a task forever.

A task moves through controlled states.

At every state, the system must know:

- who owns it
- what input was used
- what output was produced
- what validation happened
- what evidence supports it
- what is blocked
- what can happen next
- whether QA is required
- whether Danny is required
- whether the item remains report-only

---

## 5. Task object

Every future Watchdog HQ work item must include a task object.

Required fields:

- task_id
- task_type
- title
- created_at
- updated_at
- current_state
- owning_department
- owning_manager
- assigned_agent
- source_builds
- source_documents
- input_paths
- output_paths
- validation_paths
- evidence_status
- risk_level
- qa_required
- danny_approval_required
- current_blockers
- allowed_next_states
- blocked_next_states
- handoff_history
- final_status

---

## 6. Task types

Allowed task_type values:

- review_evidence_intake
- review_article_assembly
- review_draft_safety_validation
- review_rebuild_report
- review_rebuild_report_validation
- page_quality_review
- seo_opportunity_review
- keyword_opportunity_review
- internal_link_opportunity_review
- affiliate_opportunity_review
- brand_voice_review
- media_requirement_review
- analytics_opportunity_review
- search_console_opportunity_review
- semrush_opportunity_review
- outreach_opportunity_review
- social_distribution_plan
- qa_governance_review
- danny_review_item
- roadmap_update
- blueprint_update
- incident_review
- future_safe_apply_request

No future build should invent a new task_type without updating this contract or its successor.

---

## 7. Core states

Allowed current_state values:

- planned
- queued
- assigned
- in_progress
- blocked
- needs_evidence
- needs_manager_review
- needs_cross_department_review
- needs_QA
- QA_in_progress
- QA_rejected
- QA_passed
- needs_the_gaffer_review
- needs_Danny_review
- Danny_approved
- Danny_rejected
- report_ready
- validation_ready
- validation_failed
- validation_passed
- ready_for_internal_use
- archived
- cancelled

Blocked in current READ_ONLY_REPORT_ONLY mode:

- ready_to_publish
- published
- live_updated
- affiliate_inserted
- trust_rating_changed
- outreach_sent
- email_sent
- applied_to_site
- applied_to_supabase

These blocked states may only be introduced by a future approved Safe Apply workflow.

---

## 8. State ownership rules

Each state must have one accountable owner.

Default ownership:

- planned -> The Gaffer
- queued -> The Gaffer
- assigned -> owning department manager
- in_progress -> assigned agent
- blocked -> owning department manager
- needs_evidence -> Research & Intelligence manager
- needs_manager_review -> owning department manager
- needs_cross_department_review -> relevant department managers
- needs_QA -> Gatekeeper Grace
- QA_in_progress -> Gatekeeper Grace
- QA_rejected -> owning department manager
- QA_passed -> The Gaffer or next owning manager
- needs_the_gaffer_review -> The Gaffer
- needs_Danny_review -> Danny
- Danny_approved -> The Gaffer
- Danny_rejected -> The Gaffer
- report_ready -> owning department manager
- validation_ready -> validator owner
- validation_failed -> owning department manager
- validation_passed -> The Gaffer or Gatekeeper Grace
- ready_for_internal_use -> The Gaffer
- archived -> The Gaffer
- cancelled -> The Gaffer

Specialist agents must not move work directly to Danny unless the route is allowed by their manager, Gatekeeper Grace, or The Gaffer.

---

## 9. Allowed high-level flow

Default controlled flow:

1. planned
2. queued
3. assigned
4. in_progress
5. report_ready
6. validation_ready
7. validation_passed or validation_failed
8. needs_manager_review
9. needs_QA where risk exists
10. QA_passed or QA_rejected
11. needs_the_gaffer_review where prioritisation or cross-team decision is needed
12. needs_Danny_review only for CEO-level critical decisions
13. ready_for_internal_use or archived

A task may loop backwards only through approved rejection routes.

---

## 10. Rejection routes

Allowed rejection routes:

- validation_failed -> in_progress
- validation_failed -> needs_evidence
- validation_failed -> blocked
- QA_rejected -> in_progress
- QA_rejected -> needs_evidence
- QA_rejected -> needs_manager_review
- QA_rejected -> needs_the_gaffer_review
- Danny_rejected -> cancelled
- Danny_rejected -> needs_the_gaffer_review
- Danny_rejected -> needs_evidence
- blocked -> needs_manager_review
- needs_evidence -> assigned
- needs_cross_department_review -> needs_manager_review

Every rejection must include:

- rejection_reason
- rejecting_owner
- rejected_at
- required_fix
- severity
- allowed_resubmission_route

---

## 11. Escalation routes

Allowed escalation routes:

- assigned agent -> department manager
- department manager -> Gatekeeper Grace
- department manager -> another department manager
- department manager -> The Gaffer
- Gatekeeper Grace -> The Gaffer
- The Gaffer -> Danny
- Danny -> The Gaffer

Blocked escalation routes:

- specialist agent -> Danny directly
- specialist agent -> live system
- specialist agent -> another department without manager route
- QA -> live publishing
- validator -> live publishing
- outreach agent -> email send without future approval system
- affiliate agent -> affiliate insertion without future approval system

---

## 12. Danny approval principle

Danny should receive CEO-level exceptions, not every operational item.

Danny approval is required for:

- trust rating changes
- Green/Orange/Red status changes
- scam/fraud/legal wording decisions
- publication approval
- affiliate relationship activation
- affiliate link insertion
- outreach send approval where reputational risk exists
- email send approval where reputational or commercial risk exists
- strategic pivots
- override of failed QA or governance checks
- any future Safe Apply activation
- deleting or replacing live content
- public claims about testing, proof, deposits, withdrawals, or safety where evidence is sensitive or incomplete

Danny approval is not required for routine local/report-only drafting where all safety rules are followed.

---

## 13. The Gaffer approval principle

The Gaffer may decide routine non-critical routing and prioritisation.

The Gaffer may:

- prioritise the work queue
- route tasks between managers
- accept non-critical validator warnings
- send items back for fixes
- decide whether a routine report is ready for internal use
- reduce Danny noise by filtering low-level issues
- escalate only CEO-level decisions to Danny

The Gaffer must not:

- publish
- write to Supabase
- insert affiliate links
- change ratings
- approve legal/scam/fraud claims alone
- bypass Gatekeeper Grace for safety-sensitive work
- override Danny on CEO-level matters

---

## 14. QA and governance principle

Gatekeeper Grace owns QA and governance checks.

QA must check:

- evidence support
- unsupported claims
- scam/fraud/legal wording
- affiliate disclosure risk
- rating mismatch risk
- brand voice
- serious-content tone exception
- missing Danny approval
- READ_ONLY_REPORT_ONLY compliance
- blocked actions
- output path safety

QA may pass, reject, or escalate.

QA must not silently rewrite and pass its own work.

---

## 15. Handoff object

Every handoff must include a handoff object.

Required fields:

- handoff_id
- from_owner
- to_owner
- from_state
- to_state
- task_id
- task_type
- handoff_reason
- handoff_summary
- required_action
- required_inputs
- attached_outputs
- validation_status
- risk_level
- qa_required
- danny_approval_required
- blockers
- due_priority
- created_at
- accepted_at
- rejected_at
- handoff_status

Allowed handoff_status values:

- pending
- accepted
- rejected
- escalated
- cancelled
- completed

---

## 16. Blocked handoffs

The following handoffs are blocked in the current mode:

- any handoff to live publishing
- any handoff to Supabase write
- any handoff to affiliate URL insertion
- any handoff to trust rating change
- any handoff to live email send
- any handoff to live outreach send
- any handoff to live crawling
- any handoff that bypasses QA for high-risk claims
- any handoff that bypasses Danny for CEO-level decisions
- any handoff without an owner
- any handoff without current_state and next_state
- any handoff without source documents
- any handoff without validation status where validation is required

---

## 17. Required audit trail

Every state change must create an audit record.

Required audit fields:

- audit_id
- task_id
- previous_state
- new_state
- changed_by
- changed_at
- reason
- source_output
- validation_output
- approval_reference
- notes

Future tooling must preserve this audit trail locally before any later Safe Apply workflow exists.

---

## 18. Build 60 acceptance criteria

Build 60 is acceptable only if it:

1. Defines controlled task states.
2. Defines allowed and blocked task states.
3. Defines task ownership.
4. Defines allowed handoff routes.
5. Defines blocked handoff routes.
6. Preserves Danny as CEO-level final authority.
7. Preserves The Gaffer as AI management filter.
8. Preserves Gatekeeper Grace as QA/governance gate.
9. Preserves READ_ONLY_REPORT_ONLY mode.
10. Blocks live publishing, Supabase writes, affiliate insertion, rating edits, live outreach, and live email.
11. Connects to Build 59 registry/capability rules.
12. Prepares the path for future validator or runtime implementation.
13. Updates the roadmap and master blueprint.
14. Does not create a live workflow engine.
15. Does not create scripts that mutate website content.

---

## 19. Relationship to Build 61

Build 61 should continue the controlled foundation path.

The next safe build should define one of:

- audit trail and decision log contract
- local workflow state report schema
- state machine validator contract
- manager inbox/router contract

Build 61 must not jump to live publishing, Supabase writes, affiliate insertion, rating changes, email sending, or outreach automation.


---

## 20. Detailed workflow state table

| State | Owner | Meaning | Allowed next states | Blocked next states |
|---|---|---|---|---|
| planned | The Gaffer | Work exists as a proposed item but is not yet queued. | queued, cancelled | in_progress, published, applied_to_site |
| queued | The Gaffer | Work is approved for internal report-only processing. | assigned, cancelled | published, live_updated |
| assigned | Department manager | Work has been assigned to a department or agent. | in_progress, blocked, needs_evidence | needs_Danny_review unless escalated |
| in_progress | Assigned agent | Agent is preparing a report, draft, validation, or analysis. | report_ready, blocked, needs_evidence | QA_passed, Danny_approved, published |
| blocked | Department manager | Work cannot proceed without an input, rule, decision, or fix. | needs_manager_review, needs_evidence, cancelled | published, applied_to_site |
| needs_evidence | Research & Intelligence manager | Evidence, proof, source material, or Danny-added support is missing. | assigned, blocked, needs_manager_review | report_ready without evidence status |
| report_ready | Owning manager | Report-only output is complete and waiting for validation or review. | validation_ready, needs_manager_review, needs_QA | published, applied_to_site |
| validation_ready | Validator owner | Output is ready for schema, safety, or contract validation. | validation_passed, validation_failed | QA_passed without validation result |
| validation_failed | Owning manager | Output failed required checks. | in_progress, needs_evidence, blocked | QA_passed, ready_for_internal_use |
| validation_passed | The Gaffer or Gatekeeper Grace | Output passed required validation. | needs_manager_review, needs_QA, ready_for_internal_use | published, applied_to_site |
| needs_manager_review | Department manager | Manager must accept, reject, route, or escalate. | needs_QA, needs_cross_department_review, needs_the_gaffer_review, ready_for_internal_use, in_progress | Danny_approved |
| needs_cross_department_review | Relevant department managers | More than one department must review routing or content. | needs_manager_review, needs_QA, needs_the_gaffer_review | direct Danny escalation unless critical |
| needs_QA | Gatekeeper Grace | QA/governance review is required. | QA_in_progress | published, ready_for_internal_use |
| QA_in_progress | Gatekeeper Grace | QA is checking evidence, claims, risk, tone, disclosure, and blocked actions. | QA_passed, QA_rejected, needs_the_gaffer_review | published, applied_to_site |
| QA_rejected | Owning manager | QA has rejected the output. | in_progress, needs_evidence, needs_manager_review, blocked | ready_for_internal_use |
| QA_passed | Gatekeeper Grace | QA has passed the output for internal use or escalation. | needs_the_gaffer_review, needs_Danny_review, ready_for_internal_use | published in current mode |
| needs_the_gaffer_review | The Gaffer | Executive AI review is needed for prioritisation, routing, conflict, or non-critical approval. | ready_for_internal_use, needs_Danny_review, needs_manager_review, archived | published |
| needs_Danny_review | Danny | CEO-level human decision is required. | Danny_approved, Danny_rejected | published without later Safe Apply |
| Danny_approved | Danny | Danny approved the specific CEO-level decision. | ready_for_internal_use, needs_the_gaffer_review | live action unless future Safe Apply exists |
| Danny_rejected | Danny | Danny rejected the decision or direction. | cancelled, needs_the_gaffer_review, needs_evidence | ready_for_internal_use unless reworked |
| ready_for_internal_use | The Gaffer | Output is accepted for internal planning/report-only use. | archived, planned | published, applied_to_site |
| archived | The Gaffer | Work is closed and stored. | planned only if reopened | published |
| cancelled | The Gaffer | Work is stopped. | planned only if restarted | in_progress without new assignment |

---

## 21. Risk levels

Allowed risk_level values:

- low
- medium
- high
- critical

Low risk examples:

- formatting a local report
- adding a non-live planning note
- summarising internal roadmap status
- identifying missing fields in a local file

Medium risk examples:

- SEO recommendations
- keyword opportunities
- internal link recommendations
- content structure changes
- affiliate opportunity notes without insertion

High risk examples:

- review safety wording
- rating or trust status recommendations
- affiliate disclosure issues
- public claims about deposits, withdrawals, KYC, fees, or testing
- serious warning page recommendations

Critical risk examples:

- scam/fraud/legal wording
- trust rating changes
- publishing decisions
- affiliate link insertion
- outreach or email sending
- Safe Apply activation
- overriding QA rejection
- deleting or replacing live content

---

## 22. Risk routing rules

Risk routing must follow this pattern:

| Risk level | Minimum required route |
|---|---|
| low | assigned agent -> manager |
| medium | assigned agent -> manager -> The Gaffer if priority decision is needed |
| high | assigned agent -> manager -> Gatekeeper Grace -> The Gaffer |
| critical | assigned agent -> manager -> Gatekeeper Grace -> The Gaffer -> Danny |

Danny should not receive low or medium items unless The Gaffer escalates them for a CEO-level reason.

Critical items must not be auto-approved by agents, managers, validators, or The Gaffer.

---

## 23. Department handoff routes

Allowed department-to-department handoffs:

| From department | To department | Allowed purpose |
|---|---|---|
| Content Operations | Research & Intelligence | Missing evidence, source support, proof gaps |
| Content Operations | SEO | Metadata, search intent, internal linking, keyword fit |
| Content Operations | Media | Screenshot, image, video, table, or visual requirement planning |
| Content Operations | QA & Governance | Claim, wording, disclosure, rating, or safety review |
| SEO | Content Operations | Page structure or content update recommendation |
| SEO | Analytics & Lifecycle | Performance opportunity prioritisation |
| Research & Intelligence | Content Operations | Evidence handoff for article or page rebuild |
| Research & Intelligence | QA & Governance | Sensitive source, unsupported claim, scam/fraud/legal risk |
| Media | Content Operations | Media placement plan or required asset list |
| Social & Distribution | Brand Governance | Tone, positioning, channel suitability |
| Social & Distribution | QA & Governance | Public-risk social or outreach copy |
| Analytics & Lifecycle | SEO | Search performance or ranking opportunity |
| Analytics & Lifecycle | Content Operations | Refresh recommendation for stale or weak content |
| Affiliate / Partnerships | QA & Governance | Disclosure, conflict, commercial-risk review |
| Affiliate / Partnerships | The Gaffer | Priority or commercial opportunity routing |
| QA & Governance | The Gaffer | Escalation, rejection, or approval recommendation |
| The Gaffer | Danny | CEO-level decision only |

No department may hand off directly to live publishing in the current mode.

---

## 24. Manager acceptance rules

A department manager may accept a handoff only where:

- the task has a valid task_id
- the task_type is allowed
- the current_state is allowed
- the previous owner is identified
- the requested next state is allowed
- required source documents are attached or referenced
- required validation status is present where applicable
- risk_level is not understated
- blockers are listed
- QA requirement is explicit
- Danny approval requirement is explicit
- no blocked action is requested

If any of these are missing, the manager must reject or return the handoff.

---

## 25. Agent completion rules

An assigned agent may mark work as report_ready only where:

- output is local/report-only
- source documents are listed
- evidence status is stated
- assumptions are stated
- proof gaps are listed
- blocked actions are listed
- risk_level is assigned
- QA_required is set
- Danny_approval_required is set
- allowed_next_states are listed
- no live action has been taken
- no approval has been invented

Agents must not mark their own output as QA_passed, Danny_approved, published, or applied_to_site.

---

## 26. Validator completion rules

A validator may mark work as validation_passed only where:

- the output follows the required schema or contract
- required fields are present
- source documents are present
- validation findings are local/report-only
- blocked actions are not attempted
- publication_ready remains false in READ_ONLY_REPORT_ONLY mode
- QA and Danny routing flags are correct
- validation report path is recorded

A validator must mark validation_failed where:

- required fields are missing
- source documents are missing
- risk routing is missing
- safety fields are missing
- blocked action appears
- output implies publishing
- output implies Supabase write
- output implies affiliate insertion
- output implies rating change
- Danny approval is invented or bypassed
- QA is bypassed for high-risk items

---

## 27. QA pass rules

Gatekeeper Grace may mark QA_passed only where:

- evidence support is adequate for the current output
- unsupported claims are removed or flagged
- scam/fraud/legal wording is absent or routed for Danny approval
- affiliate disclosures are present where needed
- rating and trust language is safe
- brand voice matches the page type
- serious-content tone exception is respected
- proof gaps are clearly labelled
- Danny review queue exists where needed
- no blocked action is attempted
- output remains READ_ONLY_REPORT_ONLY

QA pass does not mean publish approval.

---

## 28. Danny review queue rules

Danny review items must be concise and CEO-level.

Each Danny review item must include:

- decision_id
- task_id
- decision_required
- why_Danny_is_needed
- risk_level
- recommended_option
- alternatives
- evidence_summary
- QA_position
- The_Gaffer_position
- deadline_or_priority
- consequences_of_no_decision

Danny review items must not include low-level noise that managers or The Gaffer can resolve.

---

## 29. Handoff failure reasons

Allowed handoff rejection reasons:

- missing_task_id
- invalid_task_type
- invalid_current_state
- invalid_next_state
- missing_owner
- missing_manager
- missing_agent
- missing_source_documents
- missing_output_path
- missing_validation_status
- missing_evidence_status
- risk_level_understated
- QA_required_but_missing
- Danny_required_but_missing
- blocked_action_requested
- live_action_requested
- unsupported_claim_risk
- affiliate_risk_unresolved
- trust_rating_risk_unresolved
- scam_fraud_legal_risk_unresolved
- not_READ_ONLY_REPORT_ONLY
- duplicate_task
- out_of_scope_for_department

---

## 30. Audit trail state event schema

Every workflow state event must include:

- event_id
- task_id
- event_type
- previous_state
- new_state
- owner_before
- owner_after
- changed_by
- changed_at
- reason
- source_document_paths
- output_paths
- validation_paths
- evidence_status
- risk_level
- QA_required
- Danny_approval_required
- blockers_before
- blockers_after
- notes

Allowed event_type values:

- task_created
- task_queued
- task_assigned
- state_changed
- handoff_created
- handoff_accepted
- handoff_rejected
- validation_passed
- validation_failed
- QA_passed
- QA_rejected
- escalated_to_gaffer
- escalated_to_Danny
- Danny_approved
- Danny_rejected
- task_archived
- task_cancelled

---

## 31. Duplicate work protection

Before creating a new task, future tooling must check for:

- same task_type
- same page or review target
- same source document
- same assigned agent
- same open current_state
- same output path

If a duplicate exists, the new task must be blocked or linked to the existing task.

No future agent should create parallel untracked versions of the same work.

---

## 32. Output path rules

Allowed local/report-only output paths:

- cw-content-brain/data/reports/
- cw-content-brain/data/rebuilds/
- cw-content-brain/data/validations/
- cw-content-brain/data/qa/
- cw-content-brain/data/approvals/
- cw-content-brain/data/audit/
- cw-content-brain/data/workflow/
- cw-content-brain/docs/

Blocked output paths in current mode:

- src/
- public/
- supabase/
- live website content tables
- production CMS paths
- external email systems
- affiliate platforms
- Search Console write paths
- Analytics write paths
- Semrush write paths

Future read-only imports from Search Console, Analytics, or Semrush may be planned, but live mutation remains blocked.

---

## 33. CEO-level approval filter

The Gaffer must filter Danny review requests.

Before sending anything to Danny, The Gaffer must confirm:

- Is this actually CEO-level?
- Can a department manager resolve it?
- Can QA resolve it?
- Can another specialist provide evidence?
- Is the decision strategic, reputational, legal, rating-related, affiliate-related, publishing-related, or approval-related?
- Is the risk high or critical?
- Is the recommended option clear?
- Is the evidence summary clear?
- Is the decision small enough for Danny to answer quickly?

If no, the item should not go to Danny.

It should go back to the relevant manager or agent.

---

## 34. Future data connector routing

Future connectors may include:

- Google Search Console
- Google Analytics
- Semrush
- affiliate dashboards
- email inboxes
- social analytics
- backlink tools
- crawler outputs

Initial connector mode must be:

READ_ONLY_IMPORT_ONLY

Connector outputs must route through:

1. local import report
2. validation report
3. relevant department manager
4. The Gaffer where prioritisation is needed
5. Gatekeeper Grace where public risk exists
6. Danny only for CEO-level decisions

Connectors must not directly trigger live edits, email sends, affiliate insertions, or publishing.

---

## 35. Marketing and affiliate outreach routing

Future marketing/outreach agents are possible, but they must use this workflow.

Allowed current-mode actions:

- identify affiliate opportunities
- prepare outreach drafts
- prepare application notes
- prepare partner research reports
- prepare email response drafts
- prepare negotiation notes
- route commercial-risk items to The Gaffer
- route disclosure/conflict issues to Gatekeeper Grace
- route critical partnership decisions to Danny

Blocked current-mode actions:

- sending outreach emails
- submitting affiliate applications
- replying to emails
- agreeing commercial terms
- inserting affiliate links
- changing disclosures
- claiming partnership status
- creating live public affiliate claims

A future approved workflow may allow controlled sending, but only with explicit permission, logging, approval gates, and rollback/incident rules.

---

## 36. Build 60 validation checklist

A future validator for this contract must confirm:

- task_id exists
- task_type is allowed
- current_state is allowed
- blocked states are not used
- owner is valid
- department is valid
- manager is valid
- assigned agent is valid where needed
- handoff route is allowed
- rejection route is allowed where applicable
- risk_level is valid
- QA_required is correct
- Danny_approval_required is correct
- output path is allowed
- source documents are listed
- validation paths are listed where needed
- audit trail event is present
- no live action is requested
- no approval is invented
- READ_ONLY_REPORT_ONLY is preserved

---

## 37. Build 60 final lock

Build 60 locks the workflow spine of Watchdog HQ.

Future agents must not behave like loose chatbots.

Future agents must operate as controlled workers inside:

- a task state
- a department
- a manager route
- a capability boundary
- a handoff contract
- a validation layer
- a QA layer
- an approval layer
- an audit trail

This is how Watchdog HQ becomes a real AI company structure rather than a pile of disconnected prompts.


## Required workflow status field

Every future Watchdog HQ task, report, handoff, validation result, QA review item, manager review item, and Danny review item must include a `workflow_status` field.

The `workflow_status` field is the controlled state marker for the work item. It must not be replaced with informal wording such as done, pending, waiting, okay, failed, or approved.

Allowed `workflow_status` values must come from the controlled workflow state machine defined in this contract.

Future agents, managers, validators, routers, QA checks, and audit/event logs must read and preserve `workflow_status` during every handoff.

A handoff is invalid where `workflow_status` is missing, unclear, unsupported, or inconsistent with the current evidence, validation result, approval state, or escalation state.


## Build 60 exact workflow_status control terms

Every workflow item must include workflow_status.

Allowed workflow_status values must come from the controlled workflow state machine in this contract.

A handoff is invalid where workflow_status is missing.

The workflow_status field must be preserved by every agent, manager, validator, QA reviewer, router, audit log, and Danny review queue handoff.

workflow_status must not be replaced with informal wording such as done, pending, okay, passed, failed, or approved.


---

## Build 60 PR verification repair: source_agent and target_agent

Every workflow handoff must identify both the sender and receiver of the work item.

Required handoff fields:

- source_agent
- target_agent

source_agent means the registered agent, manager, validator, QA role, or authorised workflow owner sending the work item forward.

target_agent means the registered agent, manager, validator, QA role, or authorised workflow owner receiving the work item.

A handoff is invalid where source_agent is missing.

A handoff is invalid where target_agent is missing.

source_agent and target_agent must both map back to the locked Agent Registry and Capability Registry.

No workflow handoff may invent an unregistered agent, unregistered manager, or unapproved role.

