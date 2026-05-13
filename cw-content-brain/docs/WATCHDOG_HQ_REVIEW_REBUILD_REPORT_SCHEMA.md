# WATCHDOG HQ — Review Rebuild Report Schema v1

Build: 57
Status: locked v1 draft
Mode: READ_ONLY_REPORT_ONLY
Owner: Danny
Control system: Watchdog HQ / CryptoWatchdog Content Brain
Related agent: Rewrite Rita
Related build: Build 56 — Review Rebuild Agent v1

---

## 1. Purpose

This document defines the local report schema for Rewrite Rita review rebuild outputs.

Build 57 does not create a live generator.

Build 57 does not publish, write to Supabase, edit live pages, alter trust ratings, insert affiliate links, call AI/API tools, generate media, or enable Safe Apply.

This schema exists so future report-only implementations produce consistent, reviewable, auditable outputs.

---

## 2. Current safety mode

Current mode remains:

READ_ONLY_REPORT_ONLY

Blocked unless Danny explicitly approves a future safe workflow:

- No live website edits
- No publishing
- No Supabase writes
- No affiliate insertion
- No trust rating changes
- No scam/fraud/legal claims without verified evidence and Danny approval
- No Safe Apply
- No AI/API calls unless explicitly approved later
- No media generation/downloads unless explicitly approved later
- No live article files

---

## 3. Schema principle

Every Rewrite Rita rebuild report must be:

1. Local/report-only.
2. Evidence-led.
3. Harness-controlled.
4. Template-aligned.
5. Proof-gap visible.
6. Escalation visible.
7. QA-ready.
8. Danny-review-ready where judgement is required.
9. Safe to reject.
10. Not a live article.

A rebuild report is not publication approval.

---

## 4. Allowed output locations

Future implementations may write rebuild reports only to:

- cw-content-brain/data/rebuilds/
- cw-content-brain/data/reports/
- cw-content-brain/data/drafts/

Blocked output locations:

- src/
- public/
- supabase/
- route files
- live app content folders
- production content tables
- deployment folders

---

## 5. Required file naming convention

Future local report files should use this pattern:

review-rebuild-report-{review_id}-{yyyymmdd-hhmmss}.json

Optional human-readable markdown companion:

review-rebuild-report-{review_id}-{yyyymmdd-hhmmss}.md

Validation companion:

review-rebuild-report-{review_id}-{yyyymmdd-hhmmss}.validation.json

---

## 6. Required top-level fields

Every Rewrite Rita rebuild report must include:

- schema_name
- schema_version
- mode
- rebuild_report_id
- rebuild_task_id
- source_review_id
- brand_name
- review_type
- selected_template
- generated_at
- generated_by_agent
- agent_department
- source_documents
- input_status
- harness_status
- rebuild_status
- rebuilt_sections
- evidence_usage_summary
- proof_gap_summary
- escalation_summary
- blocked_claims_removed
- cautious_wording_used
- affiliate_disclosure_status
- trust_status_handling
- serious_content_handling
- qa_handoff
- danny_review_queue
- recommended_next_actions
- blocked_actions_confirmed
- validation_status

---

## 7. Required source documents

The source_documents field must reference:

- WATCHDOG_HQ_PAGE_TEMPLATE_THEMED_HUB_LIBRARY.md
- WATCHDOG_HQ_REVIEW_EVIDENCE_INTAKE_CONTRACT.md
- WATCHDOG_HQ_REVIEW_ARTICLE_ASSEMBLY_CONTRACT.md
- WATCHDOG_HQ_REVIEW_DRAFT_SAFETY_HARNESS.md
- WATCHDOG_HQ_REVIEW_REBUILD_AGENT.md

---

## 8. Required input status fields

The input_status field must include:

- template_found
- evidence_object_found
- draft_package_found
- safety_harness_result_found
- all_required_inputs_present
- missing_inputs

If all_required_inputs_present is false, the rebuild report must be blocked.

---

## 9. Required harness status fields

The harness_status field must include:

- harness_verdict
- harness_passed_for_rebuild
- harness_warnings
- harness_blockers
- harness_reference

Allowed harness verdicts that may proceed:

- pass_for_internal_review
- pass_with_warnings

All other verdicts block rebuild expansion.

---

## 10. Allowed rebuild status values

Allowed rebuild_status values:

- not_started
- blocked_missing_inputs
- blocked_missing_harness
- blocked_failed_harness
- report_generated_internal_only
- report_generated_with_warnings
- sent_to_QA
- sent_to_Danny_review
- blocked_until_evidence_added
- blocked_until_escalation_resolved

No status may imply publication, live edit, rating change, affiliate approval, or final approval.

---

## 11. Required rebuilt section fields

Each rebuilt section must include:

- section_id
- section_name
- source_template_section
- source_draft_section
- evidence_items_used
- proof_gaps_disclosed
- escalations_disclosed
- claim_strength
- rewritten_text
- reviewer_notes
- safety_notes
- qa_required
- danny_approval_required

---

## 12. Allowed claim strength values

Allowed claim_strength values:

- unsupported_removed
- placeholder_only
- cautious_observation
- evidence_supported
- verified_testing_supported
- danny_approved_position

If claim_strength is unsupported_removed, the unsupported claim must not appear in rewritten_text.

---

## 13. Build 57 part 1A status

This file is the core Build 57 Review Rebuild Report Schema v1 contract.

Part 1B will add detailed summary objects, affiliate handling, trust-status handling, QA handoff, Danny review queue, blocked action confirmations, and validation status rules.

Build 58 will define the validator that checks future Rewrite Rita reports against this schema.

---

