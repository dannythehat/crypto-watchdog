# Watchdog HQ Master Blueprint Lock v1

This is the canonical vision document for CryptoWatchdog / Watchdog HQ / Content Brain. Future AI/Codex work must read this file and `docs/WATCHDOG_HQ_BUILD_ROADMAP_STATUS.md` before proposing or building new phases.

## 1. Product Identity

CryptoWatchdog is an evidence-led crypto review, warning, trust, affiliate, SEO, and safety platform.

Watchdog HQ is the AI workforce command centre for CryptoWatchdog. It is not a generic AI content mill. It exists to help build, improve, audit, optimise, market, and safely manage the entire CryptoWatchdog content/business operation.

Watchdog HQ must strengthen the business without weakening trust. Every tool, agent, report, and future workflow must respect evidence, human judgement, reader protection, and clear commercial disclosure.

## 2. Core Operating Principle

Evidence first.
Opinion second.
AI drafting third.
SEO/media polish fourth.
Human approval before anything important goes live.

This order is locked. AI may help draft structure, identify gaps, plan improvements, and prepare review material, but it must not invent evidence, tests, ratings, guarantees, partnerships, rankings, user numbers, or final claims.

## 3. Current Safety Mode

Current system mode: READ_ONLY_REPORT_ONLY

Current safety counters:

- canAutoApply false
- approvedCount 0
- appliedCount 0

Current hard limits:

- no Supabase writes
- no publishing
- no live content edits
- no affiliate URL insertion
- no approval/apply workflow
- no AI/API calls unless explicitly approved later
- no live crawling/fetching unless explicitly approved later
- no generated reports/dashboard output committed
- no patch/diff files committed
- no secrets/API keys
- no trust rating changes without Danny
- no scam/fraud accusations without verified evidence and Danny approval

Approved and applied are future-only operational states. They must not appear in current AI/report outputs as active states.

## 4. AI Workforce Hierarchy

The Watchdog HQ workforce hierarchy is:

Danny
↓
The Gaffer / Master AI Manager
↓
Department AI Managers
↓
Named specialist / worker agents
↓
Gatekeeper Grace / QC
↓
Audit Alfie / audit trail
↓
Danny decisions
↓
Safe Apply much later

Specialist agents do not bypass department managers. Department managers do not bypass Gatekeeper Grace when risk, evidence, affiliate, rating, legal, or claim issues are involved. The Gaffer filters cross-department priorities before Danny sees them. Safe Apply Sam is future-only and blocked until a formal approval, diff, rollback, and audit system exists.

## 5. Department Model

Watchdog HQ departments:

- Command
- Content
- SEO
- Keyword Management
- Internal Linking
- External Linking / Source Support
- Research
- Evidence
- Affiliates / Offers
- Analytics
- Backlinks
- Media / Images / Video
- Social / Marketing
- QA / Brand Voice
- Approvals
- Audit / Governance
- Settings / Operations
- Future Safe Apply

Each department needs a manager, allowed inputs, allowed outputs, blocked actions, escalation paths, and quality gates. Departments coordinate through manager-to-manager routing before items reach Danny.

## 6. Named Managers And Agents

