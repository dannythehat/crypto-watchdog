---
type: "blog"
title: "Crypto Scammed? Your Step-by-Step Guide to Damage Control"
slug: "crypto-scammed-your-step-by-step-guide-to-damage-control-2026-04-24"
summary: "If you have just been scammed in crypto, the next few hours matter. This calm, evidence-led playbook walks you through securing what is left, revoking malicious approvals, documenting the theft, reporting to Action Fraud and the FCA, and avoiding the recovery scammers who target victims a second time."
category: "Scam Alert"
image_url: "https://pubmhnynxpcngxcgwcgf.supabase.co/storage/v1/object/public/blog-images/blog/crypto-scammed-your-step-by-step-guide-to-damage-control-1777010459838.png"
published: true
auto_generated: false
published_at: "2026-04-24T06:01:00.47+00:00"
updated_at: "2026-06-17T17:00:00Z"
meta_title: "What To Do After a Crypto Scam: Damage Control"
meta_description: "Scammed in crypto? A calm, step-by-step damage-control guide: secure your wallet, revoke approvals, report to Action Fraud and the FCA, dodge recovery scams."
primary_keyword: "what to do after crypto scam"
---
# Crypto Scammed? Your Step-by-Step Guide to Damage Control

The sickening drop in your stomach when you realise the funds are gone. The mix of panic, anger and embarrassment is a feeling thousands of people in crypto know all too well. If you are reading this because you have just been scammed, take a breath. You are not stupid, you are not alone, and acting in a blind panic right now can genuinely make things worse.

This guide is not about how to spot a scam — if that is what you need, read [how to spot a crypto scam in 2026](/blog/how-to-spot-crypto-scam-2026) instead. This is the other guide: the one for the morning after, when the damage is already done and you need to know exactly what to do, in what order, and what to ignore. We will be honest with you throughout, including about the hard truth that recovery is often impossible. We will not give you false hope, and we will not sell you anything.

## TL;DR — the first hour

