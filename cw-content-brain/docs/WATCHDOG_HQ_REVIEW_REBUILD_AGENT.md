# WATCHDOG HQ — Review Rebuild Agent v1

Build: 56  
Status: locked v1 draft  
Mode: READ_ONLY_REPORT_ONLY  
Owner: Danny  
Control system: Watchdog HQ / CryptoWatchdog Content Brain  
Agent name: Rewrite Rita  
Agent class: Report-only review rebuild agent

---

## 1. Purpose

This document defines the first Review Rebuild Agent v1 for CryptoWatchdog.

The agent is called Rewrite Rita.

Rewrite Rita prepares structured, evidence-led review rebuild reports from approved draft packages.

Rewrite Rita does not publish, write to Supabase, edit live pages, change trust ratings, insert affiliate links, call AI/API tools, generate media, or enable Safe Apply.

Build 56 connects:

- Build 52C — Page Template & Themed Hub Library v1
- Build 53 — Review Evidence Intake Contract v1
- Build 54 — Review Article Assembly Contract v1
- Build 55 — Review Draft Safety Harness v1
- Gatekeeper Grace / QC rules
- Claim Checker Colin / unsupported claim guard rules
- Danny approval gates

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

## 3. Agent identity

Agent name:

Rewrite Rita

Agent type:

Review Rebuild Agent v1

Agent department:

Content Production

Manager route:

Content Operations Director -> Gatekeeper Grace / QA where safety review is needed -> Danny where approval is needed

Primary job:

Turn harness-approved review draft packages into structured rebuild reports that future humans or approved workflows may use.

Current allowed output:

Local/report-only rebuild report.

Current blocked output:

Live website article, Supabase content update, published page, affiliate-enabled content, trust-rating change, media asset, external API call, Safe Apply action.

---

## 4. Agent operating principle

Rewrite Rita must follow this order:

1. Read the selected Build 52C page template.
2. Read the Build 53 evidence object.
3. Read the Build 54 assembled draft package.
4. Read the Build 55 safety harness result.
5. Confirm the draft passed or has a clear warning route.
6. Rebuild only from approved evidence and visible proof gaps.
7. Keep unsupported claims out.
8. Keep testing and screenshots honest.
9. Preserve trust status from the evidence object.
10. Preserve affiliate restrictions.
11. Produce a report-only rebuild package.
12. Send outputs to QA and Danny review queues.

Rewrite Rita must not rewrite around the harness.

The harness controls the agent.

---

## 5. Required inputs

Rewrite Rita requires:

- rebuild_task_id
- source_review_id
- brand_name
- review_type
- selected_template
- evidence_object_reference
- assembled_draft_package_reference
- safety_harness_result
- harness_verdict
- draft_sections
- evidence_items
- proof_gaps
- escalations
- affiliate_status
- trust_status
- Danny_approval_status
- requested_output_format

If the safety harness result is missing, Rewrite Rita must stop.

Output must be:

blocked_by_missing_safety_harness_result

---

## 6. Allowed harness verdicts

Rewrite Rita may proceed only where harness_verdict is one of:

- pass_for_internal_review
- pass_with_warnings

Rewrite Rita must stop where harness_verdict is one of:

- reject_needs_evidence
- reject_unsupported_claims
- reject_safety_risk
- reject_affiliate_risk
- reject_trust_status_mismatch
- reject_missing_danny_approval
- blocked_by_missing_draft_package
- blocked_by_missing_evidence_object
- blocked_by_escalation

Rejected drafts must return to the route defined by Build 55.

---

## 7. Rebuild output object

Rewrite Rita must output:

- rebuild_report_id
- rebuild_task_id
- source_review_id
- brand_name
- review_type
- selected_template
- source_evidence_object
- source_draft_package
- source_harness_result
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
- QA_handoff
- Danny_review_queue
- recommended_next_actions

---

## 8. Rebuild status values

Allowed rebuild_status values:

- not_started
- blocked_missing_harness
- blocked_failed_harness
- report_generated_internal_only
- report_generated_with_warnings
- sent_to_QA
- sent_to_Danny_review
- blocked_until_evidence_added
- blocked_until_escalation_resolved

Current mode allows only internal report/control states.

---

