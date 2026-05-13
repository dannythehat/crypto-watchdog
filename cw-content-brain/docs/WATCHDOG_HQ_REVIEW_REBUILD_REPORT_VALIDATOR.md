# WATCHDOG HQ — Review Rebuild Report Validator v1

Build: 58
Status: locked v1 draft
Mode: READ_ONLY_REPORT_ONLY
Owner: Danny
Control system: Watchdog HQ / CryptoWatchdog Content Brain
Related agent: Rewrite Rita
Related build: Build 57 — Review Rebuild Report Schema v1

---

## 1. Purpose

This document defines the validator contract for future Rewrite Rita review rebuild reports.

The validator checks whether a rebuild report follows the Build 57 schema and the locked Watchdog HQ safety rules before it moves to QA or Danny review.

Build 58 does not create a live validator script.

Build 58 does not publish, write to Supabase, edit live pages, alter trust ratings, insert affiliate links, call AI/API tools, generate media, or enable Safe Apply.

This is a control contract only.

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

## 3. Validator principle

The validator must answer one question:

Is this Rewrite Rita rebuild report safe, complete, schema-valid, and ready for the next internal review stage?

The validator does not rewrite content.

The validator does not approve publication.

The validator does not change ratings.

The validator does not make commercial decisions.

The validator only passes, warns, rejects, or routes.

---

## 4. Required validator inputs

Every validator run must check:

- rebuild report file
- Build 57 report schema
- Build 56 Review Rebuild Agent contract
- Build 55 Review Draft Safety Harness
- Build 54 Article Assembly Contract
- Build 53 Evidence Intake Contract
- Build 52C Page Template Library
- current safety mode

If any required input is missing, validation must fail.

---

## 5. Validator output object

Every validation result must include:

- validator_schema_name
- validator_schema_version
- mode
- validation_report_id
- rebuild_report_id
- source_review_id
- brand_name
- validated_at
- validator_name
- input_files_checked
- schema_checks
- safety_checks
- evidence_checks
- harness_checks
- section_checks
- affiliate_checks
- trust_status_checks
- serious_content_checks
- qa_handoff_checks
- danny_review_checks
- blocked_action_checks
- validator_verdict
- blocking_issues
- warning_issues
- routing_decision
- recommended_next_actions

---

## 6. Allowed validator verdicts

Allowed validator_verdict values:

- pass_to_QA
- pass_to_QA_with_warnings
- send_to_Danny_review
- reject_missing_required_fields
- reject_schema_invalid
- reject_safety_violation
- reject_missing_evidence_support
- reject_failed_harness
- reject_affiliate_risk
- reject_trust_status_risk
- reject_serious_content_risk
- blocked_wrong_mode
- blocked_output_location_risk
- blocked_live_action_attempt

Only these verdicts are allowed.

---

## 7. Passing rules

A rebuild report may pass_to_QA only where:

- mode is READ_ONLY_REPORT_ONLY
- required top-level fields are present
- required source documents are referenced
- required inputs are present
- harness status allows rebuild
- no blocked actions are attempted
- no live output location is used
- evidence usage is declared
- proof gaps are visible
- escalations are visible
- affiliate URLs are not inserted
- trust status is not changed
- serious-content exceptions are applied where needed
- QA handoff exists
- Danny review queue exists where needed
- publication_ready remains false

---

## 8. Warning rules

A rebuild report may pass_to_QA_with_warnings where:

- the schema is complete
- safety mode is respected
- no blocked action is attempted
- evidence support is mostly clear
- minor proof gaps remain visible
- non-critical QA notes are present
- Danny review items are queued where needed

Warnings must not hide critical risk.

---

## 9. Rejection rules

A rebuild report must be rejected where:

- required fields are missing
- required source documents are missing
- harness result is missing
- harness verdict blocks rebuild
- evidence support is missing for a claim
- proof gaps are hidden
- escalations are hidden
- scam/fraud/legal wording appears without verified evidence and Danny approval
- testing is invented
- screenshots are invented
- affiliate URLs are inserted
- trust status is changed
- publication_ready is true
- live website output is attempted
- Supabase write is attempted
- AI/API calls are attempted
- media generation or download is attempted
- Safe Apply is attempted

---

## 10. Routing rules

The validator must route outputs as follows:

- pass_to_QA -> Gatekeeper Grace
- pass_to_QA_with_warnings -> Gatekeeper Grace with warnings
- send_to_Danny_review -> Approval Ava queue and Danny review queue
- reject_missing_required_fields -> return to Rewrite Rita
- reject_schema_invalid -> return to Rewrite Rita
- reject_safety_violation -> Gatekeeper Grace
- reject_missing_evidence_support -> Inspector Proof
- reject_failed_harness -> safety harness loop
- reject_affiliate_risk -> Offer Owl and Disclosure Daisy
- reject_trust_status_risk -> Gatekeeper Grace and Danny review
- reject_serious_content_risk -> Gatekeeper Grace and Danny review
- blocked_wrong_mode -> The Gaffer
- blocked_output_location_risk -> The Gaffer
- blocked_live_action_attempt -> The Gaffer and Danny

---

## 11. Blocked action checks

The validator must confirm:

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

If any blocked action check fails, the report must be rejected.

---

## 12. Build 58 part 1A status

This file is the core Build 58 Review Rebuild Report Validator v1 contract.

Part 1B will add detailed check groups, issue severity rules, routing outputs, validation report file naming, and relationship to Build 59.

Build 59 will begin the wider Agent Registry / Capability Registry foundation so agent permissions and department access can be controlled properly.

---

## 13. Detailed schema check rules

The validator must check that the rebuild report includes every required Build 57 top-level field:

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

Missing required fields must produce reject_missing_required_fields.

---

## 14. Detailed safety check rules

The validator must reject any rebuild report that:

- changes mode away from READ_ONLY_REPORT_ONLY
- attempts live edits
- attempts publishing
- attempts Supabase writes
- attempts affiliate insertion
- attempts trust-rating changes
- attempts AI/API calls
- attempts media generation or download
- attempts Safe Apply
- marks publication_ready as true

The validator must treat these as blocking issues, not warnings.

---

## 15. Detailed evidence check rules

The validator must check that:

- evidence usage is summarised
- evidence limitations are visible
- proof gaps are disclosed where relevant
- unsupported claims are removed or downgraded
- claim strength values are allowed
- verified testing claims have testing evidence
- screenshot claims have screenshot evidence
- regulation claims have source evidence
- complaint claims are not overstated
- reader-facing claims match the evidence level

Missing evidence support must produce reject_missing_evidence_support.

---

## 16. Detailed harness check rules

The validator must check that:

- harness_status exists
- harness_verdict exists
- harness_passed_for_rebuild exists
- harness_reference exists
- harness_verdict is pass_for_internal_review or pass_with_warnings before rebuild expansion
- harness blockers are not ignored

If the harness verdict blocks rebuild, the validator must produce reject_failed_harness.

---

## 17. Detailed section check rules

Every rebuilt section must include:

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

The validator must reject sections that include unsupported claims in rewritten_text.

The validator must reject sections that hide important proof gaps.

The validator must flag sections where qa_required is false without a clear reason.

---

## 18. Detailed affiliate check rules

The validator must check:

- affiliate_status is declared
- affiliate_disclosure_needed is declared
- affiliate_url_inserted is false
- affiliate_cta_created is false
- commercial conflict notes are visible where relevant
- Danny review is required where affiliate risk is material

Any affiliate URL insertion must produce reject_affiliate_risk or blocked_live_action_attempt.

---

## 19. Detailed trust-status check rules

The validator must check:

- source_trust_status is declared
- trust_status_changed is false
- trust_status_change_attempted is false
- consistency notes are present where wording conflicts with trust status
- Danny review is queued where trust judgement is needed

Any trust status change attempt must produce reject_trust_status_risk.

