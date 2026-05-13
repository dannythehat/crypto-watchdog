# Watchdog HQ Audit Trail and Event Log Contract v1

Build: #61 - Audit Trail and Event Log Contract v1
Status: built / ready for review
Owner: Danny
System: Watchdog HQ / CryptoWatchdog Content Brain
Mode: READ_ONLY_REPORT_ONLY
Locked output: cw-content-brain/docs/WATCHDOG_HQ_AUDIT_TRAIL_EVENT_LOG_CONTRACT.md

---

## 1. Purpose

This contract defines how Watchdog HQ records audit trail events, workflow state changes, handoffs, validations, approvals, rejections, escalations, routing decisions, blocked actions, and rollback references.

Every important action must leave a trace.

Watchdog HQ must always be able to answer:

- who acted
- what happened
- when it happened
- why it happened
- what changed
- what evidence or input was used
- what workflow_status existed before
- what workflow_status exists after
- who received the next handoff
- whether Danny, QA, The Gaffer, or a department manager needs review
- whether a blocked action was attempted
- whether rollback is possible
- which blueprint, registry, workflow, schema, or validator controlled the action

---

## 2. Current safety mode

Current system mode remains READ_ONLY_REPORT_ONLY.

Build 61 does not create live scripts, publish content, write to Supabase, edit website pages, insert affiliate links, change trust ratings, send emails, contact affiliate companies, call AI APIs, crawl live sites, or enable approval/apply workflows.

Blocked actions remain:

- no live publishing
- no Supabase writes
- no affiliate insertion
- no trust-rating edits
- no live outreach
- no email sending
- no approval/apply workflow
- no website edits
- no external crawling unless explicitly approved in a future build
- no AI/API calls unless explicitly approved in a future build
- no scam/fraud/legal claims without verified evidence and Danny approval
- no bypassing Danny, Gatekeeper Grace, The Gaffer, department managers, or locked workflow states

---

## 3. Relationship to Build 59 and Build 60

Build 59 locked the Agent Registry and Capability Registry.

Build 60 locked the Workflow State Machine and Handoff Contract.

Build 61 adds the audit layer around those foundations.

Every future audit_event must connect back to:

- a registered actor from the agent registry
- an allowed capability from the capability registry
- a workflow_id
- a valid workflow_status
- a valid event_type
- a source state
- a target state where applicable
- source_agent and target_agent where a handoff happens
- the controlling document or contract
- the relevant approval, rejection, escalation, validation, or routing rule

---

## 4. Required audit_event object

Every audit_event must include these required fields:

event_id
trace_id
workflow_id
handoff_id
event_type
event_timestamp_utc
actor_type
actor_id
actor_name
source_agent
target_agent
source_department
target_department
workflow_status_before
workflow_status_after
action_summary
decision_summary
input_reference
output_reference
controlling_contract
capability_used
permission_check
safety_check
approval_status
rejection_reason
escalation_reason
blocked_action
rollback_reference
notes

---

## 5. Core field rules

event_id must be unique.

trace_id connects related events across one workflow journey.

workflow_id identifies the workflow item being acted on.

handoff_id is required where work transfers from one actor, agent, manager, department, or queue to another.

event_type defines what happened.

event_timestamp_utc must use UTC time.

actor_type defines who or what acted.

actor_id must match the Agent Registry / Capability Registry where applicable.

actor_name must be human readable.

source_agent is required for handoff events.

target_agent is required for handoff events.

workflow_status_before must match Build 60 workflow status rules.

workflow_status_after must match Build 60 workflow status rules.

approval_status must show whether approval is not required, pending, approved, rejected, blocked, or invalid.

rejection_reason is required where work is rejected.

escalation_reason is required where work is escalated.

blocked_action is required where a blocked action is detected.

rollback_reference is required where rollback is needed.

---

## 6. Allowed event_type values

Allowed event_type values include:

