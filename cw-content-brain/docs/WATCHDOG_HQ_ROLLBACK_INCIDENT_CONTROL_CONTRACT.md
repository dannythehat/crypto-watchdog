# Watchdog HQ Rollback and Incident Control Contract v1

Build: #62 — Rollback and Incident Control Contract v1  
Status: built / ready for review  
Mode: READ_ONLY_REPORT_ONLY  
Owner: Danny  
Control owner: The Gaffer  
Governance owner: Gatekeeper Grace  
Audit owner: Audit Alfie  
Related contracts:
- WATCHDOG_HQ_MASTER_BLUEPRINT.md
- WATCHDOG_HQ_BUILD_ROADMAP_STATUS.md
- WATCHDOG_HQ_AGENT_REGISTRY_CAPABILITY_REGISTRY.md
- WATCHDOG_HQ_WORKFLOW_STATE_MACHINE_HANDOFF_CONTRACT.md
- WATCHDOG_HQ_AUDIT_TRAIL_EVENT_LOG_CONTRACT.md

---

## 1. Purpose

This contract defines the rollback and incident control rules for Watchdog HQ.

Build 62 exists so future agents, managers, validators, QA gates, workflow handoffs, and approval flows can fail safely without inventing emergency behaviour.

The contract locks:

- incident triggers
- rollback triggers
- blocked action handling
- failed validation handling
- unsafe output handling
- escalation paths
- incident severity levels
- rollback request rules
- incident_opened event requirements
- rollback_requested event requirements
- containment rules
- Danny approval rules
- READ_ONLY_REPORT_ONLY safety limits

This build does not create a live rollback engine.

This build does not create a live incident management system.

This build creates the controlled contract future scripts and agents must follow.

---

## 2. Current Safety Mode

Current system mode remains:

READ_ONLY_REPORT_ONLY

Build 62 does not enable:

- no live publishing
- no Supabase writes
- no affiliate insertion
- no trust-rating edits
- no live crawling
- no AI/API calls
- no approval/apply workflow
- no live content edits
- no deletion of website content
- no rollback of live website content
- no modification of production data
- no secret handling
- no live incident automation

All outputs remain local/report-only unless Danny explicitly approves a future mode change.

---

## 3. Core Principle

Watchdog HQ must fail closed.

If an agent, manager, validator, handoff, workflow state change, draft, report, or future tool action is unsafe, incomplete, unsupported, unauthorised, or outside permissions, the system must block, log, escalate, and wait.

No agent may improvise around a failed control.

No manager may bypass Gatekeeper Grace for risk-related failures.

No specialist may bypass its department manager.

No future automation may self-approve a rollback, publish action, rating change, affiliate insertion, Supabase write, or live edit.

Danny remains the final Human Owner for critical incident and rollback decisions.

---

## 4. Incident Definition

An incident is any event where Watchdog HQ detects or suspects that a workflow, agent, manager, validator, report, draft, handoff, output, or future tool action has become unsafe, uncontrolled, unauthorised, incomplete, misleading, or outside the locked operating model.

An incident can be opened by:

- validator failure
- schema failure
- missing required evidence
- unsupported claim
- unsafe scam/fraud wording
- affiliate disclosure failure
- attempted trust-rating edit
- attempted live publishing
- attempted Supabase write
- attempted affiliate insertion
- attempted live content edit
- attempted deletion
- attempted bypass of Danny approval
- attempted bypass of Gatekeeper Grace
- attempted bypass of manager routing
- workflow_status mismatch
- missing source_agent
- missing target_agent
- invalid handoff
- invalid state transition
- missing audit_event
- missing trace_id
- missing timestamp
- repeated failure loop
- contradictory contract instructions
- blueprint drift
- roadmap drift
- unsafe output generation
- unknown agent identity
- unregistered capability use
- blocked action attempt

---

## 5. Rollback Definition

A rollback is a controlled request to return a document, report, workflow state, contract, branch, PR, configuration, generated output, or future applied change to a previous safe state.

In current READ_ONLY_REPORT_ONLY mode, rollback is documentation and Git-based only.

Current rollback actions may include:

- stop current build
- block staging
- block commit
- block PR creation
- block merge
- revert local uncommitted changes
- revert a committed branch change before merge
- close or supersede a PR
- revert a merged documentation commit using Git
- restore a previous contract wording from Git history
- mark a generated report invalid
- mark a workflow state invalid
- return task to the last safe workflow_status
- open an incident note for Danny review

Current rollback actions must not include:

- live website edits
- Supabase writes
- live publishing
- live unpublishing
- live content deletion
- affiliate link removal or insertion in production
- trust-rating changes
- automated public corrections
- automated legal/scam/fraud updates

---

## 6. Required Incident Event Names

Future audit logs must support at least these incident and rollback event names:

- incident_opened
- incident_updated
- incident_contained
- incident_escalated
- incident_closed
- rollback_requested
- rollback_approved
- rollback_rejected
- rollback_started
- rollback_completed
- rollback_failed
- blocked_action_detected
- validation_failed
- validator_failed
- unsafe_output_blocked
- approval_bypass_detected
- workflow_state_invalid
- handoff_invalid
- capability_violation_detected
- blueprint_drift_detected
- roadmap_drift_detected
- duplicate_write_risk_detected
- unknown_agent_detected

These event names must be treated as controlled vocabulary for future audit_event records.

---

## 7. Required Incident Fields

A future incident record must include:

- incident_id
- trace_id
- created_at
- updated_at
- incident_status
- incident_severity
- incident_type
- opened_by
- owner
- source_agent
- source_manager
- affected_workflow_id
- affected_artifact
- affected_file_path
- affected_build
- affected_branch
- trigger_event
- trigger_reason
- blocked_action
- containment_action
- rollback_required
- rollback_requested
- rollback_status
- danny_review_required
- gatekeeper_review_required
- gaffer_review_required
- audit_event_refs
- resolution_summary
- close_reason

If a field is unknown, it must be marked as unknown, not guessed.

---

## 8. Required Rollback Fields

A future rollback request must include:

- rollback_id
- incident_id
- trace_id
- requested_at
- requested_by
- rollback_reason
- rollback_scope
- rollback_target
- rollback_from_state
- rollback_to_state
- state_before
- state_after
- affected_file_path
- affected_build
- affected_branch
- affected_commit
- approval_required
- approved_by
- approval_status
- rollback_steps
- rollback_result
- rollback_completed_at
- audit_event_refs

If a rollback touches anything beyond local/report-only documentation, Danny approval is required.

---

## 9. Incident Severity Levels

Incident severity must use one of these values:

- info
- low
- medium
- high
- critical

Info means a control noticed something worth recording, but no immediate block is required.

Low means a minor issue exists and can be routed to the owning manager.

Medium means the workflow should pause until the owning manager or Gatekeeper Grace reviews it.

High means the workflow must stop and escalate to Gatekeeper Grace and The Gaffer.

Critical means the workflow must stop immediately and Danny review is required.

---

## 10. Incident Status Values

incident_status must use one of these values:

- opened
- contained
- investigating
- waiting_for_manager
- waiting_for_gatekeeper
- waiting_for_gaffer
- waiting_for_danny
- rollback_requested
- rollback_in_progress
- resolved
- closed
- rejected
- duplicate

An incident must not be marked closed without a resolution_summary and close_reason.

---

## 11. Rollback Status Values

rollback_status must use one of these values:

- not_required
- requested
- waiting_for_approval
- approved
- rejected
- in_progress
- completed
- failed
- cancelled

A rollback must not move to approved unless the required approval owner has been recorded.

A rollback must not move to completed unless state_before, state_after, rollback_steps, rollback_result, and audit_event_refs are recorded.

---

## 12. Mandatory Stop Conditions

A workflow must stop immediately when any of the following are detected:

- attempted live publishing
- attempted Supabase write
- attempted affiliate insertion
- attempted trust-rating edit
- attempted live website edit
- attempted deletion of production content
- attempted bypass of Danny approval
- attempted bypass of Gatekeeper Grace on risk matters
- attempted capability outside registered permissions
- missing workflow_status
- missing source_agent
- missing target_agent
- missing trace_id
- missing audit_event for a state change
- invalid workflow state transition
- invalid handoff
- unsupported scam/fraud accusation
- unsupported safety claim
- missing evidence for a material claim
- blueprint drift
- roadmap drift
- repeated failed validator loop
- unknown agent identity
- unregistered manager identity

