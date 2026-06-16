// Social poster. Reads today's queue and publishes to each platform whose
// secrets are configured; others are skipped. Marks the queue file posted.
// Dependency-free (global fetch + node:crypto). Designed to run in CI.
//
// Env (set as GitHub Action secrets; any missing platform is skipped):
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
//   DISCORD_WEBHOOK_URL
//   REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD
//   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
//   LINKEDIN_ACCESS_TOKEN, LINKEDIN_AUTHOR_URN  (urn:li:person:xxx or urn:li:organization:xxx)
//   FB_PAGE_ID, FB_PAGE_TOKEN
//   SOCIAL_MAX_POSTS (default 1) — how many queue items to send this run

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const date = process.argv[2] || new Date().toISOString().slice(0, 10);
const file = `${ROOT}/cw-content-brain/social/queue/${date}.json`;
const env = process.env;
const has = (...k) => k.every((x) => env[x]);

if (!existsSync(file)) { console.log(`No queue for ${date}; nothing to post.`); process.exit(0); }
const queue = JSON.parse(readFileSync(file, "utf8"));
const max = Number(env.SOCIAL_MAX_POSTS || 1);
const items = queue.posts.slice(0, max);

async function telegram(p) {
  if (!has("TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID")) return { skip: 1 };
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: p.telegram, parse_mode: "Markdown", disable_web_page_preview: false }),
  });
  return r.ok ? { ok: 1 } : { error: await r.text() };
}

async function discord(p) {
  if (!has("DISCORD_WEBHOOK_URL")) return { skip: 1 };
  const r = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: p.discord }),
  });
  return r.ok ? { ok: 1 } : { error: await r.text() };
}

async function reddit(p) {
  if (!has("REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USERNAME", "REDDIT_PASSWORD")) return { skip: 1 };
  const ua = env.REDDIT_USER_AGENT || "cryptowatchdog-bot/1.0";
  const auth = Buffer.from(`${env.REDDIT_CLIENT_ID}:${env.REDDIT_CLIENT_SECRET}`).toString("base64");
  const tok = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: { authorization: `Basic ${auth}`, "content-type": "application/x-www-form-urlencoded", "user-agent": ua },
    body: new URLSearchParams({ grant_type: "password", username: env.REDDIT_USERNAME, password: env.REDDIT_PASSWORD }),
  }).then((r) => r.json());
  if (!tok.access_token) return { error: "reddit auth failed" };
  const r = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: { authorization: `Bearer ${tok.access_token}`, "content-type": "application/x-www-form-urlencoded", "user-agent": ua },
    body: new URLSearchParams({ sr: p.reddit.subreddit, kind: "self", title: p.reddit.title, text: p.reddit.body }),
  });
  return r.ok ? { ok: 1 } : { error: await r.text() };
}

async function x(p) {
  if (!has("X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET")) return { skip: 1 };
  const url = "https://api.twitter.com/2/tweets";
  const enc = encodeURIComponent;
  const oauth = {
    oauth_consumer_key: env.X_API_KEY, oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1", oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_token: env.X_ACCESS_TOKEN, oauth_version: "1.0",
  };
  const base = Object.keys(oauth).sort().map((k) => `${enc(k)}=${enc(oauth[k])}`).join("&");
  const sigBase = ["POST", enc(url), enc(base)].join("&");
  const key = `${enc(env.X_API_SECRET)}&${enc(env.X_ACCESS_SECRET)}`;
  oauth.oauth_signature = crypto.createHmac("sha1", key).update(sigBase).digest("base64");
  const header = "OAuth " + Object.keys(oauth).sort().map((k) => `${enc(k)}="${enc(oauth[k])}"`).join(", ");
  const r = await fetch(url, { method: "POST", headers: { authorization: header, "content-type": "application/json" }, body: JSON.stringify({ text: p.x }) });
  return r.ok ? { ok: 1 } : { error: await r.text() };
}

async function linkedin(p) {
  if (!has("LINKEDIN_ACCESS_TOKEN", "LINKEDIN_AUTHOR_URN")) return { skip: 1 };
  const r = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: { authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`, "content-type": "application/json", "X-Restli-Protocol-Version": "2.0.0" },
    body: JSON.stringify({
      author: env.LINKEDIN_AUTHOR_URN, lifecycleState: "PUBLISHED",
      specificContent: { "com.linkedin.ugc.ShareContent": { shareCommentary: { text: p.linkedin }, shareMediaCategory: "NONE" } },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });
  return r.ok ? { ok: 1 } : { error: await r.text() };
}

async function facebook(p) {
  if (!has("FB_PAGE_ID", "FB_PAGE_TOKEN")) return { skip: 1 };
  const body = new URLSearchParams({ message: p.facebook, access_token: env.FB_PAGE_TOKEN });
  if (p.url) body.set("link", p.url);
  const r = await fetch(`https://graph.facebook.com/${env.FB_PAGE_ID}/feed`, { method: "POST", body });
  return r.ok ? { ok: 1 } : { error: await r.text() };
}

const adapters = { telegram, discord, reddit, x, linkedin, facebook };
const results = [];
for (const item of items) {
  for (const [name, fn] of Object.entries(adapters)) {
    try {
      const res = await fn(item);
      results.push({ platform: name, url: item.url, ...res });
      const tag = res.ok ? "POSTED" : res.skip ? "skip (no secrets)" : `ERROR: ${String(res.error).slice(0, 120)}`;
      console.log(`  ${name.padEnd(9)} ${tag}  ${item.url}`);
    } catch (e) {
      results.push({ platform: name, url: item.url, error: String(e) });
      console.log(`  ${name.padEnd(9)} ERROR: ${e}`);
    }
  }
}

queue.status = "posted";
queue.postedAt = new Date().toISOString();
queue.results = results;
writeFileSync(file, JSON.stringify(queue, null, 2) + "\n");
const posted = results.filter((r) => r.ok).length;
console.log(`Done: ${posted} posts published across platforms.`);
