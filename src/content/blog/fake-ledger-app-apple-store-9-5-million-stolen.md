---
type: "blog"
title: "Fake Ledger App Slipped Past Apple Review and Drained $9.5 Million in One Week"
slug: "fake-ledger-app-apple-store-9-5-million-stolen"
summary: "A counterfeit Ledger Live app sat on Apple's App Store for about a week in April 2026, tricked more than 50 people into typing their recovery phrases, and was linked to roughly $9.5 million in stolen crypto. Here is how it worked and how to be sure you are never the next victim."
category: "Scam Alerts"
image_url: "https://pubmhnynxpcngxcgwcgf.supabase.co/storage/v1/object/public/blog-images/fake-ledger-app-9-5m-hero.jpg"
published: true
auto_generated: false
published_at: "2026-04-21T07:04:17.590743+00:00"
updated_at: "2026-06-17T12:00:00Z"
meta_title: "Fake Ledger App on Apple Store: $9.5M Stolen"
meta_description: "A fake Ledger Live app passed Apple's App Store review and was tied to roughly $9.5M in stolen crypto. Learn how the seed-phrase scam worked and how to stay safe."
primary_keyword: "fake Ledger app Apple App Store"
---
Between roughly **April 7 and April 13, 2026**, an app calling itself "Ledger Live" sat on Apple's App Store: approved, indexed and searchable. It looked like the real companion software for the popular Ledger hardware wallet. It was not.