When a mandatory stop condition occurs, the system must open incident_opened and block further workflow progress.

---

## 13. Danny Approval Rules

Danny approval is required for:

- critical incidents
- high-risk brand decisions
- trust-rating changes
- scam/fraud/legal wording decisions
- public corrections
- live website changes
- Supabase writes
- affiliate insertion or removal in production
- publishing
- unpublishing
- deletion
- rollback of a merged main-branch change where the impact is unclear
- any override of Gatekeeper Grace
- any override of a failed validator
- any mode change away from READ_ONLY_REPORT_ONLY

Danny should receive CEO-level exceptions only.

Routine non-critical operational items should route through the AI management layer first.

---

## 14. Gatekeeper Grace Rules

Gatekeeper Grace must review:

- unsafe claims
- unsupported claims
- scam/fraud wording
- affiliate risk
- trust-rating risk
- legal or regulatory sensitivity
- serious-content tone failures
- evidence gaps affecting user trust
- attempted approval bypasses
- high and critical incidents

Gatekeeper Grace may block, reject, escalate, or request more evidence.

Gatekeeper Grace does not publish, apply, write to Supabase, or approve live changes.

---

## 15. The Gaffer Rules

The Gaffer owns incident prioritisation and operational noise filtering.

The Gaffer may:

- triage non-critical incidents
- assign an owning manager
- route to Gatekeeper Grace
- escalate to Danny
- recommend rollback
- recommend closing duplicate incidents
- keep Danny away from minor operational clutter

The Gaffer must not override Danny approval requirements.

The Gaffer must not override Gatekeeper Grace on safety, evidence, rating, affiliate, legal, scam/fraud, or public trust issues.

---

## 16. Audit Alfie Rules

Audit Alfie owns audit trail completeness.

Audit Alfie must ensure incident and rollback records include:

- trace_id
- timestamp
- actor
- event name
- state_before
- state_after
- affected artifact
- reason
- decision owner
- approval status
- resolution summary

Audit Alfie does not approve the underlying business decision.

Audit Alfie confirms whether the record is complete enough to understand what happened.

---

## 17. Relationship To Build 61

Build 61 defines the audit trail and event log contract.

Build 62 defines what happens when those events show something has gone wrong.

Build 62 depends on Build 61 audit_event records for:

- incident_opened
- rollback_requested
- state_changed
- validator_failed
- validation_failed
- manager_reviewed
- qa_reviewed
- danny_review_required
- blocked_action_detected
- workflow_state_invalid
- handoff_invalid

Future rollback and incident records must reference the relevant audit_event records.

---

## 18. Relationship To Build 60

Build 60 defines workflow_status and handoff rules.

Build 62 defines how to respond when workflow_status, source_agent, target_agent, routing, handoff, or transition rules are missing, invalid, unsafe, or bypassed.

Any invalid handoff must be treated as an incident candidate.

Any missing workflow_status must block progression.

Any missing source_agent or target_agent must block progression.

---

## 19. Relationship To Build 59

Build 59 defines registered agents, managers, capabilities, permissions, blocked actions, and escalation rules.

Build 62 defines how to respond when an agent or manager acts outside that registry.

Unregistered agent actions must be blocked.

Unregistered capability use must be blocked.

Blocked action attempts must open an incident.

---

## 20. Build 62 Scope Lock

Build 62 is a control contract only.

It creates no runtime script.

It creates no live incident dashboard.

It creates no live rollback tool.

It creates no database tables.

It writes no audit logs to Supabase.

It changes no website content.

It changes no trust ratings.

It inserts no affiliate links.

It publishes nothing.

It only defines the rules future systems must follow.

---

## 21. Completion Criteria For Build 62

Build 62 is complete when:

1. This contract exists.
2. Incident triggers are defined.
3. Rollback triggers are defined.
4. Incident statuses are defined.
5. Rollback statuses are defined.
6. Mandatory stop conditions are defined.
7. Danny approval rules are defined.
8. Gatekeeper Grace rules are defined.
9. The Gaffer rules are defined.
10. Audit Alfie rules are defined.
11. Safety locks are preserved.
12. Blueprint references Build 62.
13. Roadmap marks Build 62 built / ready for review.
14. Roadmap points to the next readiness checkpoint.

