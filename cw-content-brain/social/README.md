# Social automation

Daily, platform-specific posts generated from published content and pushed via a
scheduled GitHub Action (`.github/workflows/social-daily.yml`).

## How it works
1. `build_social_posts.mjs` picks content (rotates by day: a scam warning, a
   review, a guide) and writes `social/queue/<date>.json` with per-platform copy.
2. `post_social.mjs` publishes to every platform whose secrets are set; others
   skip. `SOCIAL_MAX_POSTS` (default 1) caps how many items go out per run.
3. The Action runs `09:00 UTC` daily (or manually via "Run workflow").

## Secrets to add (Settings → Secrets and variables → Actions)
Add only the platforms you want live. **Free & easy first:**

| Platform | Secrets | How to get them |
|---|---|---|
| **Telegram** | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Create a bot via @BotFather; add it to your channel as admin; chat id = `@yourchannel` or numeric id. Free. |
| **Discord** | `DISCORD_WEBHOOK_URL` | Server → Channel → Edit → Integrations → Webhooks → New. Free, 1 min. |
| **Reddit** | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`, `REDDIT_USER_AGENT` | reddit.com/prefs/apps → create "script" app. Free. Mind subreddit self-promo rules. |
| **Facebook** | `FB_PAGE_ID`, `FB_PAGE_TOKEN` | Meta for Developers app → Page access token (long-lived). Needs app review for some perms. |
| **LinkedIn** | `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_AUTHOR_URN` | LinkedIn developer app + "Share on LinkedIn" product; URN = `urn:li:person:…` or `urn:li:organization:…`. Approval can take time. |
| **X / Twitter** | `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` | developer.x.com → app with **write** access. ⚠️ Posting needs a **paid** tier (~$100/mo Basic). |

**Recommended order:** Telegram + Discord (instant, free) → Reddit → Facebook → LinkedIn → X (only if the paid tier is worth it).

Optional repo **variable** `SOCIAL_MAX_POSTS` to post more than 1 item/day.

## Brand safety
Posts never promote red-rated platforms (the generator pulls warnings as alerts,
not endorsements). Keep Reddit posts value-first to respect community rules.
