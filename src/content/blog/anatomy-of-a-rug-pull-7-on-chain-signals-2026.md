---
type: "blog"
title: "Anatomy of a Rug Pull: 7 On-Chain Signals You Can Check Yourself"
slug: "anatomy-of-a-rug-pull-7-on-chain-signals-2026"
summary: "How to spot a rug pull before you buy. Seven public, on-chain checks — liquidity locks, mint authority, holder concentration, contract red flags — that take fifteen minutes, cost nothing, and filter out the overwhelming majority of token scams."
category: "Safety"
image_url: "https://pubmhnynxpcngxcgwcgf.supabase.co/storage/v1/object/public/blog-images/anatomy-of-a-rug-pull.jpg"
published: true
auto_generated: false
published_at: "2026-04-21T06:56:46.183808+00:00"
updated_at: "2026-06-17T22:30:00Z"
meta_title: "How to Spot a Rug Pull: 7 On-Chain Signals"
meta_description: "How to spot a rug pull before you buy: seven free on-chain checks — liquidity locks, mint authority, holder concentration and contract red flags — in minutes."
primary_keyword: "how to spot a rug pull"
---
A rug pull is a technical-sounding name for a very ordinary fraud. Someone creates a token, builds hype around it, persuades people to buy in, then drains the liquidity and vanishes. The buyers are left holding something that can no longer be sold.

Here's the part most people miss. Almost all of these scams leave evidence on-chain *before* they happen — in the token contract, in the liquidity pool, in the wallets that hold the supply. The blockchain is public. You can read it. And learning **how to spot a rug pull** is mostly a matter of knowing which seven things to look at, and in what order.

This guide walks through those seven signals. None of them need a developer background. All of the tools are free. The whole sequence takes about fifteen minutes, and it will catch the large majority of rugs before they catch you. We can't promise it catches every one — a determined, technically sophisticated team can hide things — but it removes most of the controllable risk.

If you'd rather have software do the first pass, the [Crypto Watchdog Token Checker](/token-checker) automates many of these checks across the major chains. The point of reading on is to understand what it's checking, so you can sanity-check its output rather than trusting it blindly.

## The numbers, and why they're worth knowing

The headline figures are genuinely grim, and they're worth sitting with for a second before you click buy on anything.

DappRadar's analysis found that rug pulls cost the web3 ecosystem close to **$6 billion in 2025**, up roughly 6,500% from about $90 million over the same period a year earlier ([Daily Hodl, April 2025](https://dailyhodl.com/2025/04/21/crypto-rug-pulls-have-soared-6499-in-volume-this-year-despite-decrease-in-frequency-says-dappradar/)). That increase looks apocalyptic, and the honest caveat is that it's heavily skewed by one event: the collapse of the real-world-asset token Mantra (OM), which DappRadar attributes around 92% of the total to. Strip that single incident out and the picture is less extreme — but still a lot of money, spread across a lot of people.

One detail in the same data matters more than the dollar total. The *number* of incidents actually fell — DappRadar logged 21 in early 2024 versus 7 in early 2025, a 66% drop. Fewer rugs, bigger losses per rug. The scams that remain are larger and more carefully staged.