---

## 22. Next Step After Build 62

After Build 62, the foundation-control module should move to a short readiness checkpoint.

That checkpoint should confirm whether Watchdog HQ now has enough foundation contracts to begin the next phase of agent-layer work without inventing rules.

The next phase should not add random agents.

The next phase should start from the locked foundation contracts and build the first practical controlled agent workflow.

---

## 23. Incident Type Values

incident_type must use a controlled value.

Allowed incident_type values are:

- validation_failure
- validator_failure
- schema_failure
- workflow_state_failure
- handoff_failure
- permission_failure
- capability_violation
- blocked_action_attempt
- unsafe_output
- unsupported_claim
- evidence_gap
- affiliate_risk
- rating_risk
- scam_fraud_wording_risk
- legal_or_regulatory_risk
- approval_bypass
- manager_bypass
- gatekeeper_bypass
- danny_approval_bypass
- blueprint_drift
- roadmap_drift
- duplicate_write_risk
- repeated_failure_loop
- unknown_agent
- unknown_manager
- unknown_capability
- audit_event_missing
- trace_id_missing
- timestamp_missing
- rollback_failure
- incident_control_failure

Unknown or vague incident types are not allowed.

If the exact incident type is unclear, the incident must be marked as incident_control_failure and escalated to The Gaffer.

---

## 24. Blocked Action Handling

A blocked action attempt must never be treated as a harmless warning.

When a blocked action is detected:

1. Stop the workflow.
2. Preserve the current artifact.
3. Do not retry automatically.
4. Create or require incident_opened.
5. Record blocked_action_detected.
6. Capture source_agent, target_agent, workflow_status, trace_id, and affected artifact.
7. Route to the owning manager.
8. Route to Gatekeeper Grace when safety, evidence, affiliate, rating, legal, scam/fraud, or public trust risk exists.
9. Route to The Gaffer where cross-department priority, escalation, or roadmap impact exists.
10. Route to Danny only where the issue is critical or needs Human Owner judgement.

Blocked actions include:

- no live publishing
- no Supabase writes
- no affiliate insertion
- no trust-rating edits
- no live website edits
- no production deletion
- no secret handling
- no live crawling
- no AI/API calls
- no approval/apply workflow
- no unauthorised mode change

A blocked action must not be converted into a workaround.

---

## 25. Failed Validation Handling

A failed validation must create a controlled stop or return path.

If validation_failed or validator_failed occurs:

- workflow_status must not advance to approved
- workflow_status must not advance to ready_for_danny
- workflow_status must not advance to ready_for_publish
- the failing validator must be named
- the failed rule must be recorded
- the failed field must be recorded where possible
- the affected artifact must be recorded
- the owning manager must be identified
- the next allowed state must be either blocked, needs_revision, needs_manager_review, needs_qa, or incident_opened

A validator failure is not an instruction to weaken the validator.

A validator failure is not an instruction to delete required terms.

A validator failure is not an instruction to bypass the contract.

---

## 26. Unsafe Output Handling

Unsafe output must be blocked before it reaches Danny as a decision-ready item.

Unsafe output includes:

- unsupported scam wording
- unsupported fraud wording
- unsupported legal conclusions
- unsupported safety claims
- invented evidence
- invented testing proof
- invented screenshots
- invented deposit or withdrawal results
- invented KYC notes
- invented fees
- invented support conversations
- unapproved affiliate recommendations
- unapproved rating changes
- serious-content humour
- misleading certainty
- missing proof gaps
- hidden uncertainty
- output that ignores READ_ONLY_REPORT_ONLY

Unsafe output must route to Gatekeeper Grace.

If unsafe output has already been staged, committed, or included in a PR, The Gaffer must decide whether to repair on branch, revert on branch, close the PR, or request Danny review.

---

## 27. Blueprint Drift Handling

Blueprint drift means a build, agent, manager, report, workflow, or contract has started moving away from the locked Watchdog HQ vision.

Blueprint drift includes:

- inventing new operating rules without updating the blueprint
- adding agents without registry alignment
- adding capabilities without permission alignment
- changing safety mode without Danny approval
- changing page/template direction without blueprint update
- changing workflow states without Build 60 alignment
- changing audit events without Build 61 alignment
- changing rollback rules without Build 62 alignment
- skipping roadmap status updates
- marking a build complete without the locked output
- allowing the next build to become unclear

Blueprint drift must trigger blueprint_drift_detected.

If roadmap status is wrong, roadmap_drift_detected must also be recorded.

Blueprint drift requires The Gaffer review.

Material blueprint drift requires Danny review.

---

## 28. Rollback Trigger Rules

rollback_requested must be considered when:

- a build changes the wrong files
- a build creates duplicate control documents
- a build breaks safety locks
- a build removes READ_ONLY_REPORT_ONLY
- a build weakens Danny approval rules
- a build weakens Gatekeeper Grace review rules
- a build weakens audit requirements
- a build weakens workflow state requirements
- a build creates uncontrolled live-action wording
- a PR includes unrelated changes
- a commit includes generated reports that should not be committed
- a validator was bypassed
- a branch contains accidental code changes
- a merged contract causes roadmap drift
- a future script writes to the wrong path
- a future script writes when it should report only

Rollback is not always required.

The first response should be containment.

Rollback is required only when containment and repair are not enough to restore the safe state.

---

## 29. Containment Before Rollback

Containment must happen before rollback unless the risk is critical.

Containment actions include:

- stop the workflow
- keep the branch open
- do not stage
- do not commit
- do not push
- do not merge
- mark artifact invalid
- route to manager
- route to Gatekeeper Grace
- route to The Gaffer
- request Danny review
- create a repair patch
- create a revert patch
- close duplicate PR
- supersede unsafe PR

Containment must be recorded using containment_action.

A contained incident can still require rollback later.

---

## 30. Git Rollback Rules In Current Mode

Because the current mode is READ_ONLY_REPORT_ONLY, rollback is Git/documentation focused.

Allowed Git rollback actions are:

- discard uncommitted file changes after review
- restore a file from HEAD
- restore a file from a known safe commit
- create a corrective commit on the branch
- revert a branch commit before PR merge
- revert a merged PR using a new PR
- close a bad PR and create a clean branch
- delete a local branch after safe merge or abandonment
- delete a remote feature branch after safe merge or abandonment

Not allowed without Danny approval:

- force-push to shared branches
- reset main
- rewrite main history
- delete main branch
- delete production content
- alter Supabase
- change live website content
- alter ratings
- alter affiliate links
- alter published articles

Main branch must be protected by PR review and local verification.

---

## 31. Incident Routing Matrix

Incidents must route by risk type.

| Incident area | First owner | Governance owner | Escalation |
|---|---|---|---|
| Wrong workflow_status | Owning manager | Audit Alfie | The Gaffer |
| Invalid handoff | Owning manager | Audit Alfie | The Gaffer |
| Missing audit_event | Audit Alfie | The Gaffer | Danny if critical |
| Validator failure | Owning manager | Gatekeeper Grace if risk exists | The Gaffer |
| Unsafe claim | Gatekeeper Grace | The Gaffer | Danny if material |
| Scam/fraud wording | Gatekeeper Grace | The Gaffer | Danny |
| Rating risk | Gatekeeper Grace | The Gaffer | Danny |
| Affiliate risk | Gatekeeper Grace | The Gaffer | Danny if public-facing |
| Blueprint drift | The Gaffer | Audit Alfie | Danny if material |
| Roadmap drift | The Gaffer | Audit Alfie | Danny if material |
| Blocked action attempt | The Gaffer | Gatekeeper Grace | Danny if high/critical |
| Unknown agent | The Gaffer | Audit Alfie | Danny if repeated |
| Capability violation | Owning manager | Gatekeeper Grace | The Gaffer |
| Live write attempt | The Gaffer | Gatekeeper Grace | Danny |
| Supabase write attempt | The Gaffer | Gatekeeper Grace | Danny |
| Publishing attempt | The Gaffer | Gatekeeper Grace | Danny |

---

## 32. Severity Assignment Rules

Severity must be assigned conservatively.

