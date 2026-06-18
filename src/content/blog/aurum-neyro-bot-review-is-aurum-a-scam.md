---
type: "blog"
title: "Aurum Neyro Bot Review 2026: Is Aurum a Scam? What We Found After Following the Blockchain"
slug: "aurum-neyro-bot-review-is-aurum-a-scam"
summary: "We stopped arguing about Aurum Neyro and followed the chain instead. Real BSC-USD payments, a paying wallet holding ~38.7M, PancakeSwap V3 liquidity activity, and a public Hacken audit — here's the evidence, screenshot by screenshot, and what it does and doesn't prove."
category: "AI Finance"
image_url: "/aurum/hero-aurum-neyro-vs-watchdog.png"
published: true
auto_generated: false
published_at: "2026-06-18T08:00:00Z"
updated_at: "2026-06-18T08:00:00Z"
meta_title: "Aurum Neyro Bot Review 2026: Is Aurum a Scam? On-Chain Evidence"
meta_description: "A Crypto Watchdog investigation into the Aurum Neyro Bot: real BscScan payments, the paying treasury wallet, PancakeSwap V3 activity, BSC-USD, the Hacken audit, and the facts critics miss. Evidence-led, not hype."
primary_keyword: "Aurum Neyro Bot"
---
Type "Is Aurum a scam?" into Google and you'll get two camps shouting past each other. On one side, loyal users posting payout screenshots. On the other, instant "it's a Ponzi" replies from people who've never looked at a single transaction. Almost nobody in the middle doing the boring bit: actually following the money.

So that's what we did. This isn't a promo and it isn't a takedown. It's a record of what we could see on-chain as of 18 June 2026 — the payments, the wallet behind them, the smart-contract activity, the public audit — and an honest line on where the evidence stops.

One thing up front, because it matters for trust: Aurum is one of our affiliate partners, and it's a platform we use ourselves. We earn a commission if you sign up through the link in this article. That's exactly why the rest of it leans on things you can verify yourself on a block explorer, not on our say-so. Where something is the company's own claim, we say so.

> **The short version:** The evidence we reviewed does *not* support the popular claim that Aurum Neyro is "just a fake dashboard with no real on-chain activity." We saw real BSC-USD payments, a paying wallet holding around 38.7 million BSC-USD, PancakeSwap V3 liquidity interactions, and a public Hacken audit. That doesn't make returns guaranteed — it's still high-risk DeFi — but the lazy "it's all fake" argument doesn't survive the chain.

## What is the Aurum Neyro bot?

Neyro is the AI trading and liquidity layer connected to the Aurum ecosystem. The pitch is self-custody: you connect a wallet, take part through a smart-contract workflow, and receive profit distributions on-chain — rather than handing your money to a company wallet and hoping it pays you back later.

That distinction is the whole game. "Send us your funds and we'll pay you" is pure custodial trust, and it's how most exit scams are built. A system that creates visible on-chain interactions — wallets, contracts, stablecoin transfers, real DeFi infrastructure — still carries risk, but at least parts of it can be inspected by anyone. Neyro positions itself firmly in the second group.

The project markets Neyro with the usual feature list: zero slippage, sub-second execution, multi-chain support, lower fees, self-custody, no KYC. Useful for understanding how it sells itself — but marketing isn't proof, so we set it aside and went looking for the evidence.

<figure class="not-prose my-7">
  <img src="/aurum/neyro-vs-dexs.jpg" alt="Neyro comparison graphic: zero slippage, sub-second execution, multi-chain support and lower fees versus other DEXs" class="mx-auto w-full max-w-xl rounded-xl border border-border shadow-md" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted-foreground">Official Neyro comparison graphic. These are the project's own claims — treated here as marketing, not independent proof.</figcaption>
</figure>

## Why people warn about Aurum (and why that's fair)

The warnings aren't surprising, and we won't pretend they're stupid. Crypto is littered with projects that promised daily income, "secret" strategies and effortless returns, then vanished. When people hear "bot that pays regularly," the alarm bell is a reasonable reflex.

The common objections are all worth asking: the returns sound too high, the marketing leans on buzzwords, the trading logic isn't fully public, and users may not understand exactly what they're signing when they connect a wallet. A serious review shouldn't wave those away.