- The Gaffer — Master AI Manager. Prioritises cross-department work, creates Danny's command queue, and separates draftable, blocked, monitor-only, and Danny-decision items.
- Gatekeeper Grace — Quality Control Manager. Checks safety boundaries, unsupported claims, affiliate disclosure, rating risk, scam wording risk, and human approval needs.
- Audit Alfie — Audit Trail Manager. Defines how future detections, manager reviews, QC blocks, Master AI recommendations, and Danny decisions are recorded.
- Routey Rachel — Department Router. Routes future agent outputs to the right department manager before Danny sees anything.
- Blueprint Bella — Page Blueprint Agent. Converts weak page findings into required page structures and evidence requirements.
- Thin Page Theo — Page Quality Profiler. Detects weak, thin, underdeveloped, stale, or badly structured pages using local data.
- Rewrite Rita — Content Rebuild Agent. Future worker for rebuilding pages after evidence and blueprint requirements exist.
- Rankhound — SEO Manager. Oversees metadata, search intent, SEO prioritisation, and search opportunity review.
- Keyword Kev — Keyword Agent. Plans keyword fit, search intent, keyword gaps, and cannibalisation checks.
- Cluster Clara — Topic Cluster Agent. Plans related sections, content clusters, and strategic page relationships.
- Linksmith — Internal Linking Agent. Suggests natural internal-link opportunities and avoids spammy anchors.
- Inspector Proof — Evidence Manager. Checks source quality, proof gaps, and claim support.
- Screenshot Sam — Screenshot Evidence Agent. Plans screenshot/proof evidence needs without downloading or generating media.
- Red Flag Rita — Scam Signal Agent. Flags sensitive risk signals for evidence review without making final accusations.
- Claim Checker Colin — Unsupported Claim Guard. Blocks unsupported safety, scam/fraud, guarantee, fee, ranking, user-number, or partnership claims.
- Rating Guard Rachel — Rating Change Guard. Blocks Green/Orange/Red trust rating changes unless Danny approves.
- Offer Owl — Offer Monitoring Agent. Oversees affiliate/offer safety and commercial opportunity review.
- Expiry Eddie — Expiry Guard Agent. Tracks offer expiry, stale offers, and terms review.
- Disclosure Daisy — Affiliate Disclosure Agent. Checks commercial disclosure needs and affiliate placement risk.
- Pixel Pete — Visual Quality Agent. Oversees media and visual planning quality.
- Image Iris — Image Brief Agent. Plans image needs, alt text, and visual placement.
- Storyboard Sam — Video Brief Agent. Plans outline-only video briefs and short-form media ideas.
- Social Sophie — Social Media Manager. Plans future social and marketing distribution from approved report items.
- Metric Molly — Analytics Manager. Reads local analytics/search imports and flags performance opportunities.
- Backlink Barry — Backlink Manager. Plans future backlink and outreach opportunities without live outreach.
- Approval Ava — Approval Queue Agent. Prepares human review items but never grants approval.
- Safe Apply Sam — Future Safe Apply Engine. Future-only apply guard; blocked until explicit approval infrastructure exists.

## 7. Full Hub Capability Vision

Watchdog HQ will eventually manage, work, audit, research, update, SEO-improve, create content, market, distribute social posts, handle escalations, manage keywords, plan link placement, enforce QA and brand voice, improve article formatting, plan images and video placement, plan internal links, plan external/source links, update old content, distribute new blog posts, and update relevant related pages after new content goes live.

This vision is broad, but the operating model remains controlled: agents produce findings, drafts, briefs, reports, and review queues. Human approval remains required before anything important reaches a live user.

## 7A. Multi-Agent Foundations Readiness Lock

Before Watchdog HQ adds more specialist workers or expands the Hive, the foundations layer must be audited and locked.

The formal readiness question is:

**Can a new agent be added without inventing new rules?**

If the answer is no, the foundations are not ready yet.

Required foundation areas:

- Agent identity
- Permission model
- State machine
- Shared schemas
- Knowledge architecture
- Observability
- Rollback and incident control
- Human approval and escalation rules

Required control layers:

- Control plane: identity, policy engine, approvals, kill switch, logging
- Execution plane: agent runtime, tools, connectors, queues, retries, timeouts
- Data and memory plane: canonical knowledge, short-term task context, refresh rules, access boundaries
- Observability plane: trace IDs, structured logs, version tracking, anomaly alerts, cost tracking

Required design artifacts or equivalents:

- Root `AGENTS.md`
- Agent registry
- Capability registry
- Shared schemas for ticket input, agent output, rejection reasons, escalation reasons, and publish approvals
- Workflow/state map showing all allowed transitions
- Knowledge map documenting source-of-truth files and who can modify them
- Logging and tracing spec, including trace IDs across agent chains
- Incident and rollback playbook
- Test harness and evaluation suite for each agent class

These artifacts are the reusable rails for the Hive. Without them, adding agents may still be possible, but plugging them in safely becomes harder as the system grows.

## 7B. Four-Layer Hive Operating Model Lock

The target Watchdog HQ Hive model has four layers:

1. Human Owner Layer — Danny remains final authority for exceptions, strategic pivots, high-risk brand decisions, publishing-sensitive decisions, trust/rating decisions, affiliate-sensitive decisions, and override approvals.
2. Executive AI Layer — Chief Orchestrator, Content Operations Director, SEO Director, Brand Governance Director, Distribution Director, Media Director, and Analytics Director.
3. Department Manager Layer — managers own departments, retries, exception flows, handoffs, quality gates, and escalation discipline.
4. Specialist Worker Layer — narrow, bounded workers that perform specific tasks inside explicit permissions and contracts.

The target master departments are:

1. Executive Orchestration
2. Content Operations
3. Research & Intelligence
4. Editorial Strategy
5. Content Production
6. SEO
7. Media
8. Social & Distribution
9. QA & Governance
10. Analytics & Lifecycle