By the time on-chain investigator **ZachXBT** flagged it and Apple pulled the listing, the fake app had been **linked to about $9.5 million in stolen crypto from more than 50 suspected victims**, according to reporting by [Cointelegraph](https://cointelegraph.com/news/fake-ledger-app-apple-app-store-9-5m-crypto-theft-zachxbt) and [BleepingComputer](https://www.bleepingcomputer.com/news/security/fake-ledger-live-app-on-apples-app-store-stole-95m-in-crypto/). One victim, American musician Garrett "G. Love" Dutton, publicly said he lost roughly **5.92 BTC — around $420,000** — after entering his recovery phrase into the fake app.

This is how a single approved listing on one of the world's most trusted software marketplaces became a multi-million-dollar phishing trap, and exactly what every crypto holder should check today.

![Phishing app icon glowing red on a screen — illustration of a fake crypto wallet app](https://pubmhnynxpcngxcgwcgf.supabase.co/storage/v1/object/public/blog-images/fake-ledger-app-9-5m-hero.jpg)

> A quick note on the numbers: the **$9.5 million** figure is an estimate tied to the attacker's on-chain activity, first reported by ZachXBT and repeated by multiple outlets. Some details below (exact per-victim losses, total download counts) were never fully disclosed, so we flag where the public record is incomplete rather than guess.

## What actually happened

The fake app was published under the developer name **"Leva Heal Limited"** — an account that has nothing to do with **Ledger SAS**, the French company that makes the real Ledger hardware wallets and the genuine Ledger Live software ([CoinDesk](https://www.coindesk.com/business/2026/04/14/a-fake-ledger-app-on-the-apple-app-store-just-drained-usd9-5-million-in-crypto)).

It used a textbook **bait-and-switch** technique that automated app-review pipelines have struggled with for years:

1. A clean, harmless-looking app passed Apple's initial review and went live.
2. Once approved, the listing was reworked to impersonate Ledger — name, icon, screenshots and description all dressed up to look like official Ledger Live.
3. The onboarding flow asked users to "import an existing wallet" by typing in their **recovery phrase** (the 24 words that back up a wallet).
4. Every phrase entered was harvested by the attackers, who then drained the associated wallets, often within minutes.

According to ZachXBT's analysis cited across outlets, the theft spanned multiple blockchains — **Bitcoin, Ethereum (and EVM-compatible chains), Tron, Solana and the XRP Ledger** — and the stolen funds were laundered through **more than 150 deposit addresses on the KuCoin exchange**, reportedly linked to a mixing service.

### One important detail: this was a desktop app

Several outlets, including [AppleInsider](https://appleinsider.com/articles/26/04/14/bogus-crypto-wallet-on-app-store-steals-95m), reported that the malicious listing targeted the **Mac App Store** rather than iPhone users. That matters, because many people assume "App Store" only means iOS. The same bait-and-switch risk exists on desktop, and a Mac feels just as trustworthy as a phone when the green "Apple reviewed this" badge is sitting next to the download button.

The takeaway is not "iOS is safe, macOS is not." It is that **store approval — on any platform — is a hygiene check, not a security guarantee.**

## The damage, honestly framed

The losses were heavily concentrated. ZachXBT reported that a small number of victims accounted for the majority of the stolen value, while dozens of smaller victims made up the rest. The single best-documented case is the musician G. Love, who confirmed losing roughly **5.92 BTC (about $420,000)** that he described as savings ([usethebitcoin](https://usethebitcoin.com/bitcoin-news/fake-ledger-bitcoin-loss/)).

Beyond that, **precise per-victim figures were never published in full**, so we will not invent a breakdown. What the public record supports is:

- **~$9.5 million** total, estimated from on-chain flows.
- **50+ suspected victims** over roughly **one week**.
- A **handful of large wallets** drove most of the loss; many smaller wallets made up the tail.
- Funds were spread across **five or more blockchains** and funneled into **150+ KuCoin deposit addresses**.

This is a recurring pattern in 2026 attribution work, and it underlines a hard truth: once a recovery phrase leaves your control, recovery is almost never possible. There is no chargeback for a drained self-custody wallet.

## Why this scam worked

This was not a sideloaded file or a Telegram link. It was inside an official store, behind the implied endorsement of an Apple review. Three things made it unusually effective:

- **Trusted distribution.** Users are conditioned to believe "App Store = safe." The approval badge does real psychological work.
- **Brand impersonation.** Ledger is one of the most-searched wallet brands in the world. People looking for "Ledger Live" fully expect to find it in an app store, so a convincing listing rarely raises suspicion.
- **Plausible onboarding.** The fake mirrored the real setup flow closely enough that even experienced users typed in their seed phrase without a second thought.

Ledger's Chief Technology Officer, Charles Guillemet, summed up the lesson bluntly after the incident, saying the real app "will never ask for your 24 words" and warning that "you cannot trust the software environment around you — not your browser, not your app store, not your desktop" ([Cointelegraph](https://cointelegraph.com/news/fake-ledger-app-apple-app-store-9-5m-crypto-theft-zachxbt)).

## Red flags: how to spot a fake wallet app

Most victims could have stopped the theft at one of the checkpoints below. Use this table the next time you download or open any wallet software.

| Red flag | What you saw | What it really means | Safe action |
|---|---|---|---|
| App asks for your recovery phrase | "Import wallet — enter your 24 words" | Almost certainly a phishing trap | Close immediately; never type the phrase |
| Publisher name is slightly off | "Leva Heal Limited", "Ledger Inc.", "Ledger Wallet" | Impersonator, not the real maker | Verify publisher is exactly **Ledger SAS** |
| You found it via search, not the brand's site | Top result for "Ledger Live download" | Search results can be gamed or faked | Start at the manufacturer's official domain |
| Reviews are sparse, generic or very recent | A handful of five-star reviews dated this week | Possible freshly swapped listing | Treat low-history wallet apps with suspicion |
| Urgency or "sync now to avoid loss" prompts | Pressure to act fast | Classic social-engineering tactic | Slow down; legitimate apps never rush you |
| App requests phrase to "fix", "verify" or "restore" | Pop-up mid-use asking for 24 words | No legitimate reason ever exists | Refuse, every single time |

The single most important row is the first one. If you remember nothing else from this article, remember this:

> **A legitimate hardware wallet app will never ask you to type your 24-word recovery phrase into a computer or phone.**

Your recovery phrase is entered **on the physical device itself**, during setup or recovery — not into an app window, a website, a browser extension, a support chat or a pop-up. Any of those asking for it is trying to steal your funds. There is no exception and no edge case.

## How to get the *real* Ledger Live app

The core rule with hardware-wallet companion software: **never download it from a search result.** Always begin at the manufacturer's official website.

- Go to **[ledger.com/ledger-live](https://www.ledger.com/ledger-live)**, which links directly to the genuine App Store and Google Play listings.
- Confirm the publisher is exactly **Ledger SAS** — not "Leva Heal Limited", not "Ledger Inc.", not "Ledger Wallet". If the publisher name does not match, close the listing.
- Buy the device itself direct from **[shop.ledger.com](https://shop.ledger.com)**, not from third-party marketplaces where tampered units have surfaced.

If you are choosing or re-checking a device, our independent write-ups go deeper: the [Ledger Nano X review](/reviews/ledger-nano-x) and, for the main open-source alternative, the [Trezor review](/reviews/trezor). If you are still weighing which ecosystem to commit to, our [best hardware wallet 2026: Ledger vs Trezor](/blog/best-hardware-wallet-2026-ledger-vs-trezor) comparison lays out the trade-offs side by side.

> **Affiliate disclosure:** Some links below are affiliate links. If you buy through them we may earn a commission at no extra cost to you. We only recommend hardware we would use ourselves, and an affiliate link never changes our safety advice. A genuine hardware wallet is the safe alternative to a fake app — not a product we are upselling.

- Genuine Ledger devices (official store): **[/go/ledger](/go/ledger)**
- Genuine Trezor devices (open-source alternative): **[/go/trezor](/go/trezor)**

Buying real hardware does not, on its own, protect you — as this incident proves, every one of these victims owned a real wallet. What protects you is **never exposing the recovery phrase to software**, full stop.

## A 5-minute self-audit you can do right now

If you hold any crypto on a hardware wallet, run this checklist before you close the tab:

1. **Open your wallet app and check the publisher.** Confirm it is the real maker (Ledger SAS, SatoshiLabs for Trezor, and so on).
2. **Delete any "helper", "import" or "sync" wallet app** you do not fully recognise.
3. **Bookmark the official download page** so you never have to re-search for it.
4. **Move large balances to a fresh wallet and new recovery phrase** if you have *ever* typed your phrase into anything other than the device's own screen. If it was exposed, assume it is compromised.
5. **Review the warning signs** in the red-flag table above and share them with anyone you know who self-custodies.

If you are not confident managing keys yourself, it is worth understanding the genuine trade-offs between holding your own keys and using a regulated platform. Our guide to [self-custody vs custodial wallets in 2026](/blog/self-custody-vs-custodial-wallets-2026) walks through both, and if you are UK-based and weighing a regulated on-ramp, see our [best crypto exchange UK 2026](/blog/best-crypto-exchange-uk-2026) breakdown. Neither path is "safe" by default — but knowing the risks of each is how you avoid attacks like this one.

## Is the App Store still safe to use?

Apple acted quickly once notified, removing the app and terminating the developer account ([BleepingComputer](https://www.bleepingcomputer.com/news/security/fake-ledger-live-app-on-apples-app-store-stole-95m-in-crypto/)). But the action came after the losses, not before — which is the whole problem with relying on review as a safety net.

Bait-and-switch listings are hard to catch precisely because the malicious behaviour appears *after* approval. Apple does reject and remove large numbers of fraudulent apps every year, and its review process blocks far more bad actors than it misses. The honest framing is this: **app-store review meaningfully reduces risk, but it does not eliminate it — especially for high-value targets like crypto wallets.**

So the lesson is not "abandon the App Store." It is to add one habit: treat every wallet download as potentially malicious until you have verified the publisher from the manufacturer's own website, and never enter a recovery phrase into any app, ever.

## How this fits the wider 2026 scam landscape

Fake wallet apps are one branch of a much larger family of crypto scams that all rely on the same thing: getting you to hand over access voluntarily. Whether it is a counterfeit app harvesting seed phrases, a fake "mining" platform, or an "AI yield" product promising guaranteed returns, the playbook is consistent — borrow a trusted brand or interface, add urgency, and collect.

If you want to train your eye for the pattern, two recent breakdowns from our warnings desk are useful companions to this one: the [CryptoMine Pro scam warning](/warnings/cryptomine-pro-scam-warning) and the [YieldMax AI scam warning](/warnings/yieldmax-ai-scam-warning). Different lures, identical end goal.

## The bottom line

A week-long window, one approved listing, and roughly **$9.5 million gone** — much of it from people who believed they had done everything right. They bought a genuine hardware wallet, they used an official store, they searched the brand name. The one mistake was trusting a logo and typing in a recovery phrase.

At Crypto Watchdog our motto is **Don't Trust, Verify.** Verify the publisher. Verify the URL. And when anything asks for your recovery phrase, verify one final thing — that the answer is always no.

## Frequently asked questions

**Was the fake Ledger app on iPhone or Mac?**
Reporting indicates the malicious "Ledger Live" listing targeted the Mac App Store rather than iOS. The broader risk applies to any app store on any platform, because the bait-and-switch technique works the same way regardless of device.

**How much was actually stolen?**
The widely reported figure is roughly $9.5 million from more than 50 suspected victims, based on on-chain analysis first published by investigator ZachXBT and repeated by outlets including Cointelegraph, CoinDesk and BleepingComputer. Exact per-victim amounts were never fully disclosed, so treat any precise breakdown with caution.

**Can the victims get their crypto back?**
Almost certainly not. Once a recovery phrase is exposed and the wallet is drained, the transactions are final and there is no central authority to reverse them. Funds were reportedly laundered through 150+ KuCoin deposit addresses, which complicates any recovery further.

**How do I know I have the real Ledger Live app?**
Download only via the official site at ledger.com/ledger-live, and confirm the publisher on the store listing is exactly "Ledger SAS." The fake app was published by "Leva Heal Limited," which has no connection to Ledger.

**Will a real wallet app ever ask for my 24-word recovery phrase?**
No. Legitimate hardware-wallet apps never ask you to type your recovery phrase into a phone or computer. The phrase is only ever entered on the physical device itself during setup or recovery. Any app, website or person asking for it is attempting theft.

**I think I typed my phrase into a suspicious app. What now?**
Assume the phrase is compromised. Immediately move any remaining funds to a brand-new wallet generated with a fresh recovery phrase on a device you trust, and never reuse the exposed phrase. Speed matters, because attackers often drain exposed wallets within minutes.

---

### Related reading

- [Ledger Nano X — full Crypto Watchdog audit](/reviews/ledger-nano-x)
- [Trezor — open-source hardware wallet review](/reviews/trezor)
- [Best hardware wallet 2026: Ledger vs Trezor](/blog/best-hardware-wallet-2026-ledger-vs-trezor)
- [Self-custody vs custodial wallets in 2026](/blog/self-custody-vs-custodial-wallets-2026)
- [CryptoMine Pro scam warning](/warnings/cryptomine-pro-scam-warning)

### Sources
- [Cointelegraph — Fake Ledger app on Apple Store linked to $9.5M theft (ZachXBT)](https://cointelegraph.com/news/fake-ledger-app-apple-app-store-9-5m-crypto-theft-zachxbt)
- [BleepingComputer — Fake Ledger Live app on Apple's App Store stole $9.5M in crypto](https://www.bleepingcomputer.com/news/security/fake-ledger-live-app-on-apples-app-store-stole-95m-in-crypto/)
- [CoinDesk — A fake Ledger app on the Apple App Store just drained $9.5 million in crypto](https://www.coindesk.com/business/2026/04/14/a-fake-ledger-app-on-the-apple-app-store-just-drained-usd9-5-million-in-crypto)
- [AppleInsider — Bogus crypto wallet on App Store steals $9.5M](https://appleinsider.com/articles/26/04/14/bogus-crypto-wallet-on-app-store-steals-95m)
- [usethebitcoin — $424K Bitcoin loss from fake Ledger app](https://usethebitcoin.com/bitcoin-news/fake-ledger-bitcoin-loss/)
</content>
</invoke>
