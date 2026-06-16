---
type: "warning"
title: "Malicious Google Ads for Starknet Airdrop Lead to Wallet Drainer"
slug: "malicious-google-ads-for-starknet-airdrop-lead-to-wallet-drainer-2026-05-14"
summary: "A new phishing campaign is using malicious Google Ads to target users searching for information on the Starknet airdrop. These ads lead to a fake claim website that deploys a wallet drainer upon connection. Security analysts have confirmed at least one victim has already lost app"
severity: "high"
platform_name: "Starknet"
alert_type: "platform"
published: true
published_at: "2026-05-14T06:01:06.304+00:00"
updated_at: "2026-05-14T06:01:06.321999+00:00"
---
# Malicious Google Ads for Starknet Airdrop Lead to Wallet Drainer

A sophisticated phishing campaign has exploited the hype around the Starknet (STRK) token airdrop, using malicious Google search ads to lure victims to wallet-draining websites. On-chain security analysts have confirmed that these scams, which went live alongside the official token claim, have already siphoned over $1 million in assets from unsuspecting users.

## TL;DR

*   **What happened:** Scammers bought top-ranking Google search ads for terms like "Starknet airdrop". These ads linked to convincing-looking fake websites that prompted users to connect their wallets, only to drain all their valuable tokens.
*   **Who is affected:** Anyone who searched for the Starknet airdrop on Google and clicked on a sponsored ad link instead of the official organic result. At least one victim lost over $110,000, with total losses from the wider phishing campaign exceeding $1.15 million.
*   **What to do NOW:** Do NOT use Google to find airdrop claim pages. Go directly to the project's official Twitter feed or website. If you have interacted with a suspicious site, use a tool like Revoke.cash immediately to cancel any malicious token approvals and move any remaining funds to a new, secure wallet.

## What happened

On 20 February 2024, the day the Starknet Foundation officially opened its STRK token airdrop, scammers were ready. They launched a multi-pronged phishing attack, with the most insidious vector being paid advertisements on Google's search engine.

Users who searched for legitimate terms like "Starknet claim" or "Starknet airdrop" were presented with sponsored links at the very top of their results page. These ads, designed to look official, directed users to typosquatted domains—subtly misspelled versions of the real Starknet site.

According to analysis from on-chain security firm Scam Sniffer, the broader phishing campaign targeting the Starknet airdrop netted criminals at least $1.15 million from over 100 victims in the first few hours alone. One high-profile victim had approximately $110,000 worth of various assets drained after interacting with one of the fake sites. This type of attack is becoming depressingly common, bearing a strong resemblance to the recent drainer scam that hit [ZetaChain users](/warnings/zetachain-users-hit-by-phishing-drainer-scam-over-1-8m-stolen-2026-05-06).

The speed and scale of the operation show a high degree of coordination, preying directly on the sense of urgency and "fear of missing out" that surrounds major token distribution events.

## How the scam works / How they got in

The attack follows a classic, yet brutally effective, phishing playbook. The core question many ask is "is Starknet safe?", and while the underlying technology may be sound, interacting with its ecosystem requires extreme caution. This "Starknet scam" was an attack on users, not the protocol itself.

1.  **The Bait:** A user, eager to claim their STRK tokens, searches on Google. A malicious ad, paid for by the scammers, appears as the top result, looking more prominent and official than the actual organic link.
2.  **The Hook:** The user clicks the ad and lands on a pixel-perfect clone of the real Starknet airdrop page. The URL is the only giveaway, often using tricks like `starknət-claim.com` or `official-starknet.io`.
3.  **The Switch:** The user is prompted to "Connect Wallet" to check their eligibility and claim their tokens. This is where the trap is sprung.
4.  **The Drain:** When the user clicks to approve the connection, their wallet (like MetaMask or Phantom) pops up a signature request. This isn't a simple login. The user is tricked into signing a malicious transaction, such as `setApprovalForAll` or a `Permit2` signature. In plain English, you are giving the scammer's smart contract permission to spend and transfer *all* of your valuable tokens—not just STRK, but your ETH, USDC, and any other asset in that wallet.
5.  **The Heist:** Once the permission is granted, an automated script instantly sweeps the victim's wallet clean, sending the funds to an address controlled by the scammers. By the time the user realises what has happened, their assets are long gone.

## Red flags you should have seen

Learning how to avoid these scams is critical. The warning signs were present for anyone not blinded by airdrop fever.

*   **Relying on Search Ads:** Legitimate crypto projects announce airdrops through their official, long-standing channels like Twitter and Discord. They almost never pay for Google ads to promote a claim link. Seeing a "Sponsored" tag next to a link for anything security-sensitive should be a giant, flashing red light.
*   **Ignoring the URL:** This is the golden rule of web security. Always, *always* triple-check the address bar. Bookmark official sites and only use those bookmarks. Never trust a link from an unverified source, even if it's at the top of Google.
*   **Signing Blindly:** Your crypto wallet is not a "Log in with Google" button. Every signature request is a legally binding contract on the blockchain. Read what you are signing. If a website is asking for broad, unlimited permissions to your funds ("Approve all"), it is a scam 99.9% of the time. The only exception is when you are listing an asset on a major, trusted marketplace, and even then, you must be cautious.
*   **Chasing Hype:** The frantic rush to claim airdrops creates a perfect environment for scammers. This frantic energy is what fuelled older, large-scale disasters like the infamous [BitConnect](/reviews/bitconnect) scheme. A genuine airdrop will have