There's a difference, though, between asking hard questions and declaring something fake without checking. The screenshots below show Aurum Neyro isn't merely a number on a website. There are real transactions, a real funding wallet, real contracts and public audit material. None of that answers every risk question — but it changes the conversation from "is anything real?" to "how strong is it, and what are the risks?"

## The evidence, exhibit by exhibit

We reviewed wallet connection screens, BscScan transaction records, token transfer logs, PancakeSwap V3 interaction logs, the paying wallet's holdings, a SolidityScan result and Hacken's published Neyro audit. Here's what each one showed.

### Exhibit 1 — The wallet connection is real and self-custody style

The starting point: a WalletConnect-style connection to Aurum, with Ethereum and BNB Smart Chain enabled and the user's own wallet address on show. This isn't an account on a company server — it's a wallet the user controls, linked to `backoffice.aurum.foundation`.

<figure class="not-prose mx-auto my-7 max-w-sm">
  <div class="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
    <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
      <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-green-400"></span>
      <span class="ml-2 inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">📱 Trust Wallet · backoffice.aurum.foundation</span>
    </div>
    <img src="/aurum/ev-wallet-connection.png" alt="Wallet connection screen showing Aurum connected through Trust Wallet with Ethereum and BNB Smart Chain enabled" class="w-full" loading="lazy" />
  </div>
  <figcaption class="mt-2 text-center text-xs text-muted-foreground"><span class="font-semibold text-foreground">Exhibit 1.</span> Wallet connected to Aurum via Trust Wallet, Ethereum and BNB Smart Chain enabled.</figcaption>
</figure>

### Exhibit 2 — A real BSC-USD payment landed on-chain

The simplest question first: does anything actually arrive? A dashboard balance is easy to fake; a blockchain transfer isn't.

We saw a successful BNB Smart Chain transaction moving **7.90177338 BSC-USD (≈ $7.89)** to the user's wallet ending in `17aC9F`, complete with a transaction hash. Not an in-app number — an on-chain token transfer you can pull up yourself.

<figure class="not-prose mx-auto my-7 max-w-sm">
  <div class="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
    <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
      <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-green-400"></span>
      <span class="ml-2 inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">🔒 bscscan.com</span>
    </div>
    <img src="/aurum/ev-payment-action.png" alt="BscScan transaction action showing 7.90177338 BSC-USD transferred to the user wallet" class="w-full" loading="lazy" />
  </div>
  <figcaption class="mt-2 text-center text-xs text-muted-foreground"><span class="font-semibold text-foreground">Exhibit 2.</span> A 7.90177338 BSC-USD profit payment, transferred to the user's wallet.</figcaption>
</figure>

It cleared, too. The same transaction shows a **Success** status, a confirmed block (104709250, 2,825 confirmations) and a timestamp of Jun-17-2026.

<figure class="not-prose mx-auto my-7 max-w-sm">
  <div class="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
    <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
      <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-green-400"></span>
      <span class="ml-2 inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">🔒 bscscan.com</span>
    </div>
    <img src="/aurum/ev-success-timestamp.png" alt="BscScan transaction details showing Success status, block confirmation and timestamp" class="w-full" loading="lazy" />
  </div>
  <figcaption class="mt-2 text-center text-xs text-muted-foreground"><span class="font-semibold text-foreground">Exhibit 3.</span> The same transaction — Success, block confirmed, timestamped.</figcaption>
</figure>

This doesn't prove payouts continue forever or that the model is sustainable. It proves one concrete thing: a real stablecoin payment landed in the user's wallet and is verifiable on BscScan.

### Exhibit 4 — The paying wallet isn't a throwaway

Next: where did the money come from? The sending address (`0x92b7807b…`) wasn't an empty wallet topped up for a screenshot. On its token holder page it showed roughly **38.7 million BSC-USD** and **more than 100,000 transactions**.

That's not proof of legitimacy on its own — a big wallet can still belong to a risky operation, and volume doesn't equal honest economics. But it does kill the "there's no real money behind this" line. Fair open questions remain: who controls it (treasury, operator, market-maker, distribution wallet?), and how much is genuinely available for user payouts. We can't answer those from a screenshot, and we won't pretend to.

