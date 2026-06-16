---
type: "blog"
title: "Fake Ledger App Slipped Past Apple Review and Drained $9.5 Million in One Week"
slug: "fake-ledger-app-apple-store-9-5-million-stolen"
summary: "A counterfeit Ledger Live app sat on Apple's App Store for seven days, harvested seed phrases from over 50 victims, and wiped out entire retirement funds. Here's exactly how it worked — and how to make sure you're never the next victim."
category: "Scam Alerts"
image_url: "https://pubmhnynxpcngxcgwcgf.supabase.co/storage/v1/object/public/blog-images/fake-ledger-app-9-5m-hero.jpg"
published: true
auto_generated: false
published_at: "2026-04-21T07:04:17.590743+00:00"
updated_at: "2026-04-25T06:09:34.758574+00:00"
meta_title: null
meta_description: null
---
Between **April 7 and April 13, 2026**, a fraudulent app calling itself "Ledger Live" sat quietly on Apple's App Store, fully approved, fully indexed, and fully searchable.

By the time on-chain investigator [ZachXBT](https://twitter.com/zachxbt) flagged it and Apple pulled the listing, **more than 50 people had lost a combined $9.5 million** in Bitcoin, Ether, USDT, USDC and staked ETH. One victim — American musician Garrett "G.

Love" Dutton — publicly confirmed that the **$420,000 in Bitcoin he lost was his retirement savings**.

This is the story of how a single approved app on the world's most trusted mobile marketplace turned into a multi-million dollar phishing trap, and what every crypto holder needs to do today to make sure they're never the next "G. Love".

![Phishing app icon glowing red on a smartphone screen — illustration of a fake crypto wallet app](https://pubmhnynxpcngxcgwcgf.supabase.co/storage/v1/object/public/blog-images/fake-ledger-app-9-5m-hero.jpg)

## What Actually Happened

The app was published under the developer name **"SAS Software Company"** and used a textbook **bait-and-switch** technique that Apple's automated review pipeline has struggled with for years:

1. The developer submitted a clean, harmless utility app and passed Apple's initial review.
2. Once live, the assets were swapped — name, icon, screenshots and description were quietly changed to impersonate [Ledger](https://shop.ledger.com), the French hardware wallet maker behind the legitimate **Ledger Live** software.
3. The fake app's onboarding screen asked users to "import an existing wallet" by typing in their **24-word recovery phrase**.
4. Every phrase entered was instantly transmitted to attacker-controlled servers. Wallets were drained within seconds.

ZachXBT traced the stolen funds being laundered through deposit addresses on **KuCoin**, a pattern increasingly common in 2026 attribution work.

## The Damage in Numbers

The losses were brutally concentrated at the top. Three victims accounted for **over $7.1 million** between them:

| Victim | Amount Lost | Asset |
|---|---|---|
| Anonymous holder #1 | $3.23 million | USDT |
| Anonymous holder #2 | $2.0 million | USDC |
| Anonymous holder #3 | $1.95 million | BTC, ETH, stETH |
| Garrett "G. Love" Dutton | $420,000 | BTC (retirement) |
| 46+ smaller victims | ~$1.9 million combined | Mixed |

According to Apple's own 2024 transparency disclosure, the company **rejected over 17,000 apps and blocked 37,000 fraudulent submissions** for exactly this kind of bait-and-switch behavior — yet one still got through, for a full week, in the wallet category.

## Why This One Worked

This wasn't a sideloaded APK or a Telegram link. It was inside the App Store, behind the green checkmark of "Apple has reviewed this app". Three things made it especially dangerous:

- **Trusted distribution**: iOS users are conditioned to believe that App Store = safe.
- **Brand impersonation**: Ledger is one of the most-Googled wallet brands on earth. People searching "Ledger Live" expect to find it on the App Store.
- **Plausible UX**: The fake mimicked the real onboarding flow closely enough that even experienced users entered their seed phrase without hesitation.

## How to Get the *Real* Ledger Live App

The single most important rule with hardware wallet companion apps: **never download them from a search result.** Always start at the manufacturer's official domain.

- ✅ **Official Ledger Live download**: [https://www.ledger.com/ledger-live](https://www.ledger.com/ledger-live) — links you straight to the genuine App Store and Google Play listings.
- ✅ **Buy a Ledger device direct from the manufacturer**: [shop.ledger.com](https://shop.ledger.com) — never from Amazon, eBay or third-party resellers (devices have been intercepted and tampered with).
- ✅ Read our full audit: [Ledger Nano X review on Crypto Watchdog](/reviews/ledger-nano-x).
- ✅ Considering an alternative? See our [Trezor review](/reviews/trezor) for the main open-source competitor.

The legitimate publisher on both app stores is literally **"Ledger SAS"** — not "SAS Software Company", not "Ledger Inc.", not "Ledger Wallet". If the publisher name doesn't match exactly, close the listing.

## The Golden Rule Every Victim Forgot

> **A legitimate hardware wallet app will never ask you to type your 24-word recovery phrase into a phone.**

Your seed phrase is entered **once**, on the **physical device itself**, during initial setup or recovery. That's it. Any app, website, support agent, browser extension, or pop-up that asks for it is — without exception — trying to steal your funds. There is no edge case.

## A 5-Minute Self-Audit You Can Do Right Now

If you currently hold any crypto on a hardware wallet, do this checklist before you close this tab:

1. **Open your wallet app** — confirm the publisher is the real manufacturer (Ledger SAS, SatoshiLabs, etc.).
2. **Delete any "helper", "import", or "sync" wallet app** you don't 100% recognise.
3. **Bookmark the official download page** so you never re-search for it.
4. **Move large balances to a fresh seed** if you've ever typed your phrase into anything other than the device screen.
5. **Read our** [step-by-step phishing playbook](/scam-guides) — it covers the exact red flags this attack used.

## Is the App Store Still Safe?

Apple acted quickly once notified — the app was pulled and the developer account terminated within hours. But this is at least the **third major fake-wallet incident** to clear a tier-one app store review in three years (Microsoft's store had a near-identical $600,000 Ledger clone incident in late 2023).

The lesson is uncomfortable but simple: **app store approval is a hygiene check, not a security guarantee.** Treat every wallet download as if it could be malicious until you've verified the publisher from the manufacturer's own website.

## The Bottom Line

A week-long window, one approved app, and **$9.5 million gone** — most of it from people who did everything they thought was right: they bought a real hardware wallet, they used the official mobile marketplace, they searched the brand name. The only thing they did wrong was trust a logo.

At Crypto Watchdog our motto is **Don't Trust, Verify**. Verify the publisher. Verify the URL. Verify the seed phrase request — and refuse it, every single time.

---

### Related reading

- 📘 [Ledger Nano X — full Crypto Watchdog audit](/reviews/ledger-nano-x)
- 📘 [Trezor — open-source hardware wallet review](/reviews/trezor)
- 🛡 [Active scam alerts and warnings](/warnings)
- 📚 [Scam-spotting guides — phishing, fake apps, seed-phrase theft](/scam-guides)
- 🧰 [Compare wallets side-by-side](/comparisons)

### Sources
- [Cointelegraph — Apple removes fake Ledger app that stole $9.5M](https://cointelegraph.com/news/apple-removes-fake-ledger-app-stole-9-million-from-users)
- [CoinDesk — A fake Ledger app on the App Store drained $9.5 million](https://www.coindesk.com/business/2026/04/14/a-fake-ledger-app-on-the-apple-app-store-just-drained-usd9-5-million-in-crypto)
- [AppleInsider — Bogus crypto wallet on App Store steals $9.5M](https://appleinsider.com/articles/26/04/14/bogus-crypto-wallet-on-app-store-steals-95m)
- ZachXBT on-chain analysis (X / Twitter)