- workflow_created
- workflow_status_changed
- handoff_created
- handoff_received
- handoff_rejected
- agent_assigned
- manager_review_started
- manager_review_completed
- QA_review_started
- QA_review_completed
- Danny_review_requested
- Danny_decision_recorded
- validation_started
- validation_completed
- validation_failed
- evidence_received
- evidence_missing
- evidence_rejected
- rebuild_report_created
- rebuild_report_validated
- draft_package_created
- draft_package_rejected
- route_created
- route_changed
- escalation_created
- escalation_resolved
- rejection_created
- blocked_action_detected
- safety_lock_triggered
- affiliate_risk_flagged
- trust_rating_risk_flagged
- scam_claim_risk_flagged
- rollback_required
- rollback_completed
- roadmap_updated
- blueprint_updated
- PR_created
- PR_verified
- PR_merged
- cleanup_completed

---

## 7. Handoff event requirements

A handoff audit_event must include:

- event_id
- trace_id
- workflow_id
- handoff_id
- event_type
- event_timestamp_utc
- actor_type
- actor_id
- actor_name
- source_agent
- target_agent
- source_department
- target_department
- workflow_status_before
- workflow_status_after
- action_summary
- input_reference
- output_reference
- controlling_contract
- capability_used
- permission_check
- safety_check
- approval_status

A handoff is invalid where source_agent is missing.

A handoff is invalid where target_agent is missing.

A handoff is invalid where workflow_status_before is missing.

A handoff is invalid where workflow_status_after is missing.

A handoff is invalid where trace_id is missing.

A handoff is invalid where event_id is missing.

---

## 8. Workflow status change requirements

A workflow_status_changed audit_event must include:

- workflow_status_before
- workflow_status_after
- action_summary
- decision_summary
- controlling_contract
- permission_check
- safety_check

A workflow status change is invalid where workflow_status_after is not allowed by the Build 60 workflow state machine.

---

## 9. Approval rules

Danny approval must never be implied.

Danny approval must be logged as an audit_event before a future workflow can treat it as approved.

In current READ_ONLY_REPORT_ONLY mode, Danny approval may approve internal/report-only progression only.

It must not enable live publishing, Supabase writes, affiliate insertion, trust-rating edits, live outreach, or website edits.

---

## 10. Rejection and escalation rules

A rejection audit_event must include:

- rejection_reason
- rejected item reference
- rejecting actor
- return route
- required fix
- workflow_status_before
- workflow_status_after

An escalation audit_event must include:

- escalation_reason
- escalation severity
- source_agent
- target_agent
- source_department
- target_department
- decision required
- Danny review requirement where applicable

Danny should receive CEO-level exceptions, not every operational item.

---

## 11. Blocked action rules

A blocked_action_detected audit_event must include:

- blocked_action
- actor_name
- actor_id
- source_agent
- workflow_id
- controlling_contract
- safety_check
- permission_check
- workflow_status_before
- workflow_status_after
- escalation_reason
- rollback_reference

Blocked actions include:

- live publishing
- Supabase writes
- affiliate insertion
- trust-rating edits
- website edits
- live outreach
- email sending
- approval/apply workflow activation
- unapproved AI/API calls
- unapproved live crawling
- unsupported scam/fraud/legal claims
- bypassing QA
- bypassing Danny approval
- bypassing The Gaffer where executive routing is required
- bypassing manager routing
- changing locked blueprint direction without updating the blueprint and roadmap

---

## 12. Rollback rules

Rollback references must allow Watchdog HQ to identify the last safe state.

Rollback references may include:

- Git commit
- PR number
- file path
- previous report path
- previous workflow_status
- previous validator result
- previous blueprint section
- previous roadmap section

---

## 13. Future local audit paths

Current Build 61 is documentation/control only and creates no live audit log files.

Future local/report-only audit logs should use controlled local paths such as:

cw-content-brain/data/audit/
cw-content-brain/data/audit/events/
cw-content-brain/data/audit/workflows/
cw-content-brain/data/audit/handoffs/
cw-content-brain/data/audit/validations/
cw-content-brain/data/audit/escalations/
cw-content-brain/data/audit/decisions/

Future scripts must not write audit logs outside approved local/report-only paths.

---

## 14. Minimum audit_event validity checks

An audit_event is valid only where:

1. event_id exists.
2. trace_id exists.
3. workflow_id exists.
4. event_type is allowed.
5. event_timestamp_utc exists.
6. actor_type is allowed.
7. actor_id or actor_name exists.
8. workflow_status_before exists where a workflow state existed before the event.
9. workflow_status_after exists where the event changes or confirms state.
10. source_agent and target_agent exist for handoff events.
11. controlling_contract exists.
12. permission_check exists.
13. safety_check exists.
14. approval_status exists.
15. rejection_reason exists where rejection occurs.
16. escalation_reason exists where escalation occurs.
17. blocked_action exists where a blocked action is detected.
18. rollback_reference exists where rollback is required.
19. the event does not claim live execution in READ_ONLY_REPORT_ONLY mode.
20. the event does not bypass Danny, QA, The Gaffer, or manager approval gates.

---

## 15. Build 61 completion definition

Build 61 is complete when:

- this contract exists
- audit_event is defined
- event_id is defined
- trace_id is defined
- workflow_id is defined
- handoff_id is defined
- event_type is defined
- event_timestamp_utc is defined
- actor_type is defined
- actor_id is defined
- actor_name is defined
- source_agent is defined
- target_agent is defined
- workflow_status_before is defined
- workflow_status_after is defined
- approval_status is defined
- rejection_reason is defined
- escalation_reason is defined
- blocked_action is defined
- rollback_reference is defined
- READ_ONLY_REPORT_ONLY remains locked
- no live publishing remains locked
- no Supabase writes remains locked
- no affiliate insertion remains locked
- no trust-rating edits remains locked
- roadmap is updated to mark Build 61 as built / ready for review
- roadmap points to Build 62 as planned / next
- master blueprint references this contract

---

## 16. Build 62 direction

Build 62 should define the Knowledge Map and Canonical Source Contract v1.

Build 62 should lock which documents, registries, blueprints, reports, evidence packages, content sources, and future memory layers count as canonical knowledge for Watchdog HQ.

Build 62 should prevent agents from inventing rules where canonical knowledge already exists.

---

## 17. Audit event severity model

Every audit_event must carry or imply an event severity.

Allowed severity levels are:

- info
- notice
- warning
- critical
- blocked

Severity rules:

- info is used for routine workflow movement.
- notice is used for meaningful but safe changes.
- warning is used where evidence, routing, QA, approval, or handoff gaps exist.
- critical is used where Danny, Gatekeeper Grace, The Gaffer, or a department manager must review before progression.
- blocked is used where a blocked action, unsafe claim, unauthorised action, approval bypass, or current-mode breach is detected.

Blocked events must not progress to any approval, apply, publish, or live execution state.

---

## 18. Actor type rules

Allowed actor_type values are:

- human_owner
- executive_ai
- department_manager
- specialist_agent
- QA_governance
- validator
- system
- unknown

actor_type must match the Build 59 Agent Registry and Capability Registry where the actor is an agent, manager, QA role, validator, or system process.

unknown may only be used for imported legacy evidence or incomplete historic records. It must trigger a warning severity and must not be used for future controlled workflows unless an explicit evidence gap is being recorded.

---

## 19. Permission check rules

permission_check must record whether the actor was allowed to perform the action.

Allowed permission_check values are:

- allowed
- allowed_report_only
- allowed_with_manager_review
- allowed_with_QA_review
- allowed_with_Danny_review
- denied
- blocked
- not_applicable
- unknown

permission_check is invalid where:

- an unregistered agent performs a controlled action
- an agent uses a capability not granted by Build 59
- a specialist bypasses a department manager
- a manager bypasses QA where QA is required
- any actor bypasses Danny where Danny approval is required
- any actor attempts a blocked action
- any actor claims live execution in READ_ONLY_REPORT_ONLY mode

---

## 20. Safety check rules

safety_check must record whether the action respected Watchdog HQ safety boundaries.

Allowed safety_check values are:

- passed
- passed_with_warnings
- failed
- blocked
- not_applicable
- unknown

safety_check must be blocked where the event involves:

- live publishing
- Supabase writes
- affiliate insertion
- trust-rating edits
- website edits
- live outreach
- email sending
- approval/apply workflow activation
- unapproved AI/API calls
- unapproved live crawling
- unsupported scam/fraud/legal claims
- bypassing Danny approval
- bypassing QA or Gatekeeper Grace
- bypassing The Gaffer where executive routing is required
- bypassing department-manager routing
- changing locked blueprint direction without updating the blueprint and roadmap

---

## 21. Approval status rules

Allowed approval_status values are:

- not_required
- pending_manager_review
- pending_QA_review
- pending_Gaffer_review
- pending_Danny_review
- approved_report_only
- rejected
- blocked
- invalid

Current READ_ONLY_REPORT_ONLY mode only permits approved_report_only.

approved_report_only does not permit live publishing, Supabase writes, affiliate insertion, trust-rating edits, website edits, email sending, outreach, approval/apply workflow activation, AI/API calls, or live crawling.

Danny approval must be recorded as a separate Danny_decision_recorded audit_event before any workflow may claim Danny approval.

---

## 22. Handoff audit routing rules

Every handoff must show:

- who sent the work
- who received the work
- why the handoff happened
- what workflow_status changed
- whether evidence moved with the handoff
- whether the target agent has permission to receive the item
- whether QA, manager, The Gaffer, or Danny review is required
- whether any blocked action or unsupported claim is present

A handoff must not be treated as accepted merely because it exists.

A handoff becomes accepted only when a handoff_received audit_event is recorded by the receiving actor or receiving queue.

A handoff becomes rejected only when a handoff_rejected audit_event is recorded with rejection_reason and return route.

---

## 23. Rejection reason taxonomy

Allowed rejection_reason categories include:

- missing_required_field
- missing_evidence
- unsupported_claim
- unsafe_claim_wording
- affiliate_disclosure_gap
- rating_change_risk
- scam_fraud_legal_claim_risk
- wrong_template
- wrong_page_type
- invalid_workflow_status
- invalid_handoff
- invalid_actor
- invalid_capability
- manager_review_required
- QA_review_required
- Danny_review_required
- blueprint_mismatch
- roadmap_mismatch
- schema_mismatch
- validator_failure
- blocked_action_detected
- current_mode_breach
- duplicate_workflow
- unclear_ownership
- unclear_next_step

A rejection audit_event must define the required fix and the return route.

---

## 24. Escalation reason taxonomy

Allowed escalation_reason categories include:

- CEO_level_exception
- strategic_direction_needed
- high_risk_brand_decision
- scam_fraud_legal_risk
- rating_change_risk
- affiliate_risk
- evidence_gap_material
- governance_gate_failed
- manager_conflict
- cross_department_conflict
- blocked_action_attempted
- repeated_validator_failure
- blueprint_or_roadmap_drift
- safety_boundary_unclear
- rollback_required
- incident_review_required

Danny receives CEO-level exceptions and high-risk decisions.

The Gaffer receives priority, routing, cross-department, and executive-triage items.

Gatekeeper Grace receives QA, governance, evidence, claim, affiliate, rating, and safety-risk items.

Department managers receive operational routing, retry, quality, and specialist-output items.

---

## 25. Event ordering rules

Audit events must preserve order.

Future local audit logs should support sorting by:

- event_timestamp_utc
- trace_id
- workflow_id
- event_id
- handoff_id

A workflow timeline must be reconstructable from audit_event records.

Where two events happen at the same time, ordering must be decided by recorded event_id or sequence number in a future implementation.

---

## 26. Trace rules

trace_id must remain stable across a full workflow journey.

A trace may include:

- workflow creation
- evidence intake
- draft package creation
- safety harness check
- Rewrite Rita report generation
- report schema validation
- report validator check
- manager handoff
- QA handoff
- The Gaffer escalation
- Danny review
- rejection loop
- rollback event
- PR verification
- roadmap update
- blueprint update

A new trace_id should be created only where a genuinely new workflow begins.

---

## 27. Blueprint and roadmap event rules

Any build that changes the roadmap must create or imply an audit_event with event_type roadmap_updated.

Any build that changes the master blueprint must create or imply an audit_event with event_type blueprint_updated.

Blueprint and roadmap changes must identify:

- changed file path
- build number
- reason for change
- source build
- next planned build
- safety impact
- whether the change affects agent permissions, workflow states, handoffs, approvals, evidence, QA, publishing, affiliate handling, ratings, or live execution boundaries

---

## 28. PR and Git audit rules

For Git and PR workflow, audit_event records should be able to capture:

- branch created
- commit created
- PR created
- PR locally verified
- PR repair required
- repair committed
- repair pushed
- PR approved
- PR merged
- branch cleaned up
- main verified
- next build started

PR events must not replace local verification.

Local verification remains required before merge verdicts.

---

## 29. Validator and report audit rules

