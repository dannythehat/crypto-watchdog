-- Content Automation Engine — seed data (doc 06 Phase 1)
-- FAKE/seed only. Crypto Watchdog active; Little Tiny Treasures stub (OFF).
-- Apply with: wrangler d1 execute <DB> --file=content-engine/seed.sql

-- ── Brands (doc 07) ────────────────────────────────────────────────────────
INSERT OR REPLACE INTO brands (id, name, domain, is_active, voice_profile, disclosure, config_json) VALUES
('cryptowatchdog', 'Crypto Watchdog', 'cryptowatchdog.net', 1,
 '{"tone":"evidence-led, calm, protective, independent","ratings":["GREEN","ORANGE","RED"],"reading_level":"nervous beginner; short sentences; define jargon","never":["guarantee returns","promise outcomes","imply a rating was paid for","get-rich language"]}',
 'Some links here are affiliate links — if you sign up we may earn a commission, at no cost to you. It never affects our rating. We test with our own money and don''t sell verdicts.',
 '{"channels":{"website":{"enabled":true,"target":"repo_markdown","repo":"dannythehat/crypto-watchdog","branch":"main","content_dirs":{"review":"src/content/reviews","warning":"src/content/warnings","blog":"src/content/blog"}},"x":{"enabled":true,"handle":"@cryptowatchdog","byo_credentials":true},"instagram":{"enabled":true,"handle":"cryptowatchdog"},"facebook":{"enabled":true,"page":"CryptoWatchdog"}},"posting_times_utc":["08:30","17:00"],"content_types":["warning","review","deal","promotion","news"],"compliance_profile":"financial_affiliate","image_style":"clean, evidence/forensic feel, no hype, brand colours","default_affiliate_min_trust":"GREEN","authors":{"default_id":"founder","founder":{"name":"Danny Allan","credentials":"Founder & lead analyst, CryptoWatchdog · former Complaints Manager at Crypto.com","url":"https://cryptowatchdog.net/about","image":null}}}'),
('littletinytreasures', 'Little Tiny Treasures', 'tbd', 0,
 '{"TBD":"define when switched on"}',
 '<set per its affiliate model>',
 '{"channels":{"website":{"enabled":true}},"compliance_profile":"TBD — confirm with Danny (FTC heightened scrutiny if any content targets children, doc 05 §5)","content_types":["TBD"]}');

-- ── Sources (placeholder, inactive until Phase 3) ──────────────────────────
INSERT OR REPLACE INTO sources (id, brand_id, type, url, label, is_active) VALUES
('src_cw_news',  'cryptowatchdog', 'rss',          '', 'Crypto news RSS (TBD)',      0),
('src_cw_deals', 'cryptowatchdog', 'deals_feed',   '', 'Exchange/deals feed (TBD)',  0),
('src_cw_manual','cryptowatchdog', 'manual',       '', 'Manual / Danny-initiated',   1);

-- ── Affiliates (money side, verdict-gated; doc 05). Seeded INACTIVE. ────────
INSERT OR REPLACE INTO affiliates (id, brand_id, partner, affiliate_url, min_trust_to_link, is_active) VALUES
('aff_cw_cloudbet', 'cryptowatchdog', 'Cloudbet', 'https://affiliates.cloudbet.com/referral?af_token=SEED', 'GREEN', 0),
('aff_cw_bitstarz', 'cryptowatchdog', 'BitStarz', 'https://bzstarz2.com/SEED',                              'GREEN', 0);

-- ── Fake content_queue items (doc 06 Phase 1: 3-4 PENDING_REVIEW) ──────────
-- 1) Warning (no affiliate) — should be approvable: disclosure n/a, no verdict needed.
INSERT OR REPLACE INTO content_queue
 (id, brand_id, source_id, content_type, status, title, body_md, social_variants, image_prompt, affiliate_json, disclosure_applied, ai_generated, raw_ref, editor_notes)
VALUES
('q_seed_warning_1','cryptowatchdog','src_cw_manual','warning','PENDING_REVIEW',
 'Telegram Investment Bot Scams — What We Found',
 'The red flag in one line: any Telegram bot promising fixed daily returns is the oldest scam in a new costume.\n\n**What it is / how it works**: …\n\n**The evidence**: …\n\n**What to do**: …',
 '{"x":"⚠️ Telegram \"investment bots\" promising daily profit are scams. Here is what we found 👇"}',
 'forensic dark scene, magnifying glass over a telegram bot chat, brand blue, no hype',
 NULL, 0, 1, 'seed://fake/telegram-bots', NULL);

-- 2) News (low-risk, batch-approvable) — no affiliate, no verdict.
INSERT OR REPLACE INTO content_queue
 (id, brand_id, source_id, content_type, status, title, body_md, social_variants, disclosure_applied, ai_generated, raw_ref)
VALUES
('q_seed_news_1','cryptowatchdog','src_cw_news','news','PENDING_REVIEW',
 'Market Note: BTC Holds Key Level Ahead of Fed',
 'A short, factual market note. No advice, no targets.',
 '{"x":"BTC holds its level into the Fed decision — quick context, no hype."}',
 0, 1, 'seed://fake/market-note');

-- 3) Review (flagship) — must NOT be approvable until a human verdict is set (doc 03/05).
--    Has an affiliate planned, so disclosure must be applied AND verdict>=min_trust.
INSERT OR REPLACE INTO content_queue
 (id, brand_id, source_id, content_type, status, title, body_md, social_variants, image_prompt, affiliate_json, disclosure_applied, ai_generated, human_verdict, raw_ref, editor_notes)
VALUES
('q_seed_review_1','cryptowatchdog','src_cw_manual','review','PENDING_REVIEW',
 'Cloudbet — Vetted, Not Hype',
 '**What we tested**: deposit, withdrawal timing, licensing, provably-fair.\n\n**What it does and doesn''t prove**: …\n\n**Pros / risks**: …',
 '{"x":"We put Cloudbet under the hood. Verdict + receipts 👇"}',
 'clean forensic review hero, brand blue, no hype',
 '[{"affiliate_id":"aff_cw_cloudbet","partner":"Cloudbet"}]',
 0, 1, NULL, 'seed://fake/cloudbet-review', NULL);

-- 4) Deal — affiliate planned; tests disclosure gate on a non-review type.
INSERT OR REPLACE INTO content_queue
 (id, brand_id, source_id, content_type, status, title, body_md, social_variants, affiliate_json, disclosure_applied, ai_generated, raw_ref)
VALUES
('q_seed_deal_1','cryptowatchdog','src_cw_deals','deal','PENDING_REVIEW',
 'Cloudbet Welcome Package — Worth It?',
 'The offer in one line, with expiry. Who it''s good for / who should skip it. The catch.',
 '{"x":"Cloudbet welcome package — who it''s for and the catch 👇"}',
 '[{"affiliate_id":"aff_cw_cloudbet","partner":"Cloudbet"}]',
 0, 1, 'seed://fake/cloudbet-deal');