---

## 20. Detailed serious-content check rules

The validator must check whether serious-content exception applies.

Serious-content pages include:

- scam-loss pages
- warning pages
- victim-help pages
- legal-risk pages
- wallet-drain pages
- withdrawal-failure pages
- fraud-risk pages
- safety-critical pages

Where serious-content exception applies, the validator must check that:

- humour is removed
- sales tone is removed
- safety steps are included where useful
- Gatekeeper Grace review is required
- Danny review is required where judgement is sensitive

Failure must produce reject_serious_content_risk.

---

## 21. Detailed QA handoff check rules

The validator must check that the rebuild report includes a QA handoff with:

- qa_required
- qa_owner
- qa_focus
- qa_blockers
- qa_warnings
- qa_notes

qa_owner should normally be Gatekeeper Grace.

If QA handoff is missing, validation must fail.

---

## 22. Detailed Danny review check rules

The validator must check that Danny review items exist where required.

Danny review is required for:

- scam/fraud/legal wording
- trust status judgement
- serious-content conclusions
- affiliate conflict decisions
- final recommendation wording
- withdrawal issue wording
- regulation uncertainty
- publication-level approval

Routine non-critical items should route through the AI management layer and department leads, not directly to Danny.

Danny should receive CEO-level exceptions, not every minor task.

---

## 23. Issue severity rules

Every validation issue must be classified as one of:

- info
- warning
- blocking
- critical

Use info for notes that do not affect routing.

Use warning for non-critical issues that QA can review.

Use blocking for issues that stop QA handoff.

Use critical for issues that require The Gaffer, Gatekeeper Grace, or Danny before further movement.

---

## 24. Validation report file naming

Future validation report files should use this pattern:

review-rebuild-report-{review_id}-{yyyymmdd-hhmmss}.validation.json

Optional human-readable markdown companion:

review-rebuild-report-{review_id}-{yyyymmdd-hhmmss}.validation.md

Allowed output folders:

- cw-content-brain/data/rebuilds/
- cw-content-brain/data/reports/
- cw-content-brain/data/drafts/

No validator output may be written to live website, Supabase, public, src, route, deployment, or production content paths.

---

## 25. Routing output rules

The validator must provide one routing decision.

Allowed routing decisions:

- route_to_QA
- route_to_QA_with_warnings
- route_to_Danny_review
- return_to_Rewrite_Rita
- return_to_Inspector_Proof
- return_to_safety_harness
- route_to_Offer_Owl
- route_to_Disclosure_Daisy
- route_to_Gatekeeper_Grace
- route_to_The_Gaffer
- block_until_evidence_added
- block_until_escalation_resolved
- keep_internal_only

No routing decision may publish, write to Supabase, alter ratings, insert affiliate links, or create live article files.

---

## 26. Validator acceptance criteria

The Build 58 validator contract is acceptable only if it:

1. Checks Build 57 schema compliance.
2. Preserves READ_ONLY_REPORT_ONLY mode.
3. Rejects live action attempts.
4. Rejects unsupported claims.
5. Rejects invented testing.
6. Rejects invented screenshots.
7. Rejects affiliate insertion.
8. Rejects trust-rating changes.
9. Requires QA handoff.
10. Requires Danny review queue only for appropriate CEO-level decisions.
11. Routes routine issues to the correct AI manager or department lead.
12. Keeps publication_ready false.

---

## 27. Relationship to Build 59

Build 59 will begin the wider Agent Registry / Capability Registry foundation.

Build 59 should define how agents, departments, managers, capabilities, permissions, blocked actions, approval authority, and escalation routes are registered.

Build 59 must preserve Danny as CEO-level final authority for critical decisions while allowing the AI management layer to handle routine internal approvals.

Build 59 must not enable live publishing, Supabase writes, affiliate insertion, trust-rating edits, AI/API calls, Gmail sending, Search Console actions, Analytics actions, Semrush actions, media generation, or Safe Apply.