<figure class="not-prose mx-auto my-7 max-w-sm">
  <div class="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
    <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
      <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-green-400"></span>
      <span class="ml-2 inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">🔒 bscscan.com</span>
    </div>
    <img src="/aurum/ev-treasury-wallet.png" alt="BscScan token holder view showing the paying wallet with ~38.7M BSC-USD and 100,000+ transactions" class="w-full" loading="lazy" />
  </div>
  <figcaption class="mt-2 text-center text-xs text-muted-foreground"><span class="font-semibold text-foreground">Exhibit 4.</span> The paying wallet: ~38.7M BSC-USD balance, 100,000+ transactions.</figcaption>
</figure>

### Exhibit 5 — Real PancakeSwap V3 liquidity activity

This was the most interesting part. The transaction context — not just the payment — showed interaction with the **PancakeSwap V3 Nonfungible Position Manager**, the contract used to manage concentrated liquidity positions. The event names included **Burn** and **Collect**, which in plain terms are associated with managing a liquidity position and collecting its fees.

<figure class="not-prose mx-auto my-7 max-w-sm">
  <div class="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
    <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
      <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-green-400"></span>
      <span class="ml-2 inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">🔒 bscscan.com</span>
    </div>
    <img src="/aurum/ev-pancakeswap-v3.png" alt="BscScan transaction page showing interaction with PancakeSwap V3 Nonfungible Position Manager and a BEP-20 BSC-USD transfer" class="w-full" loading="lazy" />
  </div>
  <figcaption class="mt-2 text-center text-xs text-muted-foreground"><span class="font-semibold text-foreground">Exhibit 5.</span> Interaction with the PancakeSwap V3 Nonfungible Position Manager.</figcaption>
</figure>

<div class="grid gap-4 sm:grid-cols-2">
<figure class="not-prose mx-auto my-2 max-w-sm">
  <div class="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
    <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
      <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-green-400"></span>
      <span class="ml-2 inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">🔒 bscscan.com</span>
    </div>
    <img src="/aurum/ev-burn-event.png" alt="Transaction logs showing a Burn event tied to PancakeSwap V3 liquidity-position activity" class="w-full" loading="lazy" />
  </div>
  <figcaption class="mt-2 text-center text-xs text-muted-foreground"><span class="font-semibold text-foreground">Exhibit 6.</span> A <strong>Burn</strong> event in the logs.</figcaption>
</figure>
<figure class="not-prose mx-auto my-2 max-w-sm">
  <div class="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
    <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
      <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-green-400"></span>
      <span class="ml-2 inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">🔒 bscscan.com</span>
    </div>
    <img src="/aurum/ev-collect-event.png" alt="Transaction logs showing a Collect event, another PancakeSwap V3 liquidity-position event" class="w-full" loading="lazy" />
  </div>
  <figcaption class="mt-2 text-center text-xs text-muted-foreground"><span class="font-semibold text-foreground">Exhibit 7.</span> A <strong>Collect</strong> event in the logs.</figcaption>
</figure>
</div>

A common criticism of bots like this is that there's no real DeFi happening behind the curtain. The trail here doesn't prove the entire strategy or that the advertised return is sustainable — but it does show activity consistent with genuine liquidity management on recognised infrastructure. "There's no DeFi activity at all" isn't supported by what we saw.

### Exhibit 6 — Paid in a recognised BNB Chain stablecoin

The payout token was **Binance-Peg BSC-USD**, a mainstream BEP-20 stablecoin on BNB Smart Chain, trading at roughly $0.999 with a huge supply and holder base — not an obscure reward point with no market.

<div class="grid gap-4 sm:grid-cols-2">
<figure class="not-prose mx-auto my-2 max-w-sm">
  <div class="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
    <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
      <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-green-400"></span>
      <span class="ml-2 inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">🔒 bscscan.com</span>
    </div>
    <img src="/aurum/ev-bscusd-token.png" alt="BscScan token header for Binance-Peg BSC-USD, verified" class="w-full" loading="lazy" />
  </div>
  <figcaption class="mt-2 text-center text-xs text-muted-foreground"><span class="font-semibold text-foreground">Exhibit 8.</span> Binance-Peg BSC-USD — a verified token.</figcaption>