Step back to the token-creation layer and Chainalysis found that **3.59% of all tokens launched in 2024 showed signs of pump-and-dump behaviour** — the activity pattern that sits underneath most rugs ([Chainalysis, 2025](https://www.chainalysis.com/blog/crypto-crime-2024-pump-and-dump/)). On a base of more than two million tokens minted, that's a very large absolute number of suspect launches. Chainalysis also noted how few new tokens survive at all: only a small fraction stayed actively traded a month after launch. Most new tokens go nowhere. A meaningful slice are engineered to fail by design.

The wider 2025 crime data from [Chainalysis](https://www.chainalysis.com/blog/2025-crypto-crime-report-introduction/) tells the same story across the whole fraud category: losses rising, scams getting more professional, and AI tooling lowering the cost of running them. We track the fallout in real time on our [warnings feed](/warnings) — and the recurring lesson there is simple. The hype lives on social media. The truth lives in the contract.

## Why rug pulls keep working

Two reasons, and neither is about people being stupid.

First, the same on-chain transparency that lets *you* check a token also lets a scammer watch the FOMO build. They can see the buying pressure forming and time their exit to it. Transparency cuts both ways.

Second, most buyers decide on social signals — a coin "trending," a Telegram group with 50,000 members, an influencer mention, a green candle. None of those tell you anything about how the token contract is actually structured. The marketing is loud and the structure is quiet, so the structure gets ignored.

The seven signals below all sit on the structural layer. That's deliberate. It's where the answer is.

## The seven on-chain signals

Here are the checks, ordered from most-fatal-on-failure down to nice-to-have. If a token fails any of signals 1 to 3, walk away — there's no version of "but the chart looks great" that survives a contract you can't safely exit. If it passes 1 to 3 but fails 4 to 7, walk away unless you have a specific, articulable reason not to.

| # | Signal | Why it matters | How to check |
|---|--------|----------------|-------------|
| 1 | Liquidity locked or burned | Without a lock, the dev can withdraw the pool and leave you holding nothing | DEXScreener / De.Fi |
| 2 | Ownership renounced or timelocked | An active owner can mint, blacklist, pause or re-tax at will | Etherscan / chain explorer |
| 3 | No open mint / blacklist / fee functions | These let the team print supply, freeze your wallet, or tax your sell to 100% | Read Contract on the explorer |
| 4 | Holder concentration | A few large wallets selling collapses the price regardless of contract quality | DEXScreener "Holders" tab |
| 5 | Honeypot test | Some tokens let you buy but silently block the sell | Honeypot.is |
| 6 | Liquidity size and pool age | Thin or brand-new pools are trivial to drain or manipulate | DEXScreener |
| 7 | Team and treasury wallet behaviour | Quiet accumulation or exchange inflows often precede an exit | Etherscan + Arkham |

Now the detail.

### 1. Liquidity locked or burned

When a project launches a token on a decentralised exchange, it pairs the new token with an established asset — ETH, USDC, BNB — in a liquidity pool. That pool is what lets buyers and sellers trade. Ownership of the pool is represented by LP (liquidity provider) tokens, and those tokens sit in a wallet somewhere.

If they sit in the developer's own wallet, the developer can pull both sides of the pool whenever they like. That's the textbook rug: the liquidity disappears, the price goes to zero, and there's nobody left to sell to.

Legitimate projects handle this one of two ways. They either *burn* the LP tokens — send them to a dead address, which is irreversible and means nobody can ever withdraw the pool — or they *lock* them in a third-party time-lock contract such as Unicrypt or Team Finance for a published period.

**How to check.** Open [DEXScreener](https://dexscreener.com/), find the trading pair, and scroll to the liquidity information. It shows what percentage is locked, where it's locked, and for how long. "0% locked" is a lethal flag. So is a lock that expires next week — a six-month lock and a six-day lock are not the same promise.

### 2. Contract ownership renounced or timelocked

Most token contracts deploy with an "owner" address holding special privileges: typically the power to mint new supply, blacklist wallets, change the trading tax, or pause transfers. A developer who keeps those privileges can change the rules on you at any moment, and you'd find out only when your sell failed.

Legitimate projects either renounce ownership entirely — transfer it to the zero address, so the privileged functions become permanently uncallable — or put ownership behind a multi-signature wallet with a timelock, so any change is announced publicly and sits visible for 24 to 72 hours before it can execute. Renouncing isn't a magic safety badge on its own, but an *active* owner wallet that's just a normal address is a reason to be cautious.

**How to check.** Paste the contract address into [Etherscan](https://etherscan.io/) (or BscScan, Solscan, and so on) and look for an `owner` or `AccessControl` field. If the owner is a plain wallet — not `0x000…dead`, not a recognised multisig — treat it as hostile until something proves otherwise.

### 3. No malicious mint, blacklist, or fee functions

This is where rug contracts hide in plain sight. A contract can look perfectly normal and still contain functions like `setMaxTax(uint256)`, `addToBlacklist(address)`, or `mintTo(address, uint256)`. Individually they sound mundane. In practice they exist to raise your sell tax to 100% so you can't exit, freeze your address so you can't exit, or print enough new supply to flatten the price so your exit is worthless.

**How to check.** On the contract's Etherscan page, open the "Contract" tab, then "Read Contract" and "Write Contract." Read the function names. These deserve a hard look:

- `setTaxes`, `setSellFee`, `setMaxTransaction` with no hard upper bound
- `blacklist`, `addBlacklist`, `excludeFromTransfer`
- `mint`, `mintTo`, or an `_mint` that's still callable after launch
- `pause`, `setTradingEnabled`

Tokens that pass cleanly tend to be short, boring contracts built on standard OpenZeppelin templates. Boring is good here. If you're not comfortable reading Solidity at all, our walkthrough on [how to vet a new token launch and avoid getting rekt](/blog/how-to-vet-a-new-crypto-token-launch-and-avoid-getting-rekt-2026-04-29) covers the same ground at a slower pace.

### 4. Holder concentration

A token can have locked liquidity, renounced ownership, and a spotless contract, and still wreck you — because a handful of wallets hold most of the supply. When those wallets sell, the price falls hard regardless of how clean the contract is. This isn't a contract attack; it's a distribution problem. People sometimes call it a "soft rug" because no function gets called — the whales simply leave.

**How to check.** On DEXScreener, open the "Holders" tab. As a rough rule of thumb:

- The top 10 holders should hold under 25% of supply, *excluding* the burn and lock contracts (those aren't people who can sell).
- The largest single non-contract wallet should hold under 5%.

More concentrated than that, and you're betting the whales stay patient. That's a bet, not an investment thesis.

### 5. Honeypot test

A honeypot is a contract that lets people buy but quietly stops them selling. It's a nasty design precisely because the chart looks healthy — buys keep landing, the line keeps climbing — and the trap only springs when *you* try to exit and discover the sell reverts.

**How to check.** Paste the contract into [Honeypot.is](https://honeypot.is/) before you buy. It runs a simulated buy and sell and tells you whether the sell would actually go through, plus the real buy and sell tax. It's a 30-second check that rules out an entire category of total loss. One caveat worth flagging: a sophisticated contract can pass a simulation now and switch on the trap later via an owner function — which is exactly why signal 2 sits above this one.

### 6. Initial liquidity size and age

A pool holding $5,000 of liquidity is trivial to drain and trivial to manipulate. Even with the LP tokens locked, thin liquidity means a single ordinary-sized sell can move the price 30 to 50%, which is its own exit problem — you can't get out at the price the chart shows you.

**How to check.** DEXScreener displays pool age, liquidity in USD, and 24-hour volume. As a *very* rough frame:

- Under ~$50,000 of liquidity: treat it as a lottery ticket, not a position.
- Under 30 days old: elevated baseline risk no matter how clean the other signals look.
- A 24-hour volume that dwarfs the liquidity (say, more than 5x) can point to wash trading inflating the activity.

These are heuristics, not laws. A legitimate new project can be young and thin on day one. The point is to size your risk to match, not to pretend the risk isn't there. The [Token Checker](/token-checker) flags these automatically.

### 7. Team and treasury wallet behaviour

The most useful signal is the one almost nobody checks: what the team and known treasury wallets are actually *doing* on-chain. Are they quietly moving tokens into fresh wallets? Bridging to mixers? Sending size to a centralised exchange right before a "big announcement"?

**How to check.** Use [Arkham Intelligence](https://intel.arkm.com/) (free tier) or DeBank to follow the deployer address, the treasury, and any wallet named in the project's documentation. Tag them and set alerts on outflows. If deployer wallets start drifting to exchanges in the days before a scheduled announcement, there's a fair chance the announcement *is* the exit rather than a launch.

This one rewards patience. It's also the signal that most often gives you a few hours' warning before everyone else notices.

## A 15-minute checklist

Run this exact sequence before any token purchase. It takes a quarter of an hour and filters out almost every rug.

1. Paste the contract into DEXScreener. Check liquidity %, lock duration, and holder distribution.
2. Click through to the chain explorer. Verify ownership status and read the owner-only functions.
3. Run the contract through Honeypot.is.
4. Check the deployer wallet's history — its first transactions, other tokens it has launched, current balance.
5. Find the team's claimed identities. Reverse-image-search their photos. Check when the LinkedIn profiles were actually created.
6. Read the project's GitHub. No recent commits, or no GitHub at all, is a flag for anything claiming to be a real protocol.
7. Run the address through the [Crypto Watchdog Token Checker](/token-checker) for the summary view, then compare it against what you found by hand.

If anything in steps 1 to 4 fails, don't buy. If anything in 5 to 7 sits wrong with you, cut your position size or walk away. Walking away from a launch costs you nothing except a token you were never owed.

## Why most people skip all this

Honestly? Because it's dull. The social side of buying a hyped token — the Telegram group, the moonshot screenshots, the rush of watching a green candle in real time — is far more engaging than reading Solidity on a block explorer. That asymmetry isn't accidental. Scammers pour effort into the social layer precisely because it routes around the analytical one. The fun bit and the safe bit are deliberately kept apart.

The fifteen minutes above won't make you rich on the next meme coin. They won't tell you which token goes up. What they'll do, with fairly high reliability, is keep the next few hundred dollars in your wallet instead of someone else's.

Pair these checks with a hardware wallet, a habit of revoking stale token approvals, and a quick scan of the projects we've already flagged on our [DeFi platforms hub](/defi-platforms) and [warnings feed](/warnings). And if you've already been hit — first, this wasn't your fault for failing to read a contract a scammer designed to be unreadable. Second, be doubly careful afterwards: recovery scammers actively hunt rug victims, promising to claw funds back for an upfront fee — a promise nobody can honestly make. Our [crypto recovery](/crypto-recovery) resources explain why that second wave is just the first scam wearing a different name.

## Frequently asked questions

### How can I spot a rug pull before I buy?

Run the seven checks above, in order. The three that matter most: confirm the liquidity is locked or burned (DEXScreener), confirm contract ownership is renounced or behind a timelocked multisig (your chain explorer), and confirm there are no open mint, blacklist, or unbounded-fee functions (Read Contract on the explorer). If a token fails any of those three, that's your answer. The remaining four — holder concentration, a honeypot simulation, liquidity depth and age, and team wallet behaviour — refine the picture.

### Does locked liquidity mean a token is safe?

No. A liquidity lock stops one specific attack — the developer withdrawing the pool — and nothing else. A token with perfectly locked liquidity can still rug through a malicious contract function, a honeypot, or a concentrated set of whale wallets dumping at once. Locked liquidity is necessary, not sufficient. Check the lock's *duration* too: a lock that expires in a few days is barely a lock at all.

### Are rug pulls illegal, and can I get my money back?

In most jurisdictions an intentional rug pull is fraud, and regulators and law enforcement do occasionally pursue cases. But blockchain transactions don't reverse, and anonymous overseas teams are hard to identify, let alone prosecute. Realistically, recovery is rare. The honest position is that prevention is the only reliable defence — and that anyone messaging you with a foolproof way to recover rugged funds for a fee is running a second scam. We cover that pattern in our [crypto recovery](/crypto-recovery) section.

### What's the difference between a hard rug and a soft rug?

A hard rug is the dramatic version: the team drains the liquidity pool or mints unlimited supply, and the price goes to zero in minutes. A soft rug is slower and quieter — the team and connected whales gradually sell their large holdings into buyers' demand until there's nothing left to support the price. No contract function gets called in a soft rug, which is why signal 4 (holder concentration) and signal 7 (wallet behaviour) matter even when the contract itself looks clean.

### Which free tools do I actually need?

Four cover the essentials. DEXScreener for liquidity, holders and pool age. Your chain's block explorer — Etherscan, BscScan, Solscan — for ownership and contract functions. Honeypot.is for the buy/sell simulation. Arkham Intelligence or DeBank for tracking team and treasury wallets. Our [Token Checker](/token-checker) bundles several of these into one view, but it's worth knowing the underlying tools so you can verify anything that looks off.

## Keep reading

- [How to vet a new crypto token launch and avoid getting rekt](/blog/how-to-vet-a-new-crypto-token-launch-and-avoid-getting-rekt-2026-04-29)
- [The new token launch landscape: a guide to legitimacy](/blog/navigating-the-new-token-launch-landscape-a-guide-to-legitimacy-2026-04-19)
- [Before you ape in: DeFi protocol risks](/blog/before-you-ape-in-a-deep-dive-on-defi-protocol-risks-2026-04-21)
- [DeFi platforms hub](/defi-platforms) · All [warnings](/warnings) · [Crypto recovery](/crypto-recovery) · [Token Checker tool](/token-checker)
