---
type: "blog"
title: "Anatomy of a Rug Pull: 7 On-Chain Signals You Can Check Yourself"
slug: "anatomy-of-a-rug-pull-7-on-chain-signals-2026"
summary: "Most rug pulls show their teeth on-chain before they happen. A practical guide to the seven public signals that distinguish a legitimate token from a wallet-drainer in waiting — and the free tools you need to check them."
category: "Safety"
image_url: "https://pubmhnynxpcngxcgwcgf.supabase.co/storage/v1/object/public/blog-images/anatomy-of-a-rug-pull.jpg"
published: true
auto_generated: false
published_at: "2026-04-21T06:56:46.183808+00:00"
updated_at: "2026-04-25T06:09:35.525081+00:00"
meta_title: null
meta_description: null
---
A "rug pull" is a strangely technical-sounding name for a very ordinary fraud: a token issuer creates an asset, lures buyers in with hype, drains the liquidity pool, and disappears.

According to [Chainalysis''s 2025 Crypto Crime Report](https://www.chainalysis.com/blog/2025-crypto-crime-report-introduction/), pump-and-dumps and rug pulls together accounted for an estimated **$2.7 billion in losses in 2024**, spread across more than 200,000 distinct tokens. The median amount lost per affected user was small — that''s the point.

The total damage hides in tens of thousands of small losses spread thinly across many holders.

The good news: almost all of these scams leave fingerprints on-chain *before* they happen. The bad news: most retail buyers never check. This guide is the seven checks that take fifteen minutes and will filter out the overwhelming majority of rug pulls. None require a developer background.

All of them are free.

If you''d rather have a tool do this for you, the [Crypto Watchdog Token Checker](/token-checker) automates many of these checks across major chains. The point of this article is to teach you what the tool is looking at, so you can sanity-check it.

## Why rug pulls keep working

Two reasons. First, the on-chain transparency that makes these checks possible is also the same transparency a scammer can use to monitor the FOMO building up to a launch.

Second, most buyers operate on social signals — a coin "trending" on Twitter, a Telegram group of 50,000 people, an influencer mention — none of which tell you anything about the token contract''s structure.

The recurring lesson from our [warnings feed](/warnings) is that the social layer is where the marketing happens; the contract layer is where the truth lives. The seven signals below all sit on the contract layer.

## The seven on-chain signals

These are the checks, ordered from most-fatal-on-failure to nice-to-have. If a token fails on signals 1–3, walk away. If it passes 1–3 and fails on 4–7, walk away unless you have a very specific reason not to.

| # | Signal | Why it matters | How to check |
|---|---|---|---|
| 1 | Liquidity locked or burned | Lets you exit; without it the dev can drain | DEXScreener / De.Fi |
| 2 | Contract ownership renounced or timelocked | Owner can mint, blacklist, or pause without this | Etherscan / chain explorer |
| 3 | No mint function (or capped supply) | Lets the dev print more tokens at will | Read contract code on Etherscan |
| 4 | Holder concentration | Top wallets exiting = price collapse | DEXScreener "Holders" tab |
| 5 | Honeypot test | Some tokens can be bought but not sold | Honeypot.is |
| 6 | Initial liquidity size & age | Tiny / new pools are easy to drain | DEXScreener |
| 7 | Team & treasury wallet behaviour | Quiet accumulation by team = exit being prepared | Etherscan + Arkham |

Let''s go through each one in detail.

### 1. Liquidity locked or burned

When a project launches a token on a DEX, it pairs the new token with an established asset (ETH, USDC, BNB) in a liquidity pool. The LP tokens that represent ownership of that pool sit in someone''s wallet.

If they sit in the dev''s wallet, the dev can withdraw both sides of the pool at any moment — the textbook rug.

Legitimate projects either burn the LP tokens (sent to a dead address — irreversible) or lock them in a third-party time-lock contract (Unicrypt, Team Finance) for a published period.

**How to check**: open [DEXScreener](https://dexscreener.com/), find the trading pair, scroll to "Liquidity Info." It will tell you what percentage is locked, where, and for how long. If it says 0% locked, that is a lethal flag.

### 2. Contract ownership renounced or timelocked

Most token contracts are deployed with an "owner" address that has special privileges — typically the ability to mint new supply, blacklist wallets, change taxes, or pause trading. A dev who keeps these privileges can change the rules at any moment.

Legitimate projects either renounce ownership entirely (ownership transferred to the zero address — privileges become impossible to use) or place ownership behind a multi-signature wallet with a timelock so any change is publicly visible for 24–72 hours before it executes.

**How to check**: paste the contract address into [Etherscan](https://etherscan.io/) (or BscScan, Solscan, etc.) and look for an "Owner" or "AccessControl" function. If the owner is a regular wallet — not 0x000... and not a multisig — assume hostile until proven otherwise.

### 3. No malicious mint, blacklist, or fee functions

Rug pull contracts often look normal at first glance but contain functions like `setMaxTax(uint256)`, `addToBlacklist(address)`, or `mintTo(address, uint256)`.

These exist to let the team raise the sell tax to 100% (so you can''t exit), blacklist your address (so you can''t exit), or print enough new supply to crater the price (so your exit is worthless).

**How to check**: on the contract''s Etherscan page, click "Contract" → "Read Contract" / "Write Contract." Scan the function names. Any of these are red flags:
- `setTaxes`, `setSellFee`, `setMaxTransaction` (with no upper bound)
- `blacklist`, `addBlacklist`, `excludeFromTransfer`
- `mint`, `mintTo`, `_mint` callable post-launch
- `pause`, `setTradingEnabled`

Tokens that pass this check usually have very simple contracts based on standard OpenZeppelin templates.

### 4. Holder concentration

Even with locked liquidity and renounced ownership, a token can fail because a small number of wallets hold a huge percentage of the supply. When those wallets sell, the price collapses regardless of contract structure.

**How to check**: on DEXScreener, click the "Holders" tab. As a rough rule:
- Top 10 holders should hold less than 25% of supply (excluding burn / lock contracts)
- Top single non-contract wallet should hold less than 5%

Anything more concentrated than this and you''re betting that the whales don''t sell.

### 5. Honeypot test

A "honeypot" is a contract that lets users buy but quietly prevents them from selling. Honeypots are particularly nasty because the price chart looks great — buys keep coming in, the line goes up — and the trap only springs when you try to exit.

**How to check**: paste the contract into [Honeypot.is](https://honeypot.is/) before buying. It runs a simulated buy and sell and tells you if the sell would succeed. This is a 30-second check that will save you from a particular variety of total loss.

### 6. Initial liquidity size and age

A pool with $5,000 of liquidity is by definition trivial to drain — and trivial to manipulate. Even with locked LP tokens, thin liquidity means a single sell can move the price 50%, which is an exit problem of its own.

**How to check**: DEXScreener shows pool age, liquidity in USD, and 24h volume.

As a (very) rough rule:
- Less than $50,000 liquidity = treat as a lottery ticket
- Less than 30 days old = high baseline risk regardless of other signals
- Volume / liquidity ratio above 5x daily = suspicious wash trading

The [Token Checker](/token-checker) flags these automatically.

### 7. Team and treasury wallet behaviour

The most useful signal is also the one most retail buyers never look at: what the team and known treasury wallets are *doing* on-chain. Are they accumulating quietly into fresh wallets? Are they bridging tokens to mixers? Are they sending to an exchange in size?

**How to check**: use [Arkham Intelligence](https://intel.arkm.com/) (free tier) or DeBank to track known team wallets. Tag the deployer address, the treasury, and any address mentioned in the docs. Set notifications for outflows.

If you see deployer wallets quietly moving to centralised exchanges in the days before a "scheduled" announcement, the announcement is likely the exit, not the launch.

## A 15-minute checklist

Before any token purchase, run this exact sequence. It takes a quarter of an hour and it will filter out almost every rug pull.

1. Paste contract address into DEXScreener. Check liquidity %, lock duration, holder distribution.
2. Click through to the chain explorer. Verify ownership status and any owner-only functions.
3. Run the contract through Honeypot.is.
4. Check the deployer wallet''s history — first transactions, other tokens deployed, current balance.
5. Find the team''s claimed identities. Reverse-image-search their photos. Check the LinkedIn timestamps.
6. Read the project''s GitHub. No recent commits or no GitHub at all is a flag.
7. Run the contract address through the [Crypto Watchdog Token Checker](/token-checker) for the AI-summary view.

If anything in steps 1–4 fails, do not buy. If anything in 5–7 is uncomfortable, reduce position size or walk away.

## Why most people skip this

Honestly, because it''s boring. The reason rug pulls work is that the social experience of buying a hyped token — the Telegram group, the moonshot screenshots, the FOMO of seeing a price move — is much more engaging than reading a contract on Etherscan. The asymmetry is by design.

Scammers spend on the social layer because it bypasses the analytical layer.

The fifteen minutes of checks above don''t cost anything. They will not make you rich on the next 100x meme. They will, with quite high probability, save you from the next $500 you were about to lose.

Pair this with a [hardware wallet](/blog/hardware-wallets-2026-buyers-guide) and a habit of [revoking token approvals](/scam-guides) and you have removed most of the controllable risk in trading new tokens.

For the wider playbook on spotting fraud across the crypto stack, the [10 red flags guide](/blog/how-to-spot-crypto-scam-2026) is the companion piece to this one.

## Keep reading

- [How to spot a crypto scam in 2026: 10 red flags](/blog/how-to-spot-crypto-scam-2026)
- [Navigating the new token launch landscape](/blog/navigating-the-new-token-launch-landscape-a-guide-to-legitimacy-2026-04-19)
- [Before you ape in: DeFi protocol risks](/blog/before-you-ape-in-a-deep-dive-on-defi-protocol-risks-2026-04-21)
- [Crypto Watchdog Token Checker tool](/token-checker) · All [warnings](/warnings) and [scam guides](/scam-guides)
