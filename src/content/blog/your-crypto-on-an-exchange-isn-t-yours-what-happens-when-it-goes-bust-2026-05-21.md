---
type: "blog"
title: "Your Crypto on an Exchange Isn't Yours: What Happens When It Goes Bust"
slug: "your-crypto-on-an-exchange-isn-t-yours-what-happens-when-it-goes-bust-2026-05-21"
summary: "When a centralised exchange becomes insolvent, customers are usually treated as unsecured creditors rather than owners. We explain custodial risk, what FTX, Celsius and Mt. Gox teach us about recovery, the limits of proof of reserves, and practical steps to reduce your exposure."
category: "Exchanges"
image_url: "https://pubmhnynxpcngxcgwcgf.supabase.co/storage/v1/object/public/blog-images/blog/your-crypto-on-an-exchange-isn-t-yours-what-happens-when-it-goes-bust-1779343252804.png"
published: true
auto_generated: false
published_at: "2026-05-21T06:00:53.176+00:00"
updated_at: "2026-06-17T17:00:00Z"
meta_title: "Crypto Exchange Bankruptcy: What Happens to Your Coins"
meta_description: "What happens to your crypto when an exchange goes bust? Custodial risk, creditor hierarchy, FTX, Celsius and Mt. Gox lessons, and how to reduce your exposure."
primary_keyword: "crypto exchange bankruptcy"
---
# Your Crypto on an Exchange Isn't Yours: What Happens When It Goes Bust

The collapse of FTX in November 2022 was a brutal lesson for millions of users, but it was not the first failure of its kind and it will not be the last. When you leave coins on a centralised exchange, you are trusting a third party to hold assets on your behalf. If that trust breaks down, getting your money back can take years, and you may never recover the full amount.

The phrase "not your keys, not your coins" is older than most exchanges. It is shorthand for a hard legal reality: in many insolvencies, customers who thought they *owned* crypto discover that they were really just *creditors* of the company. This article explains how that happens, what real bankruptcy cases tell us, why "proof of reserves" is not the reassurance it is often sold as, and the concrete steps you can take to reduce your custodial risk.

This is educational content, not financial or legal advice. Insolvency outcomes vary by jurisdiction, by exchange and by the specific terms you agreed to, so treat the cases below as illustrative rather than predictive.

## TL;DR

*   When a custodial exchange files for insolvency, withdrawals are typically frozen and your funds are trapped while administrators take control.
*   Depending on the jurisdiction and the platform's terms, customers are often treated as **unsecured creditors**, not owners. Crypto that customers viewed as "theirs" can be pulled into the bankruptcy estate.
*   Recovery can take years, even more than a decade in the Mt. Gox case, and outcomes differ wildly between cases.
*   Claims are frequently valued at the petition date (the day the company filed), so a later market rebound may not benefit you.
*   The most direct way to remove exchange-insolvency risk is to hold your own private keys in self-custody. That shifts security responsibility onto you, which carries its own risks.

## Custody: the difference between owning and being owed

When you deposit pounds or euros into a UK bank, eligible deposits are protected up to £85,000 by the Financial Services Compensation Scheme (FSCS). Crypto is different. The Financial Conduct Authority is blunt about this: cryptoassets are largely unregulated in the UK, are not covered by the FSCS or the Financial Ombudsman Service, and consumers should be prepared to lose all the money they put in. The FCA's standing consumer warning states plainly that "if you buy cryptoassets, you should be prepared to lose all your money," and that buyers are unlikely to have access to compensation schemes if things go wrong ([FCA consumer warning](https://www.fca.org.uk/news/statements/fca-reminds-consumers-risks-investing-cryptoassets)).

The moment you transfer Bitcoin, Ethereum or any other asset to a custodial exchange, you generally stop holding it directly. The exchange holds it for you, and your balance on the screen is a claim against the company rather than a coin with your name on it. Many custodial terms of service grant the platform broad rights over how those assets are held, and historically some failed platforms commingled customer assets with corporate funds.

