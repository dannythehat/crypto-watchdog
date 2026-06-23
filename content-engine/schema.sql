-- Content Automation Engine — D1 schema (doc 02)
-- SQLite / Cloudflare D1. Every table carries brand_id (multi-tenant; doc 07).
-- Apply with: wrangler d1 execute <DB> --file=content-engine/schema.sql

-- BRANDS: one row per site. Drives everything downstream.
CREATE TABLE IF NOT EXISTS brands (
  id            TEXT PRIMARY KEY,            -- 'cryptowatchdog'
  name          TEXT NOT NULL,
  domain        TEXT NOT NULL,
  is_active     INTEGER NOT NULL DEFAULT 1,  -- 0 = built but switched off
  voice_profile TEXT NOT NULL,               -- JSON (doc 04)
  disclosure    TEXT NOT NULL,               -- standard FTC disclosure string
  config_json   TEXT NOT NULL,               -- JSON (doc 07)
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- SOURCES: where daily items come from, per brand.
CREATE TABLE IF NOT EXISTS sources (
  id          TEXT PRIMARY KEY,
  brand_id    TEXT NOT NULL REFERENCES brands(id),
  type        TEXT NOT NULL,                 -- rss|news_api|deals_feed|affiliate_feed|manual
  url         TEXT,
  label       TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  last_pulled TEXT
);

-- CONTENT_QUEUE: the heart of the system. One row per draft item.
CREATE TABLE IF NOT EXISTS content_queue (
  id                 TEXT PRIMARY KEY,
  brand_id           TEXT NOT NULL REFERENCES brands(id),
  source_id          TEXT REFERENCES sources(id),
  content_type       TEXT NOT NULL,          -- warning|review|deal|promotion|news
  status             TEXT NOT NULL DEFAULT 'NEW', -- NEW→PENDING_REVIEW→APPROVED→PUBLISHED|REJECTED|FAILED
  title              TEXT,
  body_md            TEXT,
  social_variants    TEXT,                   -- JSON: per-channel short text
  image_r2_key       TEXT,
  image_prompt       TEXT,
  affiliate_json     TEXT,                   -- JSON: which affiliate links, where
  disclosure_applied INTEGER NOT NULL DEFAULT 0, -- compliance gate: must be 1 before publish
  ai_generated       INTEGER NOT NULL DEFAULT 1,
  human_verdict      TEXT,                   -- JSON {rating:'GREEN'|'ORANGE'|'RED', note:string}
  raw_ref            TEXT,                   -- original source payload/link (audit trail)
  editor_notes       TEXT,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at        TEXT,
  published_at       TEXT
);
CREATE INDEX IF NOT EXISTS idx_queue_brand_status ON content_queue(brand_id, status);

-- AFFILIATES: the money side, kept SEPARATE from ratings (doc 05).
CREATE TABLE IF NOT EXISTS affiliates (
  id                TEXT PRIMARY KEY,
  brand_id          TEXT NOT NULL REFERENCES brands(id),
  partner           TEXT NOT NULL,           -- 'Bitget'
  affiliate_url     TEXT NOT NULL,
  min_trust_to_link TEXT,                    -- 'GREEN' — link only if verdict >= this
  is_active         INTEGER NOT NULL DEFAULT 1
);

-- PUBLISH_LOG: audit trail of every publish attempt (site + each social channel).
CREATE TABLE IF NOT EXISTS publish_log (
  id           TEXT PRIMARY KEY,
  queue_id     TEXT NOT NULL REFERENCES content_queue(id),
  brand_id     TEXT NOT NULL REFERENCES brands(id),
  channel      TEXT NOT NULL,                -- website|x|instagram|facebook|...
  result       TEXT NOT NULL,                -- OK|FAILED
  detail       TEXT,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);