- **Stop the bleeding:** make no further payments, sign no further transactions, and do not "top up" to unlock anything. The scam is not over until you make it stop.
- **Secure what is left:** move any remaining funds and NFTs to a brand-new wallet you control, on a clean device. Never reuse a compromised seed phrase.
- **Revoke token approvals** you granted to unknown contracts, using a reputable tool such as [Revoke.cash](https://revoke.cash/).
- **Document everything:** transaction hashes, wallet addresses, screenshots, URLs, and a written timeline.
- **Report it:** to your bank first (if fiat was involved), then [Action Fraud](https://www.actionfraud.police.uk/a-z-of-fraud/cryptocurrency), the [FCA](https://www.fca.org.uk/consumers/crypto-investment-scams), and the exchanges involved.
- **Beware the second wave:** anyone promising to recover your funds for an upfront fee is almost certainly a follow-up scammer.

## First, breathe. Then triage.

Your first instinct might be to frantically try to "reverse" the transaction, argue with the scammer, or send "just a little more" to release your balance. Let us be clear about two things.

First, crypto transactions are, by design, irreversible. Once funds leave your wallet on-chain, no one — not you, not the exchange, not the police — can claw them back the way a bank can reverse a card payment. The funds are out of your immediate control.

Second, scammers rely on your panic. The "pay a release fee to unlock your withdrawal" demand is itself part of the scam. So is the fake support agent who messages within minutes of your loss. Your mission now is not reversal. It is damage limitation: stopping any further loss and preserving every option that still exists.

Assume the wallet, computer or phone you used in the scam is compromised. Then work through the triage below.

### The first-hour action checklist

Follow these steps in order. Do not skip ahead, and do not move funds *into* the compromised wallet for any reason.

1. **Stop all payments.** Cancel any pending bank transfers or card payments to the platform. Do not send another satoshi, regardless of what you are promised.
2. **Disconnect.** If a software wallet such as MetaMask or Phantom was involved, disconnect that device from the internet to prevent further unauthorised signing while you regroup.
3. **Create a clean wallet.** On a *different, trusted device*, generate a brand-new wallet with a brand-new seed phrase. Never import your old, compromised phrase. A hardware wallet is the gold standard here; if you do not own one, our [Ledger vs Trezor comparison for 2026](/blog/best-hardware-wallet-2026-ledger-vs-trezor) explains how to buy one safely, direct from the manufacturer.
4. **Evacuate remaining assets.** If the compromised wallet still holds tokens or NFTs the scammer has not taken, move them to your clean wallet *fast*. Drainers often run automated "sweeper bots" that grab anything deposited into a compromised address, so prioritise the highest-value, most liquid assets first.
5. **Revoke malicious approvals.** If you were tricked into signing a smart-contract approval — the classic wallet-drainer trick — that contract may be able to drain specific tokens at will. Revoke those allowances (see below). Evacuating assets to a fresh wallet remains the safest belt-and-braces move.
6. **Lock down adjacent accounts.** Change the passwords on your email, exchange accounts and anything that shares credentials with the compromised setup, and switch on app-based two-factor authentication everywhere.

### Revoking token approvals

A huge share of modern crypto theft is not a stolen seed phrase at all — it is a malicious *approval*. When you connect to a dApp and click "approve", you may be granting a smart contract permission to move your tokens. A drainer contract abuses that permission.

To check and revoke approvals, connect your wallet to a reputable allowance tool such as [Revoke.cash](https://revoke.cash/), select the relevant network, and revoke any approval you do not recognise or no longer need. Each revocation is itself an on-chain transaction, so you will need a small amount of gas in the wallet — which is one more reason a drained wallet can be hard to clean up, and why moving assets to a fresh wallet is often the better path.

If the difference between a wallet that holds your keys and an exchange that holds them for you is still fuzzy, our explainer on [self-custody vs custodial wallets](/blog/self-custody-vs-custodial-wallets-2026) is worth ten minutes.

## Become a digital detective: gather evidence

Emotion is high, but now you need to be methodical. You are building a case file. The odds of law enforcement recovering your funds are slim — we will not pretend otherwise — but good evidence is what lets an exchange freeze an account, lets investigators link your case to a wider operation, and supports any future insurance or civil claim. It also matters because speed matters: tracing and freezing requests are far more likely to land while funds are still sitting at a recognisable address rather than scattered through mixers and bridges.

Create one document and collect the following:

| Evidence item | Where to find it | Why it matters |
| --- | --- | --- |
| Transaction hashes (TXIDs) | A block explorer such as Etherscan (Ethereum) or Solscan (Solana) | The permanent, verifiable proof of each transfer |
| Scammer's wallet address(es) | The "to" field of your outgoing transactions | Lets exchanges and analysts trace and flag the funds |
| Your own address(es) | The "from" field of those transactions | Establishes ownership and your loss |
| Communication records | Telegram, Discord, WhatsApp, email, social media | Shows intent and method; scammers delete accounts fast |
| Website URLs | Browser history; the fake dApp or platform link | Helps takedown requests and warns others |
| Payment records | Bank statements, card receipts, exchange on-ramp records | Critical for any bank or card chargeback claim |
| A written timeline | Your own notes | Turns a pile of files into a clear, reportable narrative |

Screenshot everything before it disappears, and back the images up somewhere off the compromised device. Write a plain, chronological account: when you were first contacted, what you were promised, what you did, and when you realised. This narrative is what every official report below will ask you for.

## The reporting trail: who to tell, and why

Posting on social media feels cathartic, but it does not create an official record — and, as we will see, it actively paints a target on your back. Reporting needs to be deliberate. Work down this list.

### 1. Your bank or card provider — first, if real money was involved

If you funded the scam with a bank transfer, debit card or credit card, contact your bank's fraud line immediately. In some cases — especially card payments and very recent transfers — the payment can still be stopped or recovered. UK banks operate under reimbursement rules for many authorised push payment scams, so it is always worth asking. Speed is everything here; this is the one channel where minutes can matter.

### 2. Action Fraud (UK)

In England, Wales and Northern Ireland, report the crime to **Action Fraud**, the national reporting centre for fraud and cybercrime, via its [cryptocurrency fraud reporting page](https://www.actionfraud.police.uk/a-z-of-fraud/cryptocurrency) or by phone on 0300 123 2040. (In Scotland, report to Police Scotland on 101.) Register an account so you can track and update your report. Be realistic: local forces are stretched and most individual crypto cases are not actively investigated, but an Action Fraud reference number is the foundation for any later insurance claim, civil action, or law-enforcement contact.

### 3. The FCA

If the scam involved an "investment", a fake trading platform, or a firm claiming to be regulated, report it to the **Financial Conduct Authority**. The FCA's [crypto investment scams](https://www.fca.org.uk/consumers/crypto-investment-scams) guidance and its [ScamSmart](https://www.fca.org.uk/scamsmart) service let you check whether a firm is authorised and warn the regulator about unauthorised operators. The scale here is not trivial: the FCA has reported tens of millions of pounds lost annually to crypto and forex investment scams, with individual victims losing five-figure sums on average.

### 4. Citizens Advice

For practical, free help — including the consumer side of reporting and what to do next — [Citizens Advice](https://www.citizensadvice.org.uk/consumer/scams/reporting-a-scam/) is a genuinely useful, non-commercial resource. It can also report directly to Trading Standards on your behalf.

### 5. The exchanges

This is often the single most effective step. To turn stolen crypto into spendable cash, scammers almost always have to route it through a centralised exchange. Those exchanges have compliance teams and "know your customer" records. File a support ticket with any exchange you can trace the funds reaching, provide the transaction hashes and scammer addresses, and ask them to flag or freeze the receiving account. If you can show the funds landed with them, they may be able to cut off the cash-out route — which is exactly why fast, well-documented reporting beats a delayed, vague one.

### 6. The community — carefully

Warn others, factually and without abuse. State the method, the addresses, and the platform. You may stop the next person. But keep the next section firmly in mind before you post anything public.

## The hard truth about recovery odds

We owe you honesty here, because a lot of the internet will not give it to you.

For most individual victims, stolen crypto is not recovered. Independent analyses of on-chain crime consistently show that the value frozen or returned each year is a small fraction of what is stolen — a ratio of roughly one dollar recovered for every tens of dollars lost across the ecosystem. The headline "billions seized" figures you see are dominated by a handful of large, state-level enforcement operations against major hacks, not by everyday cases where someone signed a malicious approval or sent funds to a fake exchange.

On-chain tracing is real, and it is genuinely impressive — analysts can follow funds across wallets and even some bridges. But tracing is not the same as recovery. Watching your money move through a mixer or onto an offshore exchange that ignores requests is, for many victims, where the trail goes cold. Two factors move the odds in your favour at the margins: **speed** (reporting within hours to a few days, before funds disperse) and **destination** (funds that land at a cooperative, regulated exchange are far more likely to be frozen than funds that vanish into a mixer).

None of this means you should not report. You absolutely should — it is how patterns get spotted and how the rare freeze happens. It means you should set your expectations honestly, protect yourself from a second loss, and not pour good money after bad.

## The vultures are circling: beware recovery scams

This is the cruel, predictable second act, and it is the most important section in this guide. The moment you post publicly that you have been scammed, you will be flooded with messages from people offering to get your money back. They will style themselves as "ethical hackers", "blockchain investigators", "asset recovery agents", or even lawyers from official-sounding firms.

**Treat every one of these unsolicited offers as a scam, because they almost always are.** Law enforcement on both sides of the Atlantic has issued explicit warnings about it. The FBI's Internet Crime Complaint Center has documented [fictitious law firms targeting cryptocurrency scam victims](https://www.ic3.gov/PSA/2024/PSA240624), reporting millions of dollars in *additional* losses from victims who were scammed a second time by fake recovery operations. Often these impostors claim to be working with the FBI, a regulator, or a court — precisely to lower your guard.

Here is how the second scam works:

- They ask for an **upfront fee** to "initiate the trace", "pay a court bond", "cover taxes", or "bribe an exchange employee".
- They show you **fake screenshots** of your funds sitting in a wallet, ready to be unlocked the moment you pay a "success fee".
- They impersonate **real agencies or firms** to seem legitimate, sometimes citing genuine case numbers stolen from public reports.

The rule that protects you is simple and absolute: **anyone who guarantees they can recover your funds, or who asks for any payment up front, is lying.** No legitimate firm guarantees recovery. Genuine blockchain analytics companies work with law enforcement and corporations — not with individual victims via cold DMs, and not for a small upfront fee. Government agencies never charge you for recovering your money.

So: do not pay. Do not share your new wallet, seed phrase, remote-access, or ID with anyone who contacts you out of the blue. Block them, and report them to Action Fraud as a separate offence. If you genuinely want professional help, only ever approach an established, regulated law firm or analytics company *that you found and vetted yourself* — never one that found you.

## Rebuilding with better foundations

Being scammed does not have to end your time in crypto, but re-entry should come with a rebuilt security mindset. When you are ready, do it deliberately.

- **Move to self-custody you understand.** Keep keys offline on a hardware wallet rather than leaving long-term holdings on an exchange. Our [self-custody vs custodial wallets](/blog/self-custody-vs-custodial-wallets-2026) guide covers the trade-offs honestly.
- **Buy hardware safely.** Order direct from the manufacturer, never a marketplace reseller. See our [Ledger vs Trezor 2026 comparison](/blog/best-hardware-wallet-2026-ledger-vs-trezor).
- **Protect your seed phrase like cash.** Write it on paper or steel. Never photograph it, store it in the cloud, or type it into any website — legitimate sites and apps never ask for it.
- **Use a burner wallet** with minimal funds for any new dApp, mint, or airdrop interaction.
- **Bookmark official URLs** and reach platforms only through your own bookmarks — never via ads, search results, or DMs.
- **Vet before you trust.** Understand how we grade platforms in [understanding trust scores](/blog/understanding-trust-scores), and treat anything promising guaranteed or outsized returns as a red flag, not an opportunity.
- **Revoke old approvals quarterly** using a reputable allowance checker.

Treat the loss as expensive tuition. The people who last in this space are the ones who learn from a mistake once and never repeat it.

## Frequently asked questions

**Can I reverse a crypto transaction or get my money back from the blockchain?**
No. Crypto transactions are irreversible by design — there is no central authority that can undo a confirmed transfer. The only realistic recovery routes run through traditional channels (your bank, if fiat was involved) or through an exchange freezing the scammer's account before they cash out. Both depend on acting fast.

**Should I bother reporting if I'll probably never see the money again?**
Yes. Reporting rarely returns funds to an individual victim, but it creates an official record, feeds intelligence that helps investigators link cases and spot patterns, supports any future insurance or legal claim, and is occasionally the trigger that gets a receiving account frozen. It also helps protect the next person.

**Someone messaged me offering to recover my stolen crypto. Are they legitimate?**
Almost certainly not. Unsolicited "recovery" offers — especially any that guarantee results or ask for an upfront fee — are a well-documented follow-up scam that law enforcement, including the FBI's IC3, has warned about repeatedly. No genuine firm guarantees recovery or cold-DMs victims. Block and report them.

**How quickly do I need to act after realising I've been scammed?**
As fast as you safely can. Securing remaining assets and contacting your bank are the urgent priorities, ideally within the first hour. Reporting to exchanges and authorities is most effective within the first few days, before stolen funds are laundered through mixers and bridges and become much harder to trace or freeze.

**Is my whole wallet compromised, or just the funds that were taken?**
Assume the whole wallet — and the device — are compromised, especially if you signed a suspicious transaction or entered your seed phrase anywhere. Move any remaining assets to a brand-new wallet with a fresh seed phrase on a clean device, and never reuse the old phrase again.

**Do I need to tell my exchange even though the scam happened in a private wallet?**
If you can trace the stolen funds arriving at any centralised exchange, yes — report it to that exchange with the transaction hashes and addresses. Their compliance team is one of the few parties with the ability to freeze a receiving account. Also notify any exchange you personally use if you reused passwords or fear your account is exposed.

## Related reading

- [How to spot a crypto scam in 2026](/blog/how-to-spot-crypto-scam-2026) — the red flags to catch a scam before it costs you.
- [Self-custody vs custodial wallets](/blog/self-custody-vs-custodial-wallets-2026) — who holds your keys, and what that means after a breach.
- [Best hardware wallet 2026: Ledger vs Trezor](/blog/best-hardware-wallet-2026-ledger-vs-trezor) — buying and setting up cold storage safely.
- [Understanding trust scores](/blog/understanding-trust-scores) — how we grade platforms so you can rebuild on solid ground.

_This guide is educational and not financial or legal advice. Always verify directly with official sources and seek qualified professional help where appropriate._