Validator events must capture:

- validator name
- validator contract
- input file
- output file
- pass/fail result
- missing terms
- blocked actions
- warnings
- required repairs
- final verdict

A failed validator must produce either:

- validation_failed
- rejection_created
- escalation_created
- blocked_action_detected

depending on severity.

---

## 30. Evidence audit rules

Evidence events must capture:

- evidence source
- evidence type
- evidence owner
- evidence file path or reference
- whether evidence was Danny-provided
- whether evidence was public-source-derived
- whether evidence is missing
- whether evidence supports a claim
- whether evidence creates a proof gap
- whether evidence affects rating, affiliate, warning, or scam/fraud/legal risk

Evidence gaps must not be hidden.

Missing evidence must remain visible until resolved, rejected, or explicitly accepted as a limitation by the correct reviewer.

---

## 31. Danny review audit rules

Danny review must be requested only for meaningful decisions.

Danny review is required for:

- final approval of high-risk brand decisions
- any trust rating change
- scam/fraud/legal wording decisions
- affiliate exceptions
- serious evidence gaps
- publishing readiness decisions in a future approved mode
- approval/apply workflow activation in a future approved mode
- governance override requests
- blueprint direction changes
- strategic operating model changes

Danny should not receive routine minor formatting, routing, or low-risk operational events.

---

## 32. Event log non-negotiables

Future Watchdog HQ agents must not:

- erase audit events
- silently overwrite audit events
- hide failed validations
- hide missing evidence
- hide rejected handoffs
- hide blocked actions
- invent approval
- invent Danny decisions
- invent QA approval
- invent manager approval
- skip workflow_status records
- skip source_agent or target_agent on handoffs
- claim live work happened in READ_ONLY_REPORT_ONLY mode
- route around The Gaffer, Gatekeeper Grace, Danny, or department managers where they are required

---

## 33. Future validator expectations

A future Build 61 validator should check:

- required audit_event fields
- allowed event_type
- allowed actor_type
- allowed approval_status
- valid permission_check
- valid safety_check
- valid workflow_status_before
- valid workflow_status_after
- required source_agent and target_agent for handoffs
- required rejection_reason for rejections
- required escalation_reason for escalations
- required blocked_action for blocked events
- required rollback_reference for rollback events
- no live publishing
- no Supabase writes
- no affiliate insertion
- no trust-rating edits
- no current-mode breach
- no approval invention
- no blueprint or roadmap drift

---

## 34. Build 61 lock

Build 61 locks the audit trail and event log contract as a control document.

It is not a runtime logger.

It is not a database writer.

It is not a Supabase integration.

It is not a live workflow engine.

It is not an approval/apply mechanism.

It is the rulebook future audit tooling must follow.

---

## Build 61 exact validator failure event field

The audit trail must support the exact field alidator_failed.

alidator_failed records whether a validator, safety harness, schema check, workflow check, handoff check, evidence check, or governance check failed during the workflow.

Rules for alidator_failed:

- alidator_failed must be present where an audit_event records a validation step.
- alidator_failed must be true when any validator blocks, rejects, pauses, escalates, or returns a failed result.
- alidator_failed must be false when a validator passes cleanly.
- alidator_failed must not be used to bypass manager review, QA review, Gatekeeper Grace review, The Gaffer escalation, or Danny approval.
- A failed validator must preserve the rejection reason, escalation reason, blocked action, workflow status before, workflow status after, actor, source_agent, target_agent, timestamp, and trace_id.
- A validator failure must remain READ_ONLY_REPORT_ONLY unless a future approved apply workflow exists.
- A validator failure must not trigger live publishing, Supabase writes, affiliate insertion, trust-rating edits, live content edits, or any irreversible action.


---

## Build 61 validator_failed audit event requirement

The Build 61 audit trail and event log contract must include the exact audit field `validator_failed`.

`validator_failed` records whether a validator, schema check, workflow state check, handoff check, evidence check, safety harness check, or governance check failed during a workflow event.

Required rules:

- `validator_failed` must be present for validation-related audit_event records.
- `validator_failed` must be true where a validator blocks, rejects, pauses, escalates, or fails a workflow item.
- `validator_failed` must be false where the validator passes cleanly.
- `validator_failed` must preserve the validator name, rejection reason, escalation reason, blocked action, workflow_status before, workflow_status after, actor, source_agent, target_agent, timestamp, and trace_id.
- `validator_failed` must not be used to bypass manager review, QA review, Gatekeeper Grace, The Gaffer, or Danny approval.
- `validator_failed` must remain READ_ONLY_REPORT_ONLY.
- `validator_failed` must never trigger live publishing, Supabase writes, affiliate insertion, trust-rating edits, live content edits, or irreversible changes.

Exact required term for verification:

validator_failed

## Build 61 exact state field lock

Every audit_event that records a workflow state change must include both exact state snapshot fields:

- state_before
- state_after

The state_before field records the workflow_status, owning_department, owning_manager, owning_agent, source_agent, target_agent, escalation route, approval requirement, validation status, and evidence status before the event is applied.

The state_after field records the workflow_status, owning_department, owning_manager, owning_agent, source_agent, target_agent, escalation route, approval requirement, validation status, and evidence status after the event is applied.

A state change audit_event is invalid where state_before is missing.

A state change audit_event is invalid where state_after is missing.

The state_before and state_after fields must not be used to hide, overwrite, or silently bypass previous decisions. They exist to preserve traceability, not to create an approval/apply workflow.

Current mode remains READ_ONLY_REPORT_ONLY. The state_before and state_after fields do not enable live publishing, no live publishing, no Supabase writes, no affiliate insertion, or no trust-rating edits.

## Required review and validation event type locks

The audit trail contract must support the following exact event_type values for validation, manager review, QA review, and Danny review routing:

| event_type | Required meaning |
|---|---|
| validation_passed | A validator, harness, schema check, safety check, or contract check completed successfully and allowed the workflow item to continue. |
| manager_reviewed | A department manager, executive manager, or The Gaffer reviewed the work item, handoff, validation result, rejection, or escalation. |
| qa_reviewed | Gatekeeper Grace or an approved QA/Governance role reviewed the work item for evidence, claims, safety, tone, affiliate disclosure, risk wording, and approval requirements. |
| danny_review_required | The work item requires Danny review because it involves CEO-level judgement, high-risk decisioning, final approval, exception handling, rating risk, publication risk, affiliate risk, scam/fraud/legal wording, or an override request. |

These values are report-only audit events. They do not approve publishing, do not write to Supabase, do not insert affiliate links, do not edit live website content, and do not change trust ratings.

A workflow item cannot be marked as finally approved merely because validation_passed, manager_reviewed, or qa_reviewed exists. If Danny approval is required, the audit_event must record danny_review_required and the item must remain blocked until Danny gives explicit approval through the future approved workflow.


---

## Exact Event Type Locks For Build 61 Verification

The audit trail contract must explicitly support these event_type values:

- state_changed
- rollback_requested
- incident_opened

### state_changed

Use state_changed when a workflow item moves from one workflow_status to another.

Required fields:

- audit_event
- event_type: state_changed
- trace_id
- workflow_id
- timestamp
- actor
- source_agent
- target_agent where applicable
- state_before
- state_after
- reason
- evidence_refs where applicable

A state_changed event is invalid where state_before or state_after is missing.

### rollback_requested

Use rollback_requested when a workflow item, report, contract, roadmap update, or control document needs to be returned to a previous safe version or previous safe workflow_status.

Required fields:

- audit_event
- event_type: rollback_requested
- trace_id
- workflow_id
- timestamp
- actor
- source_agent
- target_agent where applicable
- state_before
- state_after where known
- rollback_reason
- affected_artifacts
- required_approver

A rollback_requested event does not perform rollback by itself. It records the requested rollback for manager, Gatekeeper Grace, The Gaffer, or Danny review.

### incident_opened

Use incident_opened when a blocked action, failed validation, unsafe handoff, missing approval, policy breach, evidence-risk issue, or control failure requires incident tracking.

Required fields:

- audit_event
- event_type: incident_opened
- trace_id
- workflow_id
- timestamp
- actor
- source_agent
- target_agent where applicable
- incident_severity
- incident_reason
- affected_artifacts
- required_owner
- required_next_action

An incident_opened event must preserve READ_ONLY_REPORT_ONLY mode and must not enable no live publishing, no Supabase writes, no affiliate insertion, or no trust-rating edits.