## 14. Detailed evidence usage summary rules

The evidence_usage_summary field must include:

- total_evidence_items_available
- total_evidence_items_used
- evidence_items_unused
- evidence_types_used
- highest_evidence_level_used
- evidence_limitations

Evidence limitations must be visible where they affect reader trust, safety, pricing, fees, withdrawals, deposits, custody, regulation, affiliate status, complaints, screenshots, or testing.

---

## 15. Detailed proof gap summary rules

The proof_gap_summary field must include:

- total_proof_gaps
- proof_gaps_disclosed_to_reader
- proof_gaps_kept_internal
- proof_gaps_blocking_publication
- proof_gap_notes

Proof gaps must not be converted into conclusions.

A missing deposit test is not proof of risk.

A delayed withdrawal report is not automatically proof of wrongdoing.

A weak public footprint is a reason for caution, not an unsupported accusation.

---

## 16. Detailed escalation summary rules

The escalation_summary field must include:

- total_escalations
- open_escalations
- resolved_escalations
- escalations_requiring_danny
- escalations_requiring_gatekeeper_grace

Open escalations block publication-level use.

Escalations must remain visible to QA and Danny.

---

## 17. Blocked claims removed rules

The blocked_claims_removed field must list every removed or neutralised unsafe claim.

Each item must include:

- claim_text
- reason_removed
- source_section
- replacement_wording
- requires_evidence_before_use

Blocked claims include:

- unsupported scam wording
- unsupported fraud wording
- unsupported legal wording
- invented testing
- invented screenshots
- invented fees
- invented regulation
- invented affiliate approval
- invented Danny approval
- unsupported safety guarantees

---

## 18. Cautious wording rules

The cautious_wording_used field must show where Rewrite Rita softened unsafe certainty.

Each item must include:

- original_risk
- safe_wording_used
- evidence_reference
- proof_gap_reference
- danny_approval_required

Cautious wording must be honest, not weak.

It should protect readers while avoiding unsupported accusations.

---

## 19. Affiliate disclosure status rules

The affiliate_disclosure_status field must include:

- affiliate_status
- affiliate_disclosure_needed
- affiliate_url_inserted
- affiliate_cta_created
- commercial_conflict_notes
- danny_review_required

affiliate_url_inserted must remain false in READ_ONLY_REPORT_ONLY mode.

affiliate_cta_created must remain false in READ_ONLY_REPORT_ONLY mode.

Rewrite Rita must not create affiliate-led recommendations.

---

## 20. Trust status handling rules

The trust_status_handling field must include:

- source_trust_status
- trust_status_changed
- trust_status_change_attempted
- trust_status_consistency_notes
- danny_review_required

trust_status_changed must remain false.

trust_status_change_attempted must remain false.

Only Danny approves trust status changes.

---

## 21. Serious content handling rules

The serious_content_handling field must include:

- serious_content_exception_applied
- serious_content_reason
- humour_removed
- sales_tone_removed
- safety_steps_included
- gatekeeper_grace_review_required
- danny_review_required

The serious-content exception applies to warning, scam-loss, victim-help, legal-risk, wallet-drain, withdrawal-failure, fraud-risk, and safety-critical pages.

---

## 22. QA handoff rules

The qa_handoff field must include:

- qa_required
- qa_owner
- qa_focus
- qa_blockers
- qa_warnings
- qa_notes

qa_owner should normally be Gatekeeper Grace.

QA must be able to pass, reject, or escalate.

QA does not publish.

---

## 23. Danny review queue rules

The danny_review_queue field must list every human judgement item.

Each item must include:

- item_id
- item_type
- reason
- related_section_id
- risk_level
- recommended_decision
- evidence_reference
- approval_required_before_publication

Danny review is required for:

- trust status judgement
- scam/fraud/legal wording
- final recommendation wording
- withdrawal issue wording
- regulation uncertainty
- affiliate conflict concerns
- serious-content conclusions
- publication-level approval

---

## 24. Recommended next actions rules

Allowed recommended_next_actions values:

- return_to_evidence_intake
- return_to_article_assembly
- return_to_safety_harness
- send_to_QA
- send_to_Danny_review
- prepare_more_evidence
- hold_until_escalation_resolved
- keep_internal_only

No next action may publish, write to Supabase, alter ratings, insert affiliate links, or create live article files.

---

## 25. Blocked actions confirmation rules

Every rebuild report must confirm these blocked actions:

- no_live_website_edits
- no_publishing
- no_supabase_writes
- no_affiliate_insertion
- no_trust_rating_changes
- no_scam_fraud_legal_claims_without_verified_evidence_and_danny_approval
- no_safe_apply
- no_ai_api_calls
- no_media_generation_downloads
- no_live_article_files

---

## 26. Validation status rules

The validation_status field must include:

- schema_valid
- safety_valid
- harness_valid
- evidence_valid
- qa_ready
- danny_ready
- publication_ready
- validation_notes

publication_ready must remain false in READ_ONLY_REPORT_ONLY mode.

A report may be QA-ready without being publication-ready.

A report may be Danny-ready without being publication-ready.

---

## 27. Existing content versus new content

This schema supports both existing content rebuilds and new draft review rebuilds.

For existing content, the report must compare the current page or article against the locked template and evidence contract.

For new content, the report must improve the assembled draft package after it passes the safety harness.

In both cases, Rewrite Rita produces a local/report-only rebuild report, not a live page edit.

---

## 28. Build 57 completed scope

Build 57 locks the schema that future Rewrite Rita outputs must follow.

Build 58 will define the validator that checks rebuild reports against this schema before they move to QA or Danny review.