This distinction matters enormously in insolvency. If customer assets were clearly segregated, identifiable and held on trust, customers may be able to recover those specific assets ahead of general creditors. If they were commingled, or if the terms characterised deposits as a loan to the exchange, courts may treat customers as general unsecured creditors. The outcome is not automatic, and it is precisely the kind of question that takes courts months or years to resolve.

### Custodial versus self-custody at a glance

| Factor | Custodial exchange | Self-custody (hardware wallet) |
| --- | --- | --- |
| Who holds the private keys | The exchange | You |
| Exposure to exchange insolvency | Yes, potentially significant | None for assets held off-platform |
| Exposure to exchange hacks/freezes | Yes | No, for assets held offline |
| Who is liable if *you* lose access | The exchange may help recover | You alone; a lost seed phrase usually means lost funds |
| Compensation scheme | Generally none for crypto | None |
| Convenience for active trading | High | Lower (you withdraw to trade) |
| Phishing/social-engineering risk | Account takeover | Seed-phrase theft, fake apps, supply-chain tampering |

Neither column is "safe." Custody simply moves the dominant risk from *the exchange failing* to *you making a mistake*. We dig into that trade-off in detail in our guide to [self-custody vs custodial wallets](/blog/self-custody-vs-custodial-wallets-2026).

## What happens on the day an exchange files

When a custodial platform like FTX, Celsius or Voyager enters bankruptcy or administration, a predictable sequence tends to follow.

First, activity freezes. Withdrawals are usually suspended before or at the moment of filing, so the funds are trapped. Control passes to court-appointed administrators, trustees or examiners whose job is to identify the assets, quantify the liabilities, and propose a plan to creditors.

Then the creditor hierarchy comes into play. In a typical US Chapter 11 or UK administration, the rough running order is:

1.  **Secured creditors** — lenders holding collateral or security over assets. They are generally paid first from the assets securing their loans.
2.  **Administrative and priority claims** — the costs of the bankruptcy itself (lawyers, advisers, the trustee) plus certain priority claims such as some employee and tax obligations.
3.  **General unsecured creditors** — frequently where retail customers end up if their assets were not clearly held on trust. This is the back of the queue.

A crucial and under-appreciated point: the professional fees for running a large insolvency are paid out of the same estate that is supposed to repay customers. These cases are expensive and slow, and every month of legal work is money that does not reach account holders.

The official dockets are public. For FTX, the court-appointed administrator publishes filings and creditor information through Kroll's restructuring portal ([Kroll FTX case docket](https://restructuring.ra.kroll.com/ftx/)), which is a far more reliable source than social-media commentary if you ever need to track a real case.

## Three real failures, three very different outcomes

It is tempting to assume every collapse ends the same way. The record is messier and more instructive than that.

### FTX (2022): petition-date valuation and the "missed rebound" problem

FTX Trading Ltd. and around 100 affiliated entities filed for Chapter 11 in Delaware in November 2022. A central, painful detail for customers is how claims were valued. The estate valued customer crypto claims in US dollars as of the petition date in November 2022, when crypto prices were deep in a bear market, rather than at later, higher prices.

In practice that means a customer who held one Bitcoin when the price was low has a dollar claim fixed at that low price, even if Bitcoin subsequently rose substantially while the case dragged on. The eventual FTX plan returned cash to many customers, and several creditor groups received distributions exceeding their petition-date claim values, but those distributions were still pegged to the depressed 2022 dollar figures, not to where the market later traded. Recovering "100 cents on the dollar" of a November-2022 valuation is very different from getting your coins back.

### Celsius (2022-2024): partial recovery, paid in a mix of assets