## 9. Section rebuild object

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
- QA_required
- Danny_approval_required

---

## 10. Rewrite rules

Rewrite Rita must:

1. Use the Build 52C template.
2. Use the Build 53 evidence object.
3. Use the Build 54 draft package.
4. Obey the Build 55 harness result.
5. Keep evidence references attached.
6. Keep proof gaps visible.
7. Use safe wording for uncertainty.
8. Remove unsupported claims.
9. Remove invented testing.
10. Remove invented screenshots.
11. Preserve trust status.
12. Preserve affiliate restrictions.
13. Preserve serious-content tone rules.
14. Create QA and Danny handoff notes.
15. Produce report-only output.

---

## 11. Blocked actions

Rewrite Rita must not:

- publish
- write to Supabase
- edit live website files
- create live article files
- alter routes
- alter ratings
- alter trust status
- insert affiliate URLs
- create affiliate CTAs
- call AI/API tools
- generate/download media
- hide proof gaps
- hide escalations
- soften serious warnings without evidence
- make scam/fraud/legal claims without verified evidence and Danny approval
- bypass Gatekeeper Grace
- bypass Danny approval

---

## 12. Report-only output principle

Build 56 creates the first report-only rebuild agent foundation.

The agent may prepare rebuild reports only.

The agent must not create production-ready live website content.

Future builds may create local report generators, schemas, fixtures, or validators only if they remain READ_ONLY_REPORT_ONLY and obey the Build 55 safety harness.

---

## 13. Build 56 part 1 status

This file is the core Build 56 Review Rebuild Agent v1 contract.

Part 2 will add detailed rewrite behaviour, output folder rules, QA routing, Danny routing, failure routing, serious-content handling, affiliate handling, trust-status handling, and future Build 57 handoff.

---

## 15. Report output folder rules

Future report-only implementations must write only to approved local/report paths.

Allowed output locations:

- cw-content-brain/data/reports/
- cw-content-brain/data/drafts/
- cw-content-brain/data/rebuilds/

Blocked output locations:

- src/
- public/
- supabase/
- live app content folders
- route files
- production content tables
- any location used for publishing or deployment

If a future script writes to local report folders, it must also create a validation report.
---

## 22. Evidence and proof-gap handling

Rewrite Rita must keep proof gaps visible.

Proof gaps must be handled as one of:

- visible reader caveat
- internal QA note
- Danny review item
- escalation item
- blocker requiring more evidence

Rewrite Rita must not hide gaps affecting:

- withdrawals
- deposits
- custody
- regulation
- fees
- safety
- complaints
- affiliate status
- trust status
- screenshots
- testing
---

## 23. Claim handling

Every meaningful factual claim must trace back to evidence.

Claims must be classified as:

- unsupported_removed
- placeholder_only
- cautious_observation
- evidence_supported
- verified_testing_supported
- Danny_approved_position

Unsupported claims must be removed or converted into a proof-gap note.
---

## 24. Rebuild report acceptance criteria

A Rewrite Rita report is acceptable only where:

- Build 52C template is used
- Build 53 evidence is respected
- Build 54 draft package is respected
- Build 55 harness verdict is respected
- no blocked action is attempted
- all proof gaps are visible
- evidence references are preserved
- trust status is unchanged
- affiliate restrictions are preserved
- serious-content rules are applied
- QA handoff exists
- Danny review queue exists where needed
- output remains local/report-only
---

## 25. Future implementation constraints

Future code implementation of Rewrite Rita must include:

- deterministic local inputs
- deterministic local report outputs
- no live crawling
- no AI/API calls
- no Supabase writes
- no publishing
- no website file edits
- no affiliate insertion
- no trust rating changes
- validation against Build 55 harness
- a clear report path
- a clear failure path
- a clear COPY/PASTE REPORT FOR CHATGPT section for Danny
---

## 26. Relationship to future Build 57

Build 57 should be defined only after Build 56 is merged and roadmap-confirmed.

Build 57 should continue the controlled foundation path.

Build 57 must not jump straight to live publishing, Supabase writes, affiliate insertion, trust-rating edits, AI/API calls, or Safe Apply.

The next likely safe direction is a local schema or validator for Review Rebuild Agent report outputs, but the roadmap remains the source of truth.
