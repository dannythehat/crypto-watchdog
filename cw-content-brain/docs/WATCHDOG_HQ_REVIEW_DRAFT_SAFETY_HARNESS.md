# WATCHDOG HQ — Review Draft Safety Harness v1

Build: 55  
Status: locked v1 draft  
Mode: READ_ONLY_REPORT_ONLY  
Owner: Danny  
Control system: Watchdog HQ / CryptoWatchdog Content Brain

---

## 1. Purpose

This document defines the Review Draft Safety Harness for CryptoWatchdog.

Build 55 validates assembled review draft packages before any future Review Rebuild Agent expands, rewrites, or prepares them for Danny review.

Build 55 connects:

- Build 52C — Page Template & Themed Hub Library v1
- Build 53 — Review Evidence Intake Contract v1
- Build 54 — Review Article Assembly Contract v1
- Gatekeeper Grace / QC rules
- Claim Checker Colin / unsupported claim guard rules
- Danny approval gates

This is still foundation work. It does not authorise live website edits, publishing, Supabase writes, affiliate insertion, trust rating changes, scam/fraud/legal claims, AI/API calls, media generation, or Safe Apply.

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

---

## 3. Harness principle

Every assembled review draft must pass safety validation before future rebuild work expands.

The harness must check:

1. The correct Build 52C template was used.
2. The Build 53 evidence object is present.
3. The Build 54 draft package structure is present.
4. Claims are linked to evidence.
5. Proof gaps are visible.
6. Sensitive wording is escalated.
7. Trust status is not changed by the draft.
8. Affiliate status is not misused.
9. Testing and screenshots are not invented.
10. Danny approval gates are present.

If a draft fails the harness, it must be rejected, not silently rewritten.

---

## 4. Harness input object

The safety harness expects a draft package with:

- draft_id
- brand_name
- review_type
- selected_template
- evidence_object_reference
- draft_sections
- proof_gap_summary
- escalation_summary
- affiliate_disclosure_status
- trust_status_handling
- claim_safety_summary
- Danny_review_queue_items
- blocked_items
- recommended_next_actions

If this input is missing, the harness must return:

blocked_by_missing_draft_package

---

## 5. Harness output object

The safety harness must output:

- harness_run_id
- draft_id
- brand_name
- review_type
- verdict
- blocking_issues
- warning_issues
- evidence_reference_issues
- claim_safety_issues
- trust_status_issues
- affiliate_issues
- serious_content_issues
- Danny_approval_issues
- recommended_next_actions
- allowed_next_state

---

## 6. Harness verdict values

Allowed verdict values:

- pass_for_internal_review
- pass_with_warnings
- reject_needs_evidence
- reject_unsupported_claims
- reject_safety_risk
- reject_affiliate_risk
- reject_trust_status_mismatch
- reject_missing_danny_approval
- blocked_by_missing_draft_package
- blocked_by_missing_evidence_object
- blocked_by_escalation

A failed draft must not move to rebuild expansion.

---

## 7. Allowed next states

Allowed allowed_next_state values:

- return_to_evidence_intake
- return_to_article_assembly
- send_to_QA
- send_to_Danny_review
- blocked_until_escalation_resolved
- blocked_until_evidence_added
- internal_report_only

Current mode allows only internal report/control states.

---

## 8. Required validation checks

The harness must validate:

- template_check
- evidence_object_check
- section_evidence_check
- unsupported_claim_check
- invented_testing_check
- invented_screenshot_check
- scam_fraud_legal_wording_check
- affiliate_misuse_check
- trust_status_consistency_check
- serious_content_tone_check
- Danny_approval_gate_check
- proof_gap_visibility_check
- escalation_visibility_check
- output_mode_check

---

## 9. Severity values

Allowed issue severity values:

- info
- warning
- blocker
- critical

Rules:

- info means useful note.
- warning means the draft may continue to internal review with caution.
- blocker means the draft must return to evidence intake or article assembly.
- critical means Danny or Gatekeeper Grace must review before any further expansion.

---

## 10. Safety issue object

