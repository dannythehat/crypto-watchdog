---
type: "warning"
title: "Zeta Markets Airdrop Phishing Campaign Drains Over $500k"
slug: "zeta-markets-airdrop-phishing-campaign-drains-over-500k-2026-04-26"
summary: "A widespread phishing campaign is targeting users anticipating the Zeta Markets (ZEX) token airdrop. Scammers are promoting fake airdrop claim websites that trick users into signing malicious transactions, which drains their wallets. Security firms have identified multiple victim"
severity: "high"
platform_name: "Zeta Markets"
alert_type: "platform"
published: true
published_at: "2026-04-26T06:01:04+00:00"
updated_at: "2026-04-26T06:01:04.093578+00:00"
---
# Zeta Markets Airdrop Phishing Campaign Drains Over $500k

A sophisticated and widespread phishing campaign targeting users of the Solana-based DeFi platform Zeta Markets has drained at least $500,000 from victims' wallets. Scammers created convincing fake websites and used social media to lure users eager to claim the new ZEX token airdrop, tricking them into signing malicious transactions that emptied their accounts. The campaign remains a significant threat as official token claims proceed.

## TL;DR

*   **What Happened:** Scammers launched a large-scale phishing attack using fake websites that mimicked the official Zeta Markets airdrop claim page. These sites were heavily promoted on X (formerly Twitter) in the days leading up to the official ZEX token generation event on 10 May 2024.
*   **Who Is Affected:** Any Solana user who interacted with an unofficial link promising a ZEX airdrop is at risk. Victims connected their wallets to these fake sites and approved transactions that gave scammers control over their assets.
*   **What to Do NOW:** If you have connected your wallet to ANY suspicious site, use a tool like Solscan to revoke all active token approvals immediately. Create a new, secure wallet and transfer any remaining funds to it. Do not use the compromised wallet again.

## What happened

In the run-up to the highly anticipated airdrop of the ZEX governance token, scammers preyed on the excitement surrounding Zeta Markets, a decentralised derivatives exchange on Solana. On or around 9 May 2024, blockchain security firm Scam Sniffer began reporting a surge in wallet-draining activity linked to fake Zeta Markets websites.

These malicious sites were designed to be nearly identical to the official platform. Scammers then used compromised or bot-controlled accounts on X to spread the links, often by replying directly to official posts from the Zeta Markets team to create a false sense of legitimacy.

Unsuspecting users, believing they were on the official claim portal, connected their wallets (such as Phantom or Solflare). They were then prompted to sign a transaction to "claim" their airdrop. In reality, this transaction was a malicious approval, granting the scammers' smart contract the authority to transfer tokens out of the victim's wallet. Within seconds, the drainer script would execute, stealing valuable assets like SOL, USDC, and other tokens.

Scam Sniffer confirmed that by 10 May, these phishing scams had successfully stolen over $520,000 from numerous victims. The official Zeta Markets team has repeatedly issued warnings through their verified social media channels, urging users to only use the official domain (`zeta.markets`) and to be extremely cautious. This incident is a stark reminder of the dangers surrounding airdrop events, which are prime targets for fraud.

## How the scam works / How they got in

This attack is a classic example of a "wallet drainer" phishing scam, a depressingly common tactic in crypto. The success of this particular Zeta Markets scam hinges on social engineering and exploiting user anticipation.

1.  **Impersonation:** The scammers create a pixel-perfect copy of the legitimate Zeta Markets website, hosted on a slightly different, but similar-looking, URL.
2.  **Promotion:** They blast these links across social media, especially in the replies of official announcements where eager users are looking for information. The messages create a sense of urgency, suggesting the airdrop is a limited-time offer.
3.  **The Lure:** A user clicks the malicious link, lands on the fake page, and is prompted to "Connect Wallet" to check their eligibility or claim their tokens.
4.  **The Trap:** The core of the scam is the transaction the user is asked to sign. Instead of a standard transaction to receive tokens, the user is tricked into signing a `setApprovalForAll` or similar malicious function. In plain English, you are not signing to *receive* something; you are signing to *give permission* for the scammer's contract to take everything.
5.  **The Drain:** Once the malicious approval is signed on the blockchain, the scammer's automated script immediately executes, transferring all approved assets from your wallet to theirs. It happens in an instant, and due to the irreversible nature of blockchain transactions, the funds are effectively gone for good.

This is not a hack of Zeta Markets itself. The platform's contracts remain secure. Rather, it is an attack on the platform's users, exploiting their trust and lack of security awareness. The general method is covered in our broader [Fake Airdrop Wallet Drainer Attacks](/warnings/fake-airdrop-wallet-drainer) warning.

## Red flags you should have seen

Understanding how to avoid these scams is critical. This Zeta Markets scam displayed several classic warning signs.

*   **Unofficial Links:** The number one rule of crypto is to never click on links from unverified sources. This includes replies on X, direct messages on Telegram or Discord, and unsolicited emails. Always navigate directly to the official website by typing the URL yourself.
*   **URL Mismatches:** Scammers register domains like `zeta-claim.org` or `zetamarket.io` to fool you. The official site is `zeta.markets`. Always double-check the URL in your browser's address bar before connecting your wallet.
*   **Sense of Urgency:** Phishing messages often use urgent language like "Claim Now!", "Final Chance!", or "Airdrop Closing Soon!". This is a psychological trick designed to make you act rashly without thinking. Legitimate airdrops have clear, pre-announced timelines.
*   **Suspicious Wallet Prompts:** Modern wallets are getting better at explaining what you are signing. If a transaction prompt asks for broad, sweeping permissions to "approve all" of your assets, it is a massive red flag. A legitimate airdrop claim should not require permission to spend your existing funds.

## What to do if you've been hit

If you suspect you have interacted with one of these malicious sites, time is of the essence.

1.  **Revoke Permissions:** Immediately go to a trusted Solana explorer like Solscan and use their token approval checker tool. Find and revoke any and all suspicious permissions you have granted. This severs the scammer's connection to your wallet.
2.  **Transfer Assets:** Do not assume revoking is enough. The safest course of action is to create a completely new, clean wallet with a new seed phrase. Swiftly transfer any remaining funds from the compromised wallet to the new one.
3.  **Abandon the Wallet:** Consider the old wallet permanently compromised and "burned." Do not use it for any future transactions.
4.  **Beware of Recovery Scams:** Scammers will likely contact you, claiming they can recover your stolen funds for an upfront fee. These are universally scams designed to steal even more from you. We detail this in our guide on [recovery scams targeting crypto victims](/warnings/recovery-scam-targeting-victims). Legitimate recovery is nearly impossible.

## Safer alternatives

The constant threat of scams raises the question: "is DeFi safe?" While innovative, it carries significant risks not present in more traditional finance or even centralised crypto exchanges. For those seeking exposure to crypto with more robust security layers, consider established platforms and tools.

For active trading, using a major, regulated exchange like [Binance](/reviews/binance) can offer more protection against these types of phishing attacks, as you are operating within their secure ecosystem.

For anyone serious about self-custody, a hardware wallet is non-negotiable. Devices like the [Ledger Nano X](/reviews/ledger-nano-x) require you to physically approve transactions on the device itself, providing a critical barrier that can prevent a drainer from succeeding even if you click a bad link.

Finally, if participating in DeFi, stick to the most battle-tested protocols on established networks like [Arbitrum](/reviews/arbitrum) and always verify information from primary sources. The collapse of platforms
