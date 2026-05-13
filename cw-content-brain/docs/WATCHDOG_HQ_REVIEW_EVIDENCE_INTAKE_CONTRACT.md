# WATCHDOG HQ — Review Evidence Intake Contract v1

Build: 53  
Status: locked v1 draft  
Mode: READ_ONLY_REPORT_ONLY  
Owner: Danny  
Control system: Watchdog HQ / CryptoWatchdog Content Brain

---

## 1. Purpose

This document defines the evidence intake contract future CryptoWatchdog agents will use before drafting, rebuilding, updating, scoring, or reviewing any CryptoWatchdog review page.

CryptoWatchdog is evidence-led. Future agents must not invent testing, screenshots, deposit notes, withdrawal notes, approval status, regulation, affiliate status, or trust-rating support.

This contract defines what evidence Danny records, how it is classified, what agents may use, what must remain as a proof gap, and what must be escalated before any stronger wording is used.

This is a control document only. It does not authorise live website edits, publishing, Supabase writes, affiliate insertion, trust rating changes, scam/fraud/legal claims, AI/API calls, media generation, or Safe Apply.

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

## 3. Evidence-first rule

Every review must separate:

1. Verified evidence
2. Danny-provided observations
3. Public source information
4. User complaint patterns
5. Unknowns and proof gaps
6. Agent-generated draft wording
7. Items requiring Danny approval

Agents must never convert a proof gap into a factual claim.

A missing deposit test is not proof of risk.

A user complaint is not automatically proof of wrongdoing.

A weak public footprint is a reason for caution, not an unsupported accusation.

---

## 4. Review evidence intake object

Each reviewed brand, platform, wallet, exchange, bot, app, service, or crypto product will use this evidence object.

Required top-level fields:

- review_id
- brand_name
- brand_url
- category
- review_type
- status
- current_trust_status
- evidence_level
- testing_status
- affiliate_status
- danny_approval_status
- last_evidence_update
- last_human_review
- evidence_items
- proof_gaps
- escalations
- agent_usage_rules

---

## 5. Allowed status values

Allowed review status values:

- draft_only
- needs_evidence
- needs_danny_review
- approved_for_draft
- approved_for_publish_later
- published
- monitoring_refresh_queue

Current mode only allows draft, control, and report work.

---

## 6. Trust status values

Allowed current_trust_status values:

- green
- orange
- red
- unrated
- needs_more_evidence

Trust status must not be changed automatically.

Only Danny approves trust status changes.

---

## 7. Evidence level values

Allowed evidence_level values:

- not_started
- low
- medium
- high
- verified_testing_available
- needs_more_evidence

Evidence level must reflect what actually exists.

---

## 8. Testing status values

Allowed testing_status values:

- not_started
- public_research_only
- account_created
- deposit_test_started
- deposit_test_completed
- withdrawal_test_started
- withdrawal_test_completed
- support_test_completed
- full_test_completed
- testing_blocked
- not_applicable

Agents must not claim a test happened unless the matching evidence exists.

---

## 9. Affiliate status values

Allowed affiliate_status values:

- unknown
- no_affiliate_relationship
- affiliate_possible
- affiliate_relationship_exists
- affiliate_link_approved_later
- affiliate_blocked_for_safety

No affiliate insertion is allowed in current mode.

---

## 10. Danny approval status values

Allowed danny_approval_status values:

- not_reviewed
- needs_danny_review
- danny_approved_for_draft
- danny_approved_for_publish_later
- danny_rejected
- escalation_required

Agents must not invent Danny approval.

---

## 11. Evidence item schema

Each evidence item must include:

- evidence_id
- evidence_type
- source_type
- source_name
- source_url
- captured_by
- captured_date
- summary
- claim_supported
- confidence
- sensitivity
- media_slot
- file_reference
- usage_allowed
- requires_danny_approval
- notes

---

## 12. Evidence types

Allowed evidence_type values:

- screenshot
- deposit_note
- withdrawal_note
- account_setup_note
- kyc_note
- fee_note
- support_note
- security_note
- custody_note
- regulation_note
- company_transparency_note
- public_source
- user_complaint_pattern
- terms_policy_note
- affiliate_note
- pricing_note
- feature_note
- risk_note
- proof_gap
- danny_observation
- other

---

## 13. Source types

Allowed source_type values:

- danny_manual_test
- danny_observation
- official_website
- official_terms
- official_support_page
- regulator_source
- app_store_listing
- public_review_site
- user_complaint_source
- blockchain_explorer
- media_article
- company_registry
- affiliate_network
- internal_note
- unknown

Agents must treat source type as part of claim strength.

---

## 14. Confidence levels

Allowed confidence values:

- low
- medium
- high
- verified

Use verified only when Danny evidence or trusted source evidence directly supports the claim.

---

## 15. Sensitivity levels

Allowed sensitivity values:

- normal
- financial_risk
- legal_risk
- scam_or_fraud_language
- victim_support
- trust_rating_change
- affiliate_conflict
- personal_data
- security_risk

Sensitive evidence must be escalated before publication-level use.

---

## 16. Usage allowed values

Allowed usage_allowed values:

- internal_only
- draft_only
- quote_allowed_after_review
- claim_allowed_after_review
- publish_allowed_after_danny_approval
- blocked

Current mode supports internal_only and draft_only control work only.

---

## 17. Core agent rules

Future agents must:

1. Use evidence only within its usage_allowed level.
2. Mark missing evidence clearly.
3. Never invent testing.
4. Never invent screenshots.
5. Never invent Danny approval.
6. Never change trust status automatically.
7. Never insert affiliate links in current mode.
8. Never publish or write live changes in current mode.
9. Escalate sensitive claims.
10. Separate evidence, opinion, and draft wording.

---

## 18. Build 53 part 1 status

This file is the core Build 53 evidence contract.

Part 2 will add detailed rules for screenshots, deposits, withdrawals, support evidence, regulation evidence, public complaints, proof gaps, escalations, Danny intake checklist, and the Build 54 handoff.

---

## 19. Screenshot evidence rules

Screenshot evidence must record:

- what the screenshot shows
- where it came from
- who captured it
- capture date
- whether personal data is visible
- whether it supports a claim
- whether it is approved for future use

Agents must not invent screenshots.

Agents must not describe screenshots as existing unless Danny has supplied them or a future approved workflow has captured them.

Screenshots containing personal data must be marked personal_data.

---

## 20. Deposit evidence rules

Deposit evidence must record:

- amount
- asset or currency
- network or payment method
- date and time
- platform account used
- whether funds arrived
- time to credit
- fees or deductions
- screenshot or proof reference
- issues encountered
- Danny approval status

Agents must not claim a deposit test happened unless this evidence exists.

---

## 21. Withdrawal evidence rules

Withdrawal evidence must record:

- amount
- asset or currency
- network or payment method
- date and time
- destination type
- whether funds arrived
- time to arrive
- fees or deductions
- screenshot or proof reference
- issues encountered
- support involvement
- Danny approval status

Withdrawal issues must be described carefully and evidence-first.

A delayed withdrawal is not automatically a scam claim.

---

## 22. Support evidence rules

Support evidence must record:

- contact method
- date and time contacted
- response time
- response quality
- unresolved issues
- screenshots or transcript notes where approved
- whether personal data is included
- Danny approval status

Support claims must not be exaggerated.

---

## 23. Regulation and licensing evidence rules

Regulation and licensing evidence must record:

- regulator or source name
- registration or licence number if available
- jurisdiction
- source URL
- date checked
- exact claim supported
- uncertainty or limitation
- Danny approval status

Agents must not infer regulation from vague website badges or marketing claims.

---

## 24. Public complaints evidence rules

Complaint evidence must record:

- source
- theme or pattern
- number of examples reviewed
- date range if known
- whether complaints are verified
- whether the brand responded
- whether the issue is isolated or repeated
- confidence level
- escalation status

Agents must not treat complaints as proven facts unless independently verified.

Safe wording examples:

- Some users report difficulty with withdrawals, but CryptoWatchdog has not independently verified every case.
- We found repeated public complaints around account access, which should be treated as a caution signal.
- This requires further evidence before stronger wording is used.

Blocked wording without Danny approval:

- This is a scam.
- They steal funds.
- The company is fraudulent.
- Users will lose their money.

---

## 25. Proof gap schema

Each proof gap must include:

- gap_id
- gap_type
- description
- why_it_matters
- risk_level
- blocks_publication
- blocks_trust_rating_change
- owner
- next_action
- status

---

## 26. Proof gap types

Allowed gap_type values:

- no_deposit_test
- no_withdrawal_test
- no_screenshot
- no_account_test
- no_support_test
- unclear_fees
- unclear_regulation
- unclear_company_ownership
- unclear_custody_model
- limited_public_sources
- unresolved_user_complaints
- affiliate_status_unknown
- trust_rating_support_missing
- media_missing
- danny_review_missing
- other

Proof gaps are allowed.

Fake certainty is blocked.

---

## 27. Escalation schema

Each escalation must include:

- escalation_id
- trigger
- severity
- owner
- required_decision
- blocked_until_resolved
- notes

---

## 28. Escalation triggers

Escalation is required for:

- scam/fraud/legal wording
- trust status changes
- red rating support
- affiliate conflict concerns
- public warning pages
- victim-support pages
- personal data in screenshots
- withdrawal failure claims
- regulation/licensing claims
- unresolved high-risk user complaints
- anything that could materially harm a brand or reader if wrong

---

## 29. Minimum evidence required by review type

### Full review

Minimum before future publication-level approval:

- official brand URL
- category
- public source notes
- fees or pricing notes where relevant
- security or custody notes where relevant
- regulation or company transparency notes where relevant
- risk notes
- proof gaps
- Danny approval status

Deposit or withdrawal testing is required where the page claims testing.

### Warning review

Minimum:

- evidence status
- source notes
- red flag observations
- uncertainty statement
- escalation record
- Danny approval status

Warning reviews must not use unsupported scam/fraud/legal claims.

### Category card source

Minimum:

- brand name
- category
- one-line summary support
- trust status support
- key caution
- link target
- Danny approval status

### Comparison source

Minimum:

- comparable fields for each brand
- evidence level for each comparison point
- proof gaps
- affiliate status
- Danny approval status

---

## 30. Intake checklist for Danny

Before future agents rebuild a review, Danny will add or confirm:

- brand name
- official URL
- category
- review type
- current trust status
- whether an account was created
- deposit evidence, if any
- withdrawal evidence, if any
- screenshots, if any
- support notes, if any
- fee or pricing observations
- KYC or account setup notes
- security or custody observations
- regulation or company transparency notes
- public source links
- complaint patterns, if reviewed
- affiliate status
- known proof gaps
- items needing careful wording
- Danny approval status

---

## 31. Department and agent access note

This contract defines the evidence object and evidence usage rules.

It does not fully wire department or agent access permissions yet.

A later permissions/capability build will map evidence types and sensitivity levels to specific departments, managers, and specialist agents.

Until then, all future agents must treat sensitive evidence as restricted and escalate it through the correct manager and Danny approval path.

---

## 32. Future workflow this contract enables

Build 53 enables the next review workflow foundation:

1. Danny adds evidence into the intake structure.
2. Evidence is marked by type, confidence, sensitivity, and usage level.
3. Proof gaps are recorded instead of hidden.
4. Escalations are created for risky claims.
5. Future assembly agents use only suitable evidence.
6. QA agents verify every claim against the evidence object.
7. Danny remains final authority before publish-level approval.

---

## 33. Relationship to Build 52C

Build 52C defines the page templates and themed hub structures.

Build 53 defines the evidence that those templates will rely on.

A review page must not move from template structure to strong claims unless the evidence intake contract supports those claims.

---

## 34. Next planned build

Next planned build after Build 53:

Build 54 — Review Article Assembly Contract v1

Build 54 will define how approved evidence becomes structured review drafts using the Build 52C page templates and Build 53 evidence contract.