Each issue must use this structure:

- issue_id
- check_name
- severity
- section_id
- issue_summary
- evidence_reference
- offending_text
- required_fix
- owner
- allowed_next_action

---

## 11. Blocking issue rules

The harness must block drafts where:

- evidence object is missing
- draft package is missing
- a factual claim has no evidence reference
- testing is claimed without testing evidence
- screenshots are claimed without screenshot evidence
- scam/fraud/legal wording appears without verified evidence and Danny approval
- affiliate CTA or URL appears in current mode
- trust status is changed by the draft
- Danny approval is implied but missing
- serious-content exception is ignored
- unresolved escalations are hidden

---

## 12. Warning issue rules

The harness must warn where:

- evidence is low confidence
- proof gaps are present but visible
- related content is thin or missing
- affiliate status is unknown but not misused
- wording is cautious but needs human polish
- trust status support is weak but unchanged
- source links need refreshing before future publication-level work

---

## 13. Build 55 part 1 status

This file is the core Build 55 review draft safety harness.

Part 2 will add detailed check definitions, pass/fail rules, safe outputs, rejection loops, QA handoff, Danny handoff, and the Build 56 Review Rebuild Agent handoff.

---

## 14. Detailed check definitions

### template_check

Validates that the draft uses an approved Build 52C template.

Blocks where:

- no selected_template exists
- the selected template is not recognised
- the draft structure invents a new page type
- warning content is not using warning/scam-risk structure
- comparison content is not using comparison structure

### evidence_object_check

Validates that the Build 53 evidence object exists.

Blocks where:

- evidence_object_reference is missing
- evidence_level is missing
- testing_status is missing
- affiliate_status is missing
- Danny approval status is missing
- evidence_items are missing for factual claims

### section_evidence_check

Validates every draft section against evidence.

Blocks where:

- section claims are unsupported
- evidence references are missing
- claim strength exceeds evidence strength
- proof gaps are hidden
- section reviewer notes are missing for weak evidence

### unsupported_claim_check

Validates that claims are supported by evidence.

Blocks wording that asserts facts without evidence, especially around:

- safety
- withdrawals
- regulation
- custody
- fees
- complaints
- guarantees
- recommendations
- trust status

### invented_testing_check

Blocks any draft that claims:

- CryptoWatchdog tested the brand
- Danny tested the brand
- deposits were tested
- withdrawals were tested
- support was tested
- account setup was tested

unless the Build 53 evidence object contains matching testing evidence.

### invented_screenshot_check

Blocks any draft that says or implies screenshots exist unless screenshot evidence exists.

Examples of blocked wording:

- See the screenshot below.
- As shown in our screenshot.
- Our test screenshot confirms this.
- The image proves this.

### scam_fraud_legal_wording_check

Blocks or escalates wording involving:

- scam
- fraud
- stolen funds
- theft
- illegal activity
- criminal behaviour
- legal liability
- victim harm
- regulatory breach

Such wording requires verified evidence and Danny approval.

### affiliate_misuse_check

Blocks drafts where:

- affiliate URLs are inserted
- affiliate CTAs are created
- commercial relationships are hidden
- affiliate brands are favoured without disclosure
- affiliate status is implied but unknown
- high-risk pages use sales-led affiliate language

### trust_status_consistency_check

Blocks or warns where:

- article tone conflicts with trust status
- trust status changes inside the draft
- red/orange/green language appears without support
- needs_more_evidence is softened into a positive conclusion
- trust status support is weak but hidden

### serious_content_tone_check

Blocks drafts where serious pages use humour, banter, hype, or sales language.

Serious-content pages include:

- scam-loss pages
- warning pages
- victim-help pages
- legal-risk pages
- safety-critical pages
- withdrawal-failure pages
- wallet-drain pages
- fraud-risk pages

### Danny_approval_gate_check

Blocks drafts where Danny approval is required but missing.

Danny approval is required for:

- trust status changes
- scam/fraud/legal wording
- affiliate insertion
- publication-level approval
- final recommendations
- strong red/orange/green conclusions
- withdrawal failure claims
- serious warning pages