Operating rules:

- Every task has one owning department and one owning agent.
- Specialists can communicate directly only with agents in their own team, their manager, or an officially defined next-stage team.
- Cross-department requests go through managers or the Chief Orchestrator.
- QA never edits; QA only passes, rejects, or escalates.
- Managers approve retries, exception flows, and cross-team work.
- Only Executive AI or Danny can override failed governance gates.
- The full 120+ specialist Hive is a future target operating model, not the immediate build.
- Watchdog HQ must build the command structure, contracts, permissions, schemas, state flow, audit trail, and approval rails before scaling specialist agents.

The Hive model exists to stop blueprint drift. Important vision must be locked into blueprint and roadmap control docs, then built bit by bit, with completed builds clearly marked so the next step is never guessed.


## 8. Review Production Workflow

Review production workflow is locked:

1. AI agents draft review structure.
2. Draft includes evidence placeholders.
3. Danny manually adds screenshots, deposit tests, withdrawal tests, support notes, fees, KYC notes, observations, and judgement.
4. AI agents rebuild the full review article using the added evidence.
5. SEO/media/internal-link agents improve it.
6. Gatekeeper Grace checks claims, evidence, affiliate risk, rating risk, scam wording, brand voice, and approval needs.
7. The Gaffer prioritises.
8. Danny approves key decisions.
9. Safe Apply comes much later.

Drafting reviews with placeholders is allowed.
Evidence gaps are allowed.
Fake evidence/testing claims are blocked.
Danny-added evidence can be used after it exists.

The AI can create structure, questions, checklists, and draft sections that clearly mark missing evidence. It cannot claim that deposits, withdrawals, support tests, screenshots, fee checks, or KYC checks happened until Danny provides that evidence.

## 9. Content Operations Vision

Watchdog HQ content operations must support:

- new article ideas
- old content refreshes
- review rebuilds
- blog posts
- category/topic authority pages
- warnings/scam-risk pages
- related cards
- comparison sections
- FAQs
- headings
- metadata
- internal links
- external/source links
- images
- screenshots
- video briefs
- social posts
- content distribution to relevant existing pages
- updating older content after new posts go live
- brand voice and formatting QA

No page should exist without a purpose. No page should be random fluff. Every page should eventually follow a content-type blueprint.

## 10. SEO Vision

SEO work must include:

- keyword research
- metadata/title/meta description suggestions
- heading structure
- internal linking
- external source support
- content clusters
- cannibalisation/duplicate checks
- Search Console import use
- GA4 import use
- page 2 opportunities
- CTR opportunities
- stale content refreshes
- SEO prioritisation

SEO must support trust and usefulness. Search growth must not create unsupported claims, thin pages, keyword stuffing, or misleading affiliate funnels.

## 11. Affiliate / Offer Vision

Affiliate and offer work must support:

- affiliate opportunities
- affiliate disclosure
- offer expiry
- stale offer checks
- red/warning page restrictions
- no affiliate insertion without approval
- commercial opportunity without damaging trust

Affiliate links are part of the business model, but trust comes first. Warning/scam-risk/high-risk contexts require special care and human approval.

## 12. Media / Image / Video Vision

Media and video work must support:

- screenshots
- proof blocks
- diagrams
- comparison visuals
- review cards
- image placement notes
- video placement notes
- short video/social clip planning
- no media generation/download/upload yet

Media must clarify evidence, user choices, and risk. It must not imply testing, screenshots, scam/fraud conclusions, ratings, or partnerships that do not exist.

## 13. QA / Brand Voice Vision

QA and brand voice checks must cover:

- CryptoWatchdog tone
- evidence-first wording
- plain English
- sceptical but not cynical
- no fluff
- no unsupported claims
- no fake guarantees
- no unsupported scam accusations
- article formatting
- heading quality
- image/video placement
- internal/external linking
- affiliate disclosure
- review structure completeness

CryptoWatchdog should sound protective, practical, sceptical, and plain-spoken. It should not sound like a hype site or a generic AI content farm.

## 14. Lifecycle Model

Allowed current states:

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

Blocked current states:

- approved
- applied

Approved/applied are future-only operational states and are not allowed in current AI/report outputs. In the current system, a recommendation may be detected, suspected, verified, recommended, blocked, monitored, or escalated, but it must not be treated as approved or applied.

## 15. What Is Already Built

Built subsystems:

- base cw-content-brain toolkit
- sitemap/crawler/snapshot/export helper
- confidence and priority queue
- rendered verifier
- metadata engine
- internal link brain
- affiliate vault/offer tracker
- GSC/GA4 import connectors
- SEO intelligence
- research duplicate guard
- agent registry
- master command queue
- fix draft generator
- preview diff engine
- approval queue planning
- daily brief
- QC v1
- manager escalation router
- daily run orchestrator
- daily report pack
- dashboard export
- dashboard contract validator
- roadmap/coverage map
- local dashboard shell
- dashboard launcher/smoke/UI guard
- source watchlist
- agent output contract
- department inbox/router
- human decision log/audit trail
- base HQ runbook
- page quality profiler
- page blueprint agent
- content cluster/related sections agent
- media/video brief agent
- agent capability registry v2
- QC Department v2

These are local report-only foundations. They are not live writers, publishers, AI callers, or Safe Apply systems.

## 16. Next Build Roadmap

Corrected next build sequence:

- Build #49 — Watchdog HQ Master Blueprint Lock v1
- Build #50 — Content Operations Command Centre v1
- Build #51 — Content QA & Brand Voice Manager v1
- Build #52A - Watchdog HQ Multi-Agent Foundations Readiness Audit v1 - built in cw-content-brain/docs/WATCHDOG_HQ_FOUNDATIONS_READINESS_AUDIT.md
- Build #52B - Watchdog HQ Hive Operating Model v1 - next
- Build #52C — CryptoWatchdog Page Template & Themed Hub Library v1 — planned after #52B
- Build #53 — Review Evidence Intake Contract v1 — planned after #52C
- Build #54 — Review Article Assembly Contract v1 — planned
- Build #55 — Review Draft Safety Harness v1 — planned
- Build #56 — Review Rebuild Agent v1 — planned

Build #52A created the foundations readiness audit at cw-content-brain/docs/WATCHDOG_HQ_FOUNDATIONS_READINESS_AUDIT.md. It confirms Watchdog HQ has strong report-only foundations, but specialist-agent expansion remains paused until Build #52B locks the Hive operating model.

Build #52B locks the four-layer Hive model, department ownership, manager routing, escalation paths, status paths, and cross-team operating rules.

Build #52C then creates the page/template architecture library for reviews, themed hub pages, guides, warnings, comparisons, promos, news/blog posts, trusted brand boxes, review cards, related content sections, media placement, SEO rules, affiliate disclosure rules, QA/QC, and Danny approval rules.


## 17. Future Roadmap

Future phases:

- stronger content operations dashboard
- review factory
- evidence library
- SEO growth engine
- affiliate intelligence
- source monitoring
- social/media distribution
- backlink intelligence
- analytics intelligence
- controlled approvals
- Safe Apply Engine only much later

Future connectors must begin read-only and local/export-only. Future worker agents must preserve lifecycle state, evidence gaps, manager routing, QC checks, and audit trail requirements. Future Safe Apply work requires preview, diff, human approval, rollback plan, audit entry, restricted permissions, and explicit Danny approval for rating, scam/fraud/legal, affiliate, and publishing-sensitive changes.

## Locked Themed Hub and Page Architecture Vision

CryptoWatchdog pages must not feel like generic AI articles or thin SEO pages. The long-term vision is a themed, human, useful, commercially aware and trust-led page system where every serious page acts like a structured authority hub.

Every major page should have a clear purpose, a strong structure, relevant internal links, relevant external/source links where needed, related review cards, useful media placement, SEO-aware headings, and CryptoWatchdog's own opinion.

The goal is not to create random content. The goal is to build pages that help users understand crypto products, risks, scams, tools, wallets, exchanges, casinos, DeFi services, AI bots and related topics in plain English.

### Themed hub page principle

Category and topic pages should be treated as themed hubs.

Examples include:
- DeFi wallets
- Crypto exchanges
- Crypto casinos
- AI trading bots
- Hardware wallets
- Crypto tax tools
- Crypto scams and warnings
- Beginner guides
- Crypto offers and promotions

A themed hub page should normally explain:
- what the topic is
- how it works
- why people use it
- who it is suitable for
- who should be careful
- key features users should compare
- main risks and red flags
- common scams or mistakes
- trusted or reviewed brands/tools in that category
- comparison points between reviewed options
- related guides
- related reviews
- related warnings
- related blog/news posts where relevant
- FAQs
- CryptoWatchdog's own view at the bottom

### DeFi wallet example structure

A DeFi wallet page should not just define DeFi wallets. It should be organised like a proper user journey.

