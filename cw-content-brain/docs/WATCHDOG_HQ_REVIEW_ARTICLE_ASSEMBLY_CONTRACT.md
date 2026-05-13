# WATCHDOG HQ — Review Article Assembly Contract v1

Build: 54  
Status: locked v1 draft  
Mode: READ_ONLY_REPORT_ONLY  
Owner: Danny  
Control system: Watchdog HQ / CryptoWatchdog Content Brain

---

## 1. Purpose

This document defines how future CryptoWatchdog agents will turn approved evidence into structured review article drafts.

Build 54 connects:

- Build 52C — Page Template & Themed Hub Library v1
- Build 53 — Review Evidence Intake Contract v1
- Danny approval rules
- proof-gap handling
- safe claim wording
- escalation rules

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

## 3. Assembly principle

Review drafting must follow this order:

1. Select the correct Build 52C page template.
2. Load the Build 53 evidence object.
3. Check evidence usage_allowed values.
4. Separate verified evidence from proof gaps.
5. Assemble only sections supported by available evidence.
6. Mark missing evidence as placeholders or proof gaps.
7. Escalate sensitive claims before strong wording.
8. Produce a draft only.
9. Send the draft through QA, safety, and Danny approval gates before any future live action.

Agents must not start with generic article copy and then look for evidence afterwards.

Evidence leads the article.

---

## 4. Inputs required before assembly

A review article draft requires:

- selected_page_template
- review_evidence_object
- brand_name
- category
- review_type
- current_trust_status
- evidence_level
- testing_status
- affiliate_status
- danny_approval_status
- evidence_items
- proof_gaps
- escalations
- required_page_sections
- related_content_plan
- draft_usage_limit

If the evidence object is missing, the article must not be assembled as a full review.

The correct output is a request for evidence intake.

---

## 5. Template selection rules

Template selection comes from Build 52C.

Allowed review assembly template types:

- full_review
- quick_review
- warning_review
- comparison_source_review
- category_card_source
- update_review

The default full review structure must follow the Build 52C review page template.

Warning reviews must follow the Build 52C warning / scam-risk page template.

Category cards must use the Build 52C review card template.

Comparison sources must support the Build 52C comparison page template.

---

## 6. Evidence gate before drafting

Before writing any review section, the assembly agent must check:

- Is there evidence for this section?
- What type of evidence supports it?
- What confidence level applies?
- What sensitivity level applies?
- Is usage_allowed enough for draft use?
- Does this require Danny approval?
- Is there a proof gap?
- Does this claim need escalation?

If the answer is unclear, the section must be marked as a placeholder or proof gap.

---

## 7. Section assembly object

Each draft section must use this structure:

- section_id
- section_name
- template_source
- evidence_items_used
- proof_gaps_used
- claim_strength
- sensitivity_level
- usage_limit
- requires_danny_approval
- draft_text
- reviewer_notes
- blocked_phrases_checked
- qa_status

---

## 8. Claim strength values

Allowed claim_strength values:

- none
- placeholder_only
- cautious_observation
- evidence_supported
- verified_testing_supported
- danny_approved_position

Rules:

- none means no claim should be made.
- placeholder_only means the draft may ask for evidence but must not state conclusions.
- cautious_observation means soft wording is allowed.
- evidence_supported means the claim is supported by evidence.
- verified_testing_supported means Danny/manual testing supports the claim.
- danny_approved_position means Danny has approved the position.

---

## 9. Usage limit values

Allowed usage_limit values:

- internal_only
- draft_only
- qa_review_only
- danny_review_only
- publish_candidate_later
- blocked

Current mode allows only internal_only, draft_only, qa_review_only, and danny_review_only.

---

## 10. Standard review assembly flow

The future assembly workflow is:

1. Read selected page template from Build 52C.
2. Read evidence object from Build 53.
3. Validate minimum evidence for review type.
4. Build the article section map.
5. Attach evidence references to each section.
6. Attach proof gaps to relevant sections.
7. Generate cautious draft wording only where evidence supports it.
8. Add reviewer notes for missing evidence.
9. Add escalation notes for sensitive claims.
10. Add Danny approval checkpoints.
11. Output a draft package, not a live page.

---

## 11. Required draft package output

Every assembled review draft package must include:

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

---

## 12. Article status values

Allowed article status values:

- not_started
- evidence_needed
- assembly_ready
- draft_generated
- qa_required
- danny_review_required
- blocked_by_evidence_gap
- blocked_by_escalation
- approved_for_future_publish_candidate