Use info where:

- an audit note is useful but no workflow risk exists
- a duplicate event is detected but harmless
- a minor routing note is recorded

Use low where:

- a minor required field is missing but the artifact is not decision-ready
- a manager can fix the issue without risk
- no public trust issue exists

Use medium where:

- workflow progression should pause
- a validator failed
- a required handoff field is missing
- a report is incomplete
- a manager must review before progression

Use high where:

- Gatekeeper Grace must review
- public trust risk exists
- rating risk exists
- affiliate risk exists
- legal or scam/fraud wording risk exists
- blocked action was attempted
- blueprint drift may affect future builds

Use critical where:

- Danny approval may have been bypassed
- live publishing was attempted
- Supabase write was attempted
- trust-rating edit was attempted
- affiliate insertion was attempted
- live website edit was attempted
- production deletion was attempted
- serious unsupported accusation was created
- a control was intentionally bypassed

---

## 33. Repeated Failure Loop Rules

A repeated failure loop occurs when the same workflow, validator, agent, manager, file, or build fails repeatedly for the same reason.

Repeated failure loop examples:

- the same required term is repeatedly missing
- the same validator fails after multiple repairs
- the same agent repeatedly attempts blocked actions
- the same workflow_status transition keeps failing
- the same roadmap next-build status keeps drifting
- the same safety lock keeps being omitted

Repeated failure loops must trigger repeated_failure_loop.

The Gaffer must decide whether to:

- pause the build
- simplify the patch
- create a smaller repair
- route to Audit Alfie
- route to Gatekeeper Grace
- request Danny review
- abandon and restart the branch

Repeated failure loops must not be solved by weakening controls.

---

## 34. Approval Override Rules

A failed control can only be overridden where the contract explicitly allows it.

No one may override:

- READ_ONLY_REPORT_ONLY
- Danny approval for critical decisions
- Gatekeeper Grace for safety/risk review
- evidence requirements for material claims
- audit_event requirements for state changes
- workflow_status requirements
- registered capability boundaries
- blocked action rules

Any proposed override must include:

- override_requested
- override_reason
- requested_by
- approving_owner
- approval_status
- risk_summary
- affected_artifact
- audit_event_refs

Only Danny can approve critical overrides.

---

## 35. Incident Closure Rules

An incident cannot be closed just because the immediate error disappeared.

incident_closed requires:

- incident_id
- trace_id
- incident_status = closed
- resolution_summary
- close_reason
- owner
- final reviewer
- audit_event_refs
- confirmation that no blocked action remains
- confirmation that roadmap and blueprint are not drifting
- confirmation that any rollback_required value is resolved

Allowed close_reason values are:

- repaired
- rolled_back
- duplicate
- false_alarm
- superseded
- accepted_risk_with_danny_approval
- no_action_required_after_review

accepted_risk_with_danny_approval can only be used when Danny approval is recorded.

---

## 36. Rollback Completion Rules

rollback_completed requires:

- rollback_id
- incident_id
- trace_id
- rollback_status = completed
- rollback_from_state
- rollback_to_state
- state_before
- state_after
- rollback_steps
- rollback_result
- completed_by
- completed_at
- audit_event_refs

A rollback must not be described as completed where the result is unknown.

If the result is unknown, rollback_status must be failed or waiting_for_review.

---

## 37. Future Script Requirements

Future scripts that implement this contract must:

- run locally first
- report only by default
- require explicit path checks
- verify branch before changes
- verify clean working tree before changes
- verify expected changed files only
- block unexpected file changes
- avoid secrets
- avoid live API calls unless a future approved mode allows them
- avoid Supabase writes
- avoid website writes
- avoid publishing
- create deterministic output
- include trace_id
- include timestamp
- include source_agent
- include workflow_status
- include audit_event references where applicable

Future scripts must fail closed.

---

## 38. Foundation Module Completion Marker

Build 62 completes the first foundation-control contract set.

The foundation-control set now includes:

1. Foundations readiness audit
2. Hive operating model
3. Agent Registry and Capability Registry
4. Workflow State Machine and Handoff Contract
5. Audit Trail and Event Log Contract
6. Rollback and Incident Control Contract