It should explain:
- what DeFi wallets are
- how DeFi wallets work
- why people use them
- what private keys and seed phrases mean
- why self-custody matters
- the benefits of control, privacy and no big brother watching every move
- the risks of losing seed phrases
- fake wallet app risks
- malicious approvals
- phishing links
- scam tokens
- lack of customer support if the user makes a mistake
- features to compare across reviewed wallets
- the most trusted reviewed DeFi wallets
- CryptoWatchdog's favourite options where evidence supports that view
- related guides and warnings
- FAQs
- CryptoWatchdog's final word

Trusted DeFi wallets should be shown in beautiful boxes/cards, not ugly plain text links. A trusted wallet box should normally include:
- wallet image or logo
- wallet name
- rating or trust signal where approved
- short reason it is relevant
- clear button/link to read the CryptoWatchdog review
- disclosure handling where affiliate/commercial context exists

### Review card and trusted brand box principle

Pages should use visual clickable review cards and trusted brand boxes where relevant.

A review card or trusted brand box should normally include:
- image/logo
- brand or product name
- rating/status where approved
- short reason users may care
- short risk note where relevant
- clear link to the full review
- affiliate disclosure logic where relevant

These cards should support user navigation, internal linking, SEO structure and commercial opportunities without damaging trust.

### Related content principle

New content should not sit alone.

When a new article, guide, review, warning, promo or blog post exists, Watchdog HQ should later be able to recommend:
- which older pages should link to it
- which category/topic hubs should include it
- which related review cards should show it
- which related blog sections should include it
- which old related posts should be removed if no longer relevant
- which SEO cluster it belongs to
- which social posts should be planned from it
- which images or videos should support it
- which QA, QC or Danny approval steps are needed

Related blog posts and related article sections must stay relevant. Future AI agents may recommend adding, replacing or removing related content if relevance changes.

### Human and witty brand voice

CryptoWatchdog should sound human, not corporate and not like a generic AI content farm.

The voice should be:
- evidence-first
- protection-first
- plain English
- human
- witty where appropriate
- sceptical but not cynical
- opinion-led where evidence supports the opinion
- commercially aware but trust-led
- useful before promotional

Humour is allowed where it helps the user understand the topic and does not weaken trust. Light humour can appear in explainers, category pages, final words, plain-English comparisons and opinion sections.

Humour must not be used on serious harm, scam-loss, fraud-risk, victim, legal, safety-critical or warning pages where it would feel disrespectful or reduce credibility.

CryptoWatchdog can be funny in the final word where appropriate, but serious pages stay serious.

### CryptoWatchdog final word principle

Many serious pages should include CryptoWatchdog's own view near the bottom.

This section can explain:
- what we like
- what worries us
- who the page/topic/tool is best for
- who should avoid it
- what users should check before acting
- which reviewed options are preferred where evidence supports that preference
- what evidence is still missing
- what would change our view

The final word should feel human, useful and honest. It must not invent evidence, claim testing that did not happen, guarantee safety, or make unsupported scam/fraud accusations.

### Article and page template principle

Future AI agents must follow page and article templates.

Templates must define:
- mandatory sections
- optional sections
- SEO heading requirements
- keyword intent requirements
- evidence requirements
- proof/testing placeholders
- deposit and withdrawal placeholders where relevant
- screenshot placeholders
- image placement notes
- video placement notes
- trusted brand boxes
- review cards
- comparison tables
- related guide sections
- related blog/news sections
- internal link requirements
- external/source link requirements
- affiliate disclosure requirements
- CryptoWatchdog final word requirements
- QA checks
- QC escalation rules
- Danny approval rules

No future drafting agent should create random article structures. The correct workflow is: page type -> template -> gap map -> draft/rebuild plan -> QA -> QC -> Danny review -> safe apply much later.

### Serious content exception

Warning pages, scam-risk pages, legal/policy pages, financial-risk pages and victim-help pages require stricter tone and evidence discipline.

These pages must:
- separate verified evidence from suspected claims
- avoid unsupported accusations
- avoid humour that could feel disrespectful
- avoid affiliate CTAs unless manually approved
- avoid final safety guarantees
- include practical user safety steps
- escalate to Gatekeeper Grace and Danny where needed


### Exact locked architecture phrases

The following phrases are intentionally repeated so the blueprint lock validator can protect the vision from future drift:

- Themed hub pages
- Beautiful trusted brand boxes
- Review cards
- Related blog posts
- CryptoWatchdog final word
- Human and witty brand voice
- No humour on serious scam-loss pages
- Page and article templates
- DeFi wallets
- Trusted DeFi wallets