Current mode must stop at draft/control/report stages.

---

## 13. Drafting rules

Future assembly agents must:

1. Use the selected Build 52C template.
2. Use only Build 53 evidence that allows draft use.
3. Mark proof gaps clearly.
4. Use cautious wording for uncertain evidence.
5. Avoid unsupported claims.
6. Avoid invented testing.
7. Avoid invented screenshots.
8. Avoid invented Danny approval.
9. Avoid affiliate insertion.
10. Avoid changing trust status.
11. Escalate sensitive wording.
12. Produce structured draft packages only.

---

## 14. Build 54 part 1 status

This file is the core Build 54 review article assembly contract.

Part 2 will add section-by-section assembly rules, blocked wording, safe wording, proof-gap handling, affiliate handling, trust-status handling, QA handoff, Danny approval handoff, and the Build 55 safety harness handoff.

---

## 15. Section-by-section review assembly rules

The full review template from Build 52C must assemble sections as follows.

### Quick verdict

Allowed evidence:

- current_trust_status
- evidence_level
- testing_status
- proof_gaps
- Danny approval status

Rules:

- Use cautious wording unless Danny has approved a strong position.
- Do not imply testing was completed unless testing evidence exists.
- If the brand is unrated or needs more evidence, say that clearly.

### Trust status panel

Allowed evidence:

- current_trust_status
- evidence_level
- testing_status
- affiliate_status
- last evidence update
- Danny approval status

Rules:

- Trust status must be copied from the evidence object.
- The assembly agent must not change it.
- If supporting evidence is weak, add a reviewer note.

### What the brand does

Allowed evidence:

- official website
- public source notes
- feature notes
- Danny observations

Rules:

- Describe the product plainly.
- Avoid marketing claims unless supported.

### How it works

Allowed evidence:

- official terms
- official support pages
- public source notes
- Danny observations
- screenshots where approved

Rules:

- Explain the user journey in plain English.
- Mark uncertain steps as needs evidence.

### Fees, costs, pricing and limits

Allowed evidence:

- fee notes
- pricing notes
- official terms
- screenshots where approved

Rules:

- Do not invent fees.
- If fees are unclear, mark unclear_fees as a proof gap.

### Account setup and KYC

Allowed evidence:

- account_setup_note
- kyc_note
- support_note
- Danny manual testing

Rules:

- Do not claim account setup was tested unless Danny evidence exists.

### Deposit notes

Allowed evidence:

- deposit_note
- screenshot
- Danny manual test

Rules:

- Do not claim deposits work smoothly unless evidence supports it.
- If no deposit test exists, state that no deposit test has been completed.

### Withdrawal notes

Allowed evidence:

- withdrawal_note
- screenshot
- support_note
- Danny manual test

Rules:

- Withdrawal claims require careful wording.
- Delays or issues require evidence and escalation.
- Do not use scam/fraud wording without Danny approval.

### Security and custody

Allowed evidence:

- security_note
- custody_note
- official terms
- official support page
- public source notes

Rules:

- Separate self-custody, custodial, hybrid and unclear custody models.
- If custody model is unclear, mark it as a proof gap.

### Regulation and transparency

Allowed evidence:

- regulation_note
- company_transparency_note
- regulator_source
- company_registry
- official website

Rules:

- Do not infer regulation from badges.
- Record uncertainty clearly.

### User complaints and concerns

Allowed evidence:

- user_complaint_pattern
- public review site
- media article
- Danny observation

Rules:

- Complaints must be described as reports unless independently verified.
- Complaint patterns must not become accusations.
- Escalate serious repeated complaints.

### Red flags and proof gaps

Allowed evidence:

- proof_gaps
- risk_note
- escalation records

Rules:

- Use the proof gap language from Build 53.
- Make clear that a gap is not automatically wrongdoing.

### Alternatives and related options

Allowed evidence:

- approved related review links
- category-card sources
- comparison sources

Rules:

- Do not favour affiliate options without disclosure.
- Related content must be genuinely useful.

### FAQs

Allowed evidence:

- review evidence object
- Build 52C template
- public source notes
- proof gaps

Rules:

- FAQs must not introduce new unsupported claims.

### Affiliate disclosure

Allowed evidence:

- affiliate_status
- Danny approval status

Rules:

- If affiliate status is unknown, do not imply a relationship.
- No affiliate insertion is allowed in current mode.

### CryptoWatchdog final word