</figure>
<figure class="not-prose mx-auto my-2 max-w-sm">
  <div class="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
    <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
      <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-green-400"></span>
      <span class="ml-2 inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">🔒 bscscan.com</span>
    </div>
    <img src="/aurum/ev-bscusd-market.png" alt="BscScan market and supply data for BSC-USD: price near one dollar, large supply and holder base" class="w-full" loading="lazy" />
  </div>
  <figcaption class="mt-2 text-center text-xs text-muted-foreground"><span class="font-semibold text-foreground">Exhibit 9.</span> BSC-USD market data — price ≈ $0.999, large supply.</figcaption>
</figure>
</div>

One practical note while we're here: BEP-20 tokens use approvals and allowances. Connecting a wallet isn't the same as granting a spending approval, but a DeFi workflow can involve approvals or contract deposits. Whatever platform you use, check what you've approved and to whom, and inspect your activation transaction where you can.

## Security and the smart-contract audit

Critics often claim projects like this have no serious technical review. That one's checkable too.

At the time of writing, Hacken's public Neyro page lists a smart-contract assessment — **[SCA] Neyro | Neyro SC | May2026**, dated **27 May 2026**. Hacken describes Neyro as a liquidity-management solution that automates USDT deposits into PancakeSwap V3 positions on BNB Smart Chain through a role-based operator mechanism, written in Solidity.

Read the audit properly, though. Hacken lists **16 findings** — and "audited" never means "flawless." It means issues were found, classified, and handled through resolution, mitigation or acceptance. That's what a real review looks like.

<div class="not-prose my-7 rounded-2xl border border-border bg-card p-6 shadow-md">
  <div class="flex items-center justify-between gap-3">
    <p class="text-xs font-bold uppercase tracking-widest text-primary">Hacken Neyro audit · May 2026</p>
    <p class="text-sm font-semibold text-muted-foreground">16 findings</p>
  </div>
  <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">How they were handled</p>
  <div class="mt-2 flex h-6 w-full overflow-hidden rounded-full text-[11px] font-bold text-white">
    <div class="flex items-center justify-center bg-emerald-500" style="width:31.25%">5 resolved</div>
    <div class="flex items-center justify-center bg-amber-500" style="width:43.75%">7 accepted</div>
    <div class="flex items-center justify-center bg-sky-500" style="width:25%">4 mitigated</div>
  </div>
  <p class="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">By severity</p>
  <div class="mt-2 grid grid-cols-3 gap-3 text-center">
    <div class="rounded-lg border border-border bg-background p-3">
      <p class="text-2xl font-bold text-amber-500">2</p>
      <p class="text-xs text-muted-foreground">Medium</p>
    </div>
    <div class="rounded-lg border border-border bg-background p-3">
      <p class="text-2xl font-bold text-sky-500">3</p>
      <p class="text-xs text-muted-foreground">Low</p>
    </div>
    <div class="rounded-lg border border-border bg-background p-3">
      <p class="text-2xl font-bold text-muted-foreground">11</p>
      <p class="text-xs text-muted-foreground">Observation</p>
    </div>
  </div>
  <p class="mt-4 text-xs text-muted-foreground">Source: <a href="https://hacken.io/a/FJoS_A" target="_blank" rel="noopener noreferrer" class="text-primary underline">Hacken Neyro audit page</a>. No audit guarantees future performance or removes market risk.</p>
</div>

Alongside Hacken, a **SolidityScan** result on the contract showed a vulnerability score of **95.88/100** ("GREAT"), with **0 critical, 0 high and 0 medium** findings in that scan (2 low, plus informational and gas items). Treat that as automated review support — a positive signal, not a guarantee.

