# Watchdog HQ Page Discovery Work Queue Schema & Validator Contract v1

Build 69 locks the report-only schema and validator contract for page discovery work queue items created under Build 68.

This contract turns Build 68 from an operating routing contract into a controlled output standard for future Watchdog HQ discovery agents, routers, managers, validators, QA workers, and audit trails.

It is not a live generator, not a page writer, not a publishing system, and not an approval/apply workflow.

## 1. Current Mode

Current system mode: READ_ONLY_REPORT_ONLY.

Build 69 does not enable:

- live publishing
- live site edits
- Supabase writes
- affiliate URL insertion
- trust-rating edits
- AI/API calls
- media generation or download
- outreach
- email sending
- Safe Apply
- approval for publication
- deleting or changing production data
- real content publishing

All outputs remain local/report-only schema definitions, validator rules, validation findings, routing decisions, and work queue reports.

## 2. Purpose

Build 69 defines the required structure and validation rules for future page discovery work queue items.

Future agents must use this contract when producing or validating page discovery, inventory, refresh, missing-page, SEO, link-gap, evidence-gap, media-planning, affiliate-risk, and sensitive-content routing items.

The purpose is to stop future agents inventing their own formats, routing logic, priorities, workflow states, safety wording, or Danny escalation rules.

## 3. Relationship To Build 68

Build 68 defines how Watchdog HQ discovers, inventories, classifies, prioritises, and routes page work.

Build 69 defines the schema and validator rules that check whether those discovery work items are valid.

Build 69 does not replace Build 68. It sits directly underneath Build 68 as the output contract and validation gate.

## 4. Required Work Queue Report

Future page discovery reports must contain:

- report_id
- trace_id
- generated_at
- generated_by_agent
- source_contract
- source_reports
- safety_mode
- report_status
- total_items
- items
- validation_summary
- blocked_action_confirmations
- audit_notes

The safety_mode must be READ_ONLY_REPORT_ONLY.

The source_contract must reference Build 68 and this Build 69 contract where applicable.

## 5. Required Work Item Schema

Every work item must contain:

- work_item_id
- trace_id
- parent_report_id
- source_report
- source_page_url_or_path
- page_exists_status
- page_type
- discovery_category
- issue_summary
- user_or_search_purpose
- evidence_status
- seo_status
- content_status
- internal_link_status
- related_content_status
- media_status
- affiliate_status
- trust_risk_status
- sensitivity_level
- recommended_owner_department
- recommended_owner_agent
- recommended_next_state
- priority
- required_qc
- requires_danny_review
- escalation_reason
- blocked_actions
- audit_notes

Optional fields may be added later only if they do not weaken the safety model, bypass managers, introduce approved/applied states, or enable live actions.

## 6. Allowed Discovery Categories

Allowed discovery_category values are:

- existing_page_needs_refresh
- existing_page_thin_or_weak
- existing_page_outdated_structure
- existing_page_missing_evidence
- existing_page_poor_seo_structure
- existing_page_internal_link_gap
- existing_page_missing_related_content
- existing_page_needs_media_planning
- missing_page_opportunity
- missing_hub_opportunity
- duplicate_or_cannibalisation_risk
- affiliate_or_commercial_opportunity
- warning_or_sensitive_page_risk
- serious_content_qc_required
- monitor_only

Unknown discovery categories must fail validation unless a later approved contract extends the allowed list.

## 7. Allowed Workflow States

Allowed recommended_next_state values are:

- detected
- suspected
- verified
- recommended
- blocked
- monitor_only
- needs_more_evidence
- escalated_to_qc
- escalated_to_master_ai
- recommended_for_danny_review

Blocked states:

- approved
- applied

Approved and applied are future-only operational states and must fail validation if used as active states.

## 8. Allowed Priority Values

Allowed priority values are:

- critical
- high
- medium
- low
- monitor_only

Critical and high priority items must include a clear escalation_reason or audit_notes explaining why they were prioritised.

## 9. Required Routing Validation

Every work item must have a recommended_owner_department and recommended_owner_agent.

Routing must follow the Build 68 routing model.

Examples:

- page structure issues route to Editorial Strategy / Blueprint Bella
- SEO and keyword issues route to SEO / Rankhound or Keyword Kev
- internal-linking gaps route to Internal Linking / Linksmith
- routing and queue control issues route to Content Operations / Routey Rachel
- future rebuild candidates route to Content Production / Rewrite Rita only after safety gates
- evidence gaps route to Evidence / Inspector Proof
- media planning routes to Media / Image Iris or Storyboard Sam
- affiliate disclosure or commercial risk routes to Affiliates / Disclosure Daisy or Offer Owl
- unsupported claims, scam wording, trust risk, serious content, invented proof, or publication-sensitive issues route to QA / Gatekeeper Grace
- audit traceability routes to Audit / Audit Alfie
- prioritisation and Danny-ready filtering route to Command / The Gaffer
- CEO-level exceptions route to Danny

Items missing owner department or owner agent must fail validation.

## 10. Required QA Validation

required_qc must be true when the item involves:

- unsupported claims
- trust/rating changes
- scam/fraud wording
- legal or regulatory wording
- affiliate conflict
- serious harm, safety, victim, or warning content
- invented testing
- invented proof
- invented screenshots
- misleading ranking, user-number, guarantee, or partnership claims
- publication-sensitive recommendations
- serious-content tone issues

If any of these are present and required_qc is false, the item must fail validation.

## 11. Required Danny Review Validation

requires_danny_review must be true when the item involves:

- trust/rating changes
- scam/fraud/legal wording
- affiliate-sensitive decisions
- publication-sensitive decisions
- strategic brand decisions
- override requests
- unresolved governance conflicts
- high-risk warning or victim-help content
- anything Gatekeeper Grace escalates as critical

Danny receives CEO-level exceptions, not routine operational noise.

## 12. Existing-Page-First Validation

If page_exists_status is existing, the item must recommend auditing, refreshing, rebuilding, enriching, linking, restructuring, or routing the existing page before recommending a duplicate page.

If discovery_category is missing_page_opportunity or missing_hub_opportunity, the item must explain why no existing page satisfies the user or search purpose.

Missing-page items without user_or_search_purpose must fail validation.

## 13. Blocked Action Confirmations

Every report must confirm that it does not perform blocked actions.

Required blocked_action_confirmations:

- no_live_publishing
- no_live_site_edits
- no_supabase_writes
- no_affiliate_url_insertion
- no_trust_rating_edits
- no_ai_api_calls
- no_media_generation_or_download
- no_outreach
- no_email_sending
- no_safe_apply
- no_approval_for_publication
- no_deleting_or_changing_production_data

If any blocked action confirmation is missing or false, the report must fail validation.

## 14. Validator Verdicts

Allowed validator verdicts:

- pass
- warn
- fail
- escalate_to_qc
- escalate_to_master_ai
- recommended_for_danny_review

Pass means the item follows the schema, safety model, routing model, and state model.

Warn means the item is usable but has minor missing context that does not create safety risk.

Fail means the item is unsafe, incomplete, uses blocked states, misses required fields, lacks ownership, or violates the contract.

Escalate to QC means Gatekeeper Grace must review the item before it moves further.

Escalate to Master AI means The Gaffer must decide routing, priority, or Danny readiness.

Recommended for Danny review means the item contains CEO-level exception material.

## 15. Validator Output Schema

A future validator output must include:

- validation_id
- trace_id
- source_report_id
- source_work_item_id
- verdict
- severity
- failed_checks
- warning_checks
- required_route
- requires_qc
- requires_master_ai
- requires_danny_review
- blocked_actions_confirmed
- audit_notes

## 16. Acceptance Criteria

Build 69 is acceptable only if it:

- preserves READ_ONLY_REPORT_ONLY
- references Build 68
- defines report-level required fields
- defines work-item required fields
- locks allowed discovery categories
- locks allowed workflow states
- blocks approved/applied as active states
- locks allowed priority values
- requires owner department and owner agent
- validates QA escalation
- validates Danny review escalation
- validates existing-page-first behaviour
- validates missing-page recommendations
- requires blocked action confirmations
- defines validator verdicts
- supports audit traceability
- updates the blueprint and roadmap

## 17. Build 69 Safety Confirmation

Build 69 does not publish content, edit live pages, write to Supabase, insert affiliate URLs, change trust ratings, call AI/API tools, generate media, download media, send outreach, send emails, approve publication, activate Safe Apply, or delete/change production data.

Current mode remains READ_ONLY_REPORT_ONLY.