Allowed evidence:

- evidence summary
- proof gaps
- escalation summary
- trust status
- Danny approval status

Rules:

- Final word must be human, useful and honest.
- It must not invent certainty.
- It must state major proof gaps where relevant.

---

## 16. Blocked wording rules

The assembly agent must block or escalate wording that claims or implies:

- confirmed scam
- fraud
- theft
- guaranteed safety
- guaranteed profit
- guaranteed withdrawals
- fully tested where testing evidence is missing
- regulator-approved where evidence is missing
- best overall where comparison evidence is missing
- CryptoWatchdog recommends where Danny approval is missing
- affiliate links are available where affiliate approval is missing

Blocked wording examples:

- This is a scam.
- They steal user funds.
- Withdrawals are guaranteed.
- This platform is fully safe.
- CryptoWatchdog recommends this without hesitation.
- We tested everything and found no issues.
- This is officially regulated, where regulation evidence is missing.

---

## 17. Safe wording rules

Safe wording examples:

- Based on the evidence currently available, this review should be treated as provisional.
- We have not yet completed a live deposit and withdrawal test.
- We found limited public evidence for this claim.
- Some users report issues, but these reports have not all been independently verified.
- This is a proof gap, not automatic proof of wrongdoing.
- This section needs Danny review before stronger wording is used.
- The evidence supports cautious wording, not a final verdict.

---

## 18. Proof-gap handling

Every proof gap from the Build 53 evidence object must be handled in one of three ways:

1. Converted into a visible review caveat.
2. Converted into an internal reviewer note.
3. Converted into an escalation item.

The assembly agent must not hide proof gaps that affect trust, testing, fees, withdrawals, custody, regulation, affiliate status, or public safety.

---

## 19. Escalation handling

Escalations must be surfaced in the draft package.

Escalation items must include:

- trigger
- section affected
- evidence involved
- blocked wording
- decision needed
- Danny approval requirement

Escalated items must not be presented as resolved.

---

## 20. Trust-status handling

Trust status must be copied from the Build 53 evidence object.

The assembly agent must not:

- upgrade a trust status
- downgrade a trust status
- create a red rating
- soften a red rating
- convert needs_more_evidence into green or orange
- hide weak evidence supporting a trust status

If the article wording appears inconsistent with the trust status, the agent must flag it for QA and Danny review.

---

## 21. Affiliate handling

Affiliate status must be copied from the Build 53 evidence object.

The assembly agent must not:

- insert affiliate URLs
- create affiliate CTAs
- imply affiliate approval
- favour affiliate brands without disclosure
- hide affiliate conflict concerns

If affiliate_status is affiliate_relationship_exists or affiliate_possible, the draft package must include an affiliate disclosure status field.

---

## 22. Related content handling

Related content must be selected based on user usefulness and evidence relevance.

Allowed related content types:

- related reviews
- related guides
- related warnings
- related comparisons
- related blog posts
- category hubs

Rules:

- Do not link only for SEO.
- Do not link to unrelated high-converting pages.
- Do not promote risky pages as safer alternatives without evidence.
- Mark missing related content as an opportunity, not as existing content.

---

## 23. QA handoff

Every assembled draft package must hand off to QA with:

- evidence items used by section
- proof gaps by section
- claims requiring verification
- blocked wording checks
- trust-status consistency notes
- affiliate disclosure notes
- serious-content exception notes
- Danny approval items

QA must be able to reject the draft without rewriting it.

---

## 24. Danny approval handoff

Every draft package must include a Danny review queue with:

- trust-status items
- scam/fraud/legal wording items
- withdrawal issue wording
- regulation/licensing claims
- affiliate disclosure or commercial conflict items
- missing evidence that blocks publication-level approval
- sections needing stronger human judgement

Approval Ava may prepare this queue later, but only Danny approves.

---

## 25. Output file principle

Current Build 54 only defines the contract.

It does not create live article files.

It does not write to Supabase.

It does not alter website routes, components, content records, ratings, affiliate links, or published pages.

Future report-only generators must output draft packages to local/report paths first.

---

## 26. Relationship to Build 55

Build 55 — Review Draft Safety Harness v1 will define the validation layer that checks assembled drafts before rebuild agents expand.

Build 55 will test for:

- unsupported claims
- missing evidence references
- invented testing
- invented screenshots
- unsafe scam/fraud wording
- affiliate misuse
- trust-status mismatch
- serious-content tone failures
- missing Danny approval gates