<figure class="not-prose mx-auto my-7 max-w-sm">
  <div class="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
    <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
      <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-green-400"></span>
      <span class="ml-2 inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">🔒 bscscan.com</span>
    </div>
    <img src="/aurum/ev-solidityscan.png" alt="SolidityScan result showing a 95.88/100 vulnerability score with 0 critical, 0 high and 0 medium findings" class="w-full" loading="lazy" />
  </div>
  <figcaption class="mt-2 text-center text-xs text-muted-foreground"><span class="font-semibold text-foreground">Exhibit 10.</span> SolidityScan: 95.88/100, 0 critical / 0 high / 0 medium.</figcaption>
</figure>

A public third-party audit plus visible contract analysis is a long way ahead of a project that just says "trust us" with nothing behind it. We'll publish a separate Crypto Watchdog breakdown of the Hacken audit — what each finding means, what was resolved, what was accepted, and what an audit can and can't tell you before you rely on it.

<figure class="not-prose my-7">
  <img src="/aurum/neyro-hacken-audit.jpg" alt="Neyro Hacken audit promotional image" class="mx-auto w-full max-w-xl rounded-xl border border-border shadow-md" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted-foreground">Neyro's Hacken audit graphic (project image). The audit itself is public — linked above.</figcaption>
</figure>

## The evidence at a glance