### proof_gap_visibility_check

Warns or blocks where proof gaps are hidden.

Proof gaps that usually block publication-level work:

- no withdrawal test where withdrawal experience is discussed strongly
- no deposit test where deposit experience is discussed strongly
- unclear regulation where regulation is presented as settled
- unclear custody where custody safety is discussed strongly
- unresolved high-risk complaints
- missing Danny review

### escalation_visibility_check

Blocks drafts where escalations exist but are not visible in the draft package.

### output_mode_check

Blocks where the draft attempts to:

- publish
- write to Supabase
- alter live content
- insert affiliate links
- alter ratings
- generate media
- call AI/API tools
- enable Safe Apply

---

## 15. Pass rules

A draft may pass_for_internal_review only where:

- template is valid
- evidence object exists
- draft package structure exists
- factual claims have evidence references
- proof gaps are visible
- no invented testing exists
- no invented screenshots exist
- no affiliate URLs are inserted
- trust status is unchanged
- required Danny approval gates are present
- current mode remains report/control only

A draft may pass_with_warnings where:

- non-blocking proof gaps are visible
- wording is cautious
- evidence is low or medium confidence but not overstated
- related content is incomplete but not falsely claimed
- source refresh is needed before future publication-level work

---

## 16. Rejection rules

A draft must be rejected where:

- evidence object is missing
- draft package is missing
- unsupported claims are present
- invented testing is present
- invented screenshots are present
- unsafe scam/fraud/legal wording is present
- affiliate misuse is present
- trust status is changed by the draft
- Danny approval is implied but absent
- unresolved escalations are hidden
- output attempts exceed READ_ONLY_REPORT_ONLY

---

## 17. Rejection loops

The safety harness must route rejected drafts as follows:

- missing evidence -> return_to_evidence_intake
- weak section support -> return_to_article_assembly
- unsupported claims -> return_to_article_assembly
- invented testing -> return_to_evidence_intake and Danny review
- invented screenshots -> return_to_evidence_intake and Danny review
- scam/fraud/legal wording -> blocked_until_escalation_resolved
- affiliate misuse -> blocked_until_escalation_resolved
- trust status mismatch -> send_to_Danny_review
- serious-content tone failure -> return_to_article_assembly
- missing Danny approval -> send_to_Danny_review

---

## 18. Safe harness outputs

The harness may produce:

- internal validation report
- blocking issue list
- warning issue list
- Danny review queue
- QA handoff summary
- evidence gap summary
- recommended next actions

The harness must not produce:

- live article updates
- Supabase writes
- published content
- affiliate links
- rating changes
- media assets
- external AI/API calls
- Safe Apply actions

---

## 19. QA handoff

The harness must hand off passing or warning drafts to QA with:

- verdict
- issue list
- evidence reference issues
- claim safety issues
- proof-gap summary
- escalation summary
- trust-status notes
- affiliate notes
- serious-content notes
- Danny approval notes

QA will pass, reject, or escalate.

QA will not rewrite the draft.

---

## 20. Danny handoff

The harness must prepare Danny review items where decisions are needed.

Danny review items include:

- final trust status support
- scam/fraud/legal wording
- withdrawal failure wording
- regulation/licensing uncertainty
- affiliate or commercial conflict
- serious warning conclusions
- publication-level readiness
- evidence that is too sensitive for agent-only handling

Danny remains the final authority.

---

## 21. Harness report status values

Allowed harness report statuses:

- generated_internal_report
- generated_with_warnings
- blocked_requires_evidence
- blocked_requires_assembly_fix
- blocked_requires_QA
- blocked_requires_Danny
- blocked_requires_escalation

---

## 22. Relationship to Build 56

Build 56 — Review Rebuild Agent v1 will only proceed after this safety harness is locked.

The future Review Rebuild Agent must not expand review drafts unless the draft package has passed the Build 55 safety harness or has a clearly documented warning/escalation route.

Build 56 must remain report-only unless a later approved workflow explicitly changes system mode.