Celsius Network filed for Chapter 11 in July 2022. Its plan was confirmed in late 2023, and the company emerged from bankruptcy on 31 January 2024, beginning distributions of over $3 billion in crypto and fiat to creditors, with a new Bitcoin-mining entity (Ionic Digital) created for creditors as part of the structure ([CoinDesk reporting on Celsius distributions](https://www.coindesk.com/policy/2024/02/01/celsius-to-distribute-3b-crypto-to-creditors-as-firm-emerges-from-bankruptcy)). Reported recovery estimates for eligible account holders landed in a partial range rather than anything close to full restitution, and holders of the platform's native token recovered far less. Celsius shows that a structured recovery is possible, but also that "partial, eventual, and in a basket of assets you did not choose" is a realistic best case rather than a worst case.

### Mt. Gox (2014-ongoing): the decade-plus wait

Mt. Gox, once the dominant Bitcoin exchange, collapsed in 2014 after losing a vast quantity of Bitcoin. Its case moved into Japanese civil rehabilitation, and creditors waited *years* for clarity. The rehabilitation trustee began distributing Bitcoin and Bitcoin Cash to verified creditors in 2024, more than ten years after the failure, and the final repayment deadline has since been pushed back again, into late 2026 ([Decrypt on the Mt. Gox repayment extension](https://decrypt.co/346053/mt-gox-pushes-back-bitcoin-repayments-by-another-year)). Some Mt. Gox creditors, unusually, may recover in actual Bitcoin rather than at a frozen fiat valuation, which is a reminder that legal frameworks differ across jurisdictions and not every case mirrors the US Chapter 11 model.

### Timeline comparison

| Case | Filing | Key resolution milestone | Customer experience (illustrative) |
| --- | --- | --- | --- |
| Mt. Gox | 2014 (Japan) | Distributions began 2024; deadline extended to 2026 | 10+ years; some recovery in BTC/BCH |
| FTX | Nov 2022 (US Ch.11) | Plan effective 2024; cash distributions | Claims fixed at petition-date USD values |
| Celsius | Jul 2022 (US Ch.11) | Emerged Jan 2024; $3bn+ distributed | Partial recovery in mixed crypto/fiat |

The common threads are time, uncertainty and incomplete recovery, not a uniform percentage you can plan around.

## Do "proof of reserves" and insurance funds protect you?

After FTX, many exchanges published "proof of reserves" (PoR) attestations to reassure users. PoR is a step toward transparency, but it is widely misunderstood, and on its own it does not prove solvency.

A typical Merkle-tree PoR shows that an exchange controlled certain on-chain assets at a single moment, and lets individual users verify that their balance was included in the snapshot. What it generally does **not** show is the full picture of **liabilities**. Proof of assets without independently verified liabilities is not proof of solvency, an exchange can hold a billion in coins while owing two billion to customers and lenders. Even Kraken, which publishes recurring PoR attestations, frames the standard pointedly: its own explainer is titled "Proof of Reserves or Proof of Nothing," arguing that an attestation must cover both assets and liabilities and be independently verifiable to mean anything ([Kraken: Proof of Reserves or Proof of Nothing](https://blog.kraken.com/crypto-education/proof-of-reserves-or-proof-of-nothing-there-is-no-in-between)), and the mechanics are documented on its public [proof-of-reserves page](https://www.kraken.com/proof-of-reserves).

Treat PoR as one input, not a verdict. A snapshot can be clean on the day of the audit and meaningless a week later if assets are moved, lent or lost. It does not capture off-balance-sheet obligations, related-party loans, or operational fraud. This is also why a single transparency signal should never be read as a clean bill of health, see how we weigh multiple factors in our explainer on [understanding trust scores](/blog/understanding-trust-scores).

Self-insurance pools (such as exchange-funded "user protection" funds) are a similar story. They can absorb limited, isolated losses, but they are funded and controlled by the exchange itself, and there is no assurance any such fund would be sufficient in a genuine bank-run or balance-sheet collapse. It is a buffer, not a backstop.

## How to reduce your custodial exposure

You cannot eliminate every risk, but you can decide how much you are exposed to any single exchange failing.

*   **Hold long-term savings in self-custody.** A hardware wallet keeps your private keys offline and outside any exchange's balance sheet, so an exchange freeze or insolvency does not touch those coins. The trade-off is that *you* become responsible for your recovery phrase. Compare leading devices in our guide to the [best hardware wallet for 2026: Ledger vs Trezor](/blog/best-hardware-wallet-2026-ledger-vs-trezor).
*   **Treat exchanges as on-ramps, not vaults.** Use them to convert fiat to crypto (and back), then withdraw to your own wallet. Keep only what you are actively trading, and only what you could afford to have locked up for years.
*   **Choose where you must use a custodian carefully.** If you need to keep balances on an exchange, favour established, transparently operated platforms with strong regulatory standing in your jurisdiction, and read our research before committing funds, for example our [Kraken review](/reviews/kraken) and our roundup of the [best crypto exchange in the UK for 2026](/blog/best-crypto-exchange-uk-2026).
*   **Read the custody terms.** Search the terms of service for words like "title," "ownership," "trust," "segregated" and "commingle." They hint at whether you would be treated as an owner or a creditor if the worst happened.
*   **Run a test withdrawal.** Before moving a large balance, send a small test transaction to your wallet and confirm it arrives before you move the rest.

## Action checklist

If you hold funds on a centralised exchange right now, consider working through this:

1.  **Map your exposure.** List every exchange you use and roughly how much sits on each.
2.  **Read the custody language.** Understand whether you have agreed to lend your assets to the platform.
3.  **Buy a hardware wallet directly from the manufacturer.** Avoid third-party resellers to reduce tampering and supply-chain risk.
4.  **Test before you transfer.** Send a small amount first and verify receipt.
5.  **Move long-term holdings into your own custody.** Leave behind only what you are actively trading.
6.  **Secure your seed phrase offline.** Never type or photograph it; store backups physically and privately.

The convenience of a centralised exchange is real, and for many people some custodial use is unavoidable. The lesson from FTX, Celsius and Mt. Gox is not "never touch an exchange," it is to understand exactly what you give up when you do, and to keep the balance you cannot afford to lose under your own control.

## Frequently asked questions

**Is the crypto I hold on an exchange legally mine?**
It depends on the platform's terms and the jurisdiction. With many custodial exchanges, your on-screen balance represents a claim against the company rather than direct ownership of specific coins. If assets are clearly segregated and held on trust, customers may have stronger rights; if they were commingled or characterised as a loan to the exchange, customers can be treated as general unsecured creditors. This is a genuinely unsettled area that courts decide case by case.

**If my exchange goes bankrupt, how much will I get back and when?**
There is no fixed answer. Recoveries have ranged from partial repayments over a couple of years (Celsius) to distributions arriving more than a decade after the failure (Mt. Gox). Amounts are often valued at the petition date rather than current prices, and professional fees come out of the same pot. Plan for "uncertain, partial and slow," not a specific percentage.

**Does proof of reserves mean an exchange is safe?**
No. Proof of reserves typically demonstrates that an exchange controlled certain assets at one moment, and may let you confirm your balance was included. It does not, on its own, prove the exchange's total liabilities or its ongoing solvency. Even exchanges that publish it stress that an attestation is only meaningful if it covers liabilities and is independently verified.

**Are my coins protected by the FSCS like a bank deposit?**
Generally not. The FCA has repeatedly warned that cryptoassets are largely unregulated in the UK, are not covered by the FSCS or the Financial Ombudsman Service, and that buyers should be prepared to lose all the money they invest. Being FCA-registered for anti-money-laundering purposes does not create deposit-style compensation for customers.

**Is self-custody completely safe then?**
No. Self-custody removes exchange-insolvency risk for the assets you hold yourself, but it transfers responsibility to you. Losing your seed phrase, falling for a phishing or fake-app scam, or buying a tampered device can all cause permanent loss with no one to appeal to. It is a different risk profile, not a risk-free one.

**Should I move everything off exchanges immediately?**
Not necessarily, and not in a panic. A measured approach is to keep only actively traded balances on reputable platforms, move long-term holdings into self-custody, test transfers with small amounts first, and back up your recovery phrase securely offline before relying on it.

_This article is educational and not financial or legal advice. Always do your own research and consider speaking to a qualified professional about your specific situation._