Before starting broad agent expansion, the next checkpoint must confirm:

- agents have identities
- capabilities are registered
- workflow states are controlled
- handoffs are controlled
- audit events are controlled
- incidents are controlled
- rollback rules are controlled
- Danny approval rules are preserved
- Gatekeeper Grace governance is preserved
- READ_ONLY_REPORT_ONLY remains active

---

## 39. Build 62 Final Safety Statement

Build 62 strengthens control.

It does not loosen control.

It does not move Watchdog HQ closer to live publishing.

It does not enable Supabase writes.

It does not enable affiliate insertion.

It does not enable trust-rating edits.

It does not enable live website edits.

It does not enable live rollback automation.

It keeps Watchdog HQ safe, auditable, and ready for the next controlled phase.

## Build 62 exact recovery and rollback field locks

The rollback and incident control contract must preserve the following exact recovery fields for future validators and agents.

### recovery_action

`recovery_action` is the required field that records the safe report-only recovery step proposed or completed after a blocked action, failed validation, unsafe workflow state, failed handoff, unsafe claim, attempted permission breach, or governance escalation.

Allowed `recovery_action` examples include:

- reject_to_source_agent
- reroute_to_manager
- reroute_to_gatekeeper_grace
- escalate_to_the_gaffer
- escalate_to_danny
- request_missing_evidence
- quarantine_report_output
- restore_previous_report_version
- require_manual_review
- mark_as_no_action_taken

A `recovery_action` must never perform live publishing, no Supabase writes, no affiliate insertion, no trust-rating edits, live site edits, or destructive changes.

### rollback_plan

`rollback_plan` is the required field that records the controlled report-only rollback plan before any rollback-related recommendation is considered complete.

A valid `rollback_plan` must state:

- what changed
- what failed
- which artifact, output, or workflow state is affected
- state_before
- state_after
- safest restoration target
- owning manager
- whether Gatekeeper Grace review is required
- whether The Gaffer review is required
- whether Danny review is required
- expected recovery_action
- audit event references
- confirmation that the plan remains READ_ONLY_REPORT_ONLY

A `rollback_plan` is invalid if it proposes live publishing, Supabase writes, affiliate insertion, trust-rating edits, live site edits, deletion of production content, or any action outside the approved capability registry.


---

## Build 62 exact verification terms

This section locks exact terms required by the Build 62 verification harness.

### Incident ownership field

Every incident report must include `incident_owner`.

`incident_owner` identifies the accountable owner for the incident, recovery review, escalation route, and closure recommendation.

Allowed `incident_owner` examples include:

- The Gaffer
- Gatekeeper Grace
- Audit Alfie
- owning department manager
- Danny, only for CEO-level final decisions

An incident is incomplete where `incident_owner` is missing.

### Failed validation trigger

The event type `failed_validation` must be logged when a validator, harness, schema check, QA check, safety check, roadmap check, blueprint check, or local verification step fails.

A `failed_validation` event must include:

- validation name
- failed term or failed check
- source document or report
- state_before
- state_after, where relevant
- recovery_action
- incident_owner
- whether Danny review is required

### Permission breach trigger

The event type `permission_breach` must be logged when an agent, manager, script, workflow, or future connector attempts an action outside its allowed capability or permission boundary.

A `permission_breach` event must be opened for attempted:

- no live publishing breach
- no Supabase writes breach
- no affiliate insertion breach
- no trust-rating edits breach
- unsafe rating change
- unsafe scam or fraud accusation
- bypass of manager review
- bypass of QA
- bypass of Danny approval
- unapproved cross-department handoff
- unapproved apply/publish/write action

### Unsafe handoff trigger

The event type `unsafe_handoff` must be logged when a handoff violates the Build 60 Workflow State Machine and Handoff Contract.

An `unsafe_handoff` event must be opened where:

- source_agent is missing
- target_agent is missing
- workflow_status is missing
- owning department is missing
- owning manager is missing
- approval_required is ignored
- QA requirement is skipped
- Danny review requirement is skipped
- blocked action is routed forward
- evidence gaps are hidden
- rejection reasons are missing
- escalation route is missing

No `unsafe_handoff` may move forward until the issue has a recovery_action, incident_owner, and closure recommendation.