| What critics claim | What the chain actually showed | Verify it yourself |
|---|---|---|
| "It's just a dashboard number" | A real BSC-USD transfer (7.90177338, ≈ $7.89) landed in the user wallet, marked **Success** | On BscScan via the transaction hash |
| "There's no real money behind it" | The paying wallet held **~38.7M BSC-USD** and 100,000+ transactions | Wallet `0x92b7807b…` on BscScan |
| "No real DeFi activity" | Interaction with **PancakeSwap V3** Nonfungible Position Manager — Burn & Collect events | [Position Manager contract](https://bscscan.com/address/0x46A15B0b27311cedF172AB29E4f4766fbE7F4364) |
| "Paid in a made-up token" | Paid in **Binance-Peg BSC-USD**, a mainstream BEP-20 stablecoin (~$0.999) | BSC-USD token page on BscScan |
| "Never audited" | **Hacken** Neyro audit (May 2026) + **SolidityScan 95.88/100** | [Hacken audit](https://hacken.io/a/FJoS_A) |

## The self-custody question

A big misunderstanding around Aurum Neyro is custody. People hear "daily profits" and assume funds must have been sent to a central platform wallet. The user evidence points to a more DeFi-style flow: wallet connection, smart-contract interaction, and on-chain distributions.

Wording still matters, because "self-custody" can mean several different things. Funds might stay under your wallet's control until each transaction. They might be committed into a contract or vault that runs to pre-set rules. You might keep wallet-level control while the system performs contract-based liquidity operations. Those are materially different setups, and the exact one depends on the contract you sign.

What the screenshots support is that the user isn't just looking at a fake web balance — there's a wallet connection, on-chain receipts, BSC-USD transfers and PancakeSwap activity. What still deserves a close look is the exact activation transaction, the token approvals and the contract permissions for each user. That's normal due diligence for any DeFi product, Neyro included.

<figure class="not-prose my-7">
  <img src="/aurum/neyro-advantages.jpg" alt="Neyro advantages graphic including self-custody and no-KYC claims" class="mx-auto w-full max-w-xl rounded-xl border border-border shadow-md" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted-foreground">Neyro's stated advantages (project image) — including self-custody and no-KYC.</figcaption>
</figure>

<div class="not-prose my-8 rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 shadow-lg">
  <p class="text-xs font-bold uppercase tracking-widest text-primary">Want to look at Neyro yourself?</p>
  <h3 class="mt-1 font-heading text-2xl font-bold">Connect a wallet and see the self-custody flow</h3>
  <p class="mt-2 text-sm text-muted-foreground">Non-custodial · funds stay in your wallet · this is the same link we use ourselves. Only ever commit money you can afford to lose.</p>
  <a href="https://backoffice.aurum.foundation/u/PKK5U0" target="_blank" rel="noopener noreferrer sponsored" class="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90">Open Aurum / Neyro →</a>
</div>

## So, is Aurum a scam?

The fair answer, based on the evidence we reviewed: the claim that Aurum Neyro is **simply a fake dashboard with no real on-chain activity is not supported.**

That's worded carefully, on purpose. It doesn't say Aurum is guaranteed safe. It doesn't say returns are guaranteed. It doesn't tell you to ignore risk. It says the public evidence shows real blockchain activity — real BSC-USD payments, a substantial paying wallet, PancakeSwap V3 interactions, public audit material and a coherent DeFi operating trail.

For anyone reflexively shouting "scam" without opening a block explorer, that matters. The debate should move off lazy labels and onto the questions that actually decide your risk: How sustainable are the returns? How are the liquidity positions managed? What permissions and admin roles exist? What happens if PancakeSwap, BNB Chain or the stablecoin contract has a bad day? What's the worst case for a user? Those are the right questions.

<div class="not-prose my-8 grid gap-4 sm:grid-cols-2">
  <div class="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
    <p class="flex items-center gap-2 text-sm font-bold text-emerald-600"><span>✓</span> What we could verify</p>
    <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
      <li>A real BSC-USD profit payment arriving in the user's wallet</li>
      <li>The payment marked <strong>Success</strong> on BscScan</li>
      <li>A paying wallet holding ~38.7M BSC-USD at the time reviewed</li>
      <li>That wallet showing 100,000+ transactions</li>
      <li>PancakeSwap V3 Nonfungible Position Manager interaction</li>
      <li>Liquidity-position events (Burn, Collect) in the logs</li>
      <li>BSC-USD token data visible on BscScan</li>
      <li>A Hacken Neyro audit dated May 2026</li>
      <li>A SolidityScan score of 95.88/100 (0 crit/high/med)</li>
    </ul>
  </div>
  <div class="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
    <p class="flex items-center gap-2 text-sm font-bold text-amber-600"><span>✗</span> What screenshots can't tell us</p>
    <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
      <li>Future profitability or future daily returns</li>
      <li>The full internal trading / liquidity strategy</li>
      <li>The long-term sustainability of the revenue model</li>
      <li>Whether every user has the same permission setup</li>
      <li>Whether treasury balances stay sufficient over time</li>
      <li>Whether admin keys are protected by multisig or similar</li>
      <li>How it behaves in extreme market or liquidity stress</li>
      <li>How it copes if an external protocol it depends on fails</li>
    </ul>
  </div>
</div>

<div class="not-prose my-8 rounded-xl border-l-4 border-primary bg-primary/5 p-5">
  <p class="text-xs font-bold uppercase tracking-widest text-primary">Crypto Watchdog view</p>
  <p class="mt-2 text-base text-foreground">Treat Aurum Neyro as a <strong>high-risk DeFi trading and liquidity product that deserves ongoing monitoring</strong> — not as a fake dashboard. The blockchain trail shows real payments, real contracts, real liquidity infrastructure and public audit material. Verify, size sensibly, and never commit money you can't afford to lose.</p>
</div>

## Doing your own due diligence

Even with positive evidence on the table, no trading bot is risk-free. High returns invite scrutiny. Smart contracts can fail. Strategies stop working. Liquidity shifts. Dependencies break. Operators make bad calls. Even audited code carries accepted risks and trade-offs.

The problem was never that people warn others to be careful — that's fair. The problem is when a warning hardens into lazy certainty that ignores what's actually on-chain. The better standard is simple: inspect the chain, read the audit, check the transactions, understand the permissions, then decide on facts rather than fear or hype.

A practical checklist if you're considering Neyro: start small, understand the contract flow, inspect token approvals, verify payments on-chain, keep records, watch the official audit links, and never risk money you can't afford to lose. That respects both halves of the truth here — the evidence is stronger than many critics admit, and it still sits squarely in high-risk DeFi.

<div class="not-prose my-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-lg">
  <p class="text-xs font-bold uppercase tracking-widest text-primary">Learning Aurum? Join the classroom</p>
  <h3 class="mt-1 font-heading text-xl font-bold text-foreground">Danny runs an Aurum classroom — come and learn with us</h3>
  <p class="mt-2 text-sm text-muted-foreground">Danny, who runs Crypto Watchdog, is active in an Aurum classroom group with loads of people learning how it actually works — setup, the contract flow, and how to verify everything yourself. Sign up through our link, join the classroom, and just say <strong>"Danny invited me"</strong>. He'll catch up with you on the platform.</p>
  <a href="https://backoffice.aurum.foundation/u/PKK5U0" target="_blank" rel="noopener noreferrer sponsored" class="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90">Sign up & join the classroom →</a>
</div>

## Final verdict

As of 18 June 2026, we found enough evidence to say Aurum Neyro should **not** be lazily dismissed as a 100% fake operation with no real blockchain activity. That position simply isn't supported by the screenshots, BscScan records and public audit material we reviewed.

We saw real BSC-USD payments, a large active paying wallet, PancakeSwap V3 liquidity interactions, a public Hacken audit, a high SolidityScan result, and a user-facing flow consistent with a DeFi self-custody / smart-contract product rather than an off-chain balance display.

None of that makes Aurum risk-free or guarantees the future. It doesn't remove the need to inspect permissions, monitor contract changes, understand treasury behaviour and challenge the sustainability of the returns. But it does mean the conversation should be smarter than "scam" versus "not scam." Evidence clearly exists. The real questions are how strong it is, what risks remain, and whether you understand the structure before you take part.

<figure class="not-prose my-7">
  <img src="/aurum/aurum-ai-agents.jpg" alt="Aurum / Neyro brand image: AI agents from Claude and GPT to Neyro" class="mx-auto w-full max-w-xl rounded-xl border border-border shadow-md" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted-foreground">Aurum / Neyro brand image (project asset).</figcaption>
</figure>

## Frequently asked questions

**What is the Aurum Neyro bot?** Neyro is Aurum's AI-powered, self-custody trading and liquidity-management product, connected to DeFi execution infrastructure on BNB Smart Chain.

**Is Aurum a scam?** Based on the evidence we reviewed, the claim that Aurum Neyro has no real on-chain activity isn't supported. That said, nothing we saw guarantees future profitability or removes DeFi risk.

**Does Aurum Neyro really pay?** We reviewed a real BSC-USD payment to a user wallet, confirmed and marked Success on BscScan.

**Which blockchain did you review?** Mainly BNB Smart Chain — BSC-USD transfers and PancakeSwap V3 interactions.

**What is the Hacken audit?** Hacken published a Neyro smart-contract security assessment in May 2026 (16 findings: 5 resolved, 7 accepted, 4 mitigated). We'll publish a dedicated breakdown of it separately.

**What's the biggest remaining risk?** Future sustainability, smart-contract permissions, admin controls, external protocol dependencies and market conditions. Size positions to the worst case.

## Sources & evidence notes

- [Hacken Neyro audit page](https://hacken.io/a/FJoS_A) — the public smart-contract assessment (May 2026).
- [Hacken audit methodology](https://docs.hacken.io/methodologies/smart-contracts) — how the findings are graded.
- [PancakeSwap V3 Nonfungible Position Manager](https://bscscan.com/address/0x46A15B0b27311cedF172AB29E4f4766fbE7F4364) — the contract seen in the transaction logs.
- BscScan BSC-USD token and transaction pages — from the user-supplied screenshots reviewed here, each verifiable on BscScan via its hash or address.

## Related reading

- [AURUM Foundation — full review & trust audit](/reviews/aurum-foundation)
- [AURUM Neyro Quantum Alpha — the 11-step self-custody setup guide](/blog/self-custody-ai-crypto-trading-aurum-neyro)
- [Non-custodial AI trading bots, explained](/blog/non-custodial-ai-trading-bots-explained)
- [How smart contracts work in crypto trading](/blog/how-smart-contracts-work-crypto-trading)
- [How to spot a safe crypto project in 2026 (audits & proof of reserves)](/blog/how-to-spot-safe-crypto-project-2026-audits-proof-of-reserves)

*Disclaimer: This article is educational and not financial advice. Trading crypto — including via AI agents and DeFi liquidity products — carries real risk, and you can lose money. Always do your own research and never invest more than you can afford to lose. Crypto Watchdog uses Aurum and may earn a commission via the affiliate link in this article; it never changes our evidence-first findings. Read our [editorial policy](/about) and [affiliate disclosure](/about).*
