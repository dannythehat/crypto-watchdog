---
type: "warning"
title: "Fake Orb App on Apple App Store Drains User Wallets"
slug: "fake-orb-app-on-apple-app-store-drains-user-wallets-2026-05-12"
summary: "A malicious application impersonating the official 'Orb App' for Worldcoin was discovered on the Apple App Store. After users connected their wallets, the fake app drained their funds, with one victim reporting a loss of over $10,000. The app, which has since been removed, highli"
severity: "high"
platform_name: "Orb App (Fake)"
alert_type: "platform"
published: true
published_at: "2026-05-12T06:01:02.866+00:00"
updated_at: "2026-05-12T06:01:02.917985+00:00"
---
# Fake Orb App on Apple App Store Drains User Wallets

A malicious application impersonating the official Worldcoin platform was discovered on the Apple App Store in late May 2024. The fake "Orb App" tricked users into connecting their cryptocurrency wallets, enabling scammers to drain their funds, with one victim reporting a loss of over $10,000 before Apple finally removed the fraudulent software.

## TL;DR

*   **What happened:** A fake app named "Orb App - Worldcoin" was published on the Apple App Store by a developer called "Artisanal Bots." It successfully passed Apple's security review process.
*   **Who is affected:** Anyone who downloaded this fake app and connected their crypto wallet. The app acted as a wallet drainer, stealing assets after tricking users into signing malicious permissions.
*   **What to do NOW:** If you downloaded this app, immediately use a tool like Revoke.cash to cancel all active permissions from your wallet. Move any remaining funds to a new, secure wallet address.
*   **The lesson:** This fake Orb App scam is a stark reminder to never trust app stores blindly. Always verify an application's authenticity by using the official download link from the project's website.

## What happened

Around the 20th of May 2024, security researchers at Blockaid identified and flagged a malicious application masquerading as an official tool for the Worldcoin project. The app, titled "Orb App - Worldcoin," was cleverly named to confuse users, as the "Orb" is the physical iris-scanning device used by Worldcoin for identity verification.

The fraudulent app was published by an entity named "Artisanal Bots" and, alarmingly, was available for download on Apple's supposedly secure App Store for at least five days. This gave it a veneer of legitimacy that it did not deserve.

During its time on the store, an unknown number of users downloaded the app. One user, who goes by the handle @Naarkz on X (formerly Twitter), publicly reported that the app drained their wallet of over $10,000 worth of Arbitrum (ARB) tokens. On-chain data confirms the theft, showing the funds being transferred to an attacker-controlled address shortly after the victim interacted with the fake app.

Following reports from security firms and the community, Apple removed the application from its store on or around the 24th of May. However, the damage was already done, highlighting a critical vulnerability in the app vetting process.

## How the scam works / How they got in

This was a sophisticated phishing and wallet-drainer attack that exploited user trust in Apple's ecosystem. The success of this Orb App scam hinged on several steps:

1.  **Bypassing Security:** The scammers created an app that was benign enough on the surface to pass Apple's automated and manual review processes. The malicious code was likely obfuscated or triggered only after the user performed specific actions.
2.  **Impersonation:** By using Worldcoin's branding and a plausible-sounding name, the app tricked users into believing it was official. The real application is named "World App" and is published by "Tools for Humanity."
3.  **Malicious Permissions:** Upon opening the app, users were prompted to connect their cryptocurrency wallet (like MetaMask or Coinbase Wallet). The app then presented a request to sign a transaction. Instead of a standard connection request, this was a malicious approval function (such as `increaseAllowance` or `Permit2`).
4.  **Wallet Draining:** By signing this transaction, the user unknowingly granted the scammer's smart contract permission to spend tokens directly from their wallet. The attacker's script then automatically swept the victim's wallet for valuable assets and transferred them away. This is a common tactic seen in many recent attacks, including the [phishing drainer scam that targeted ZetaChain users](/warnings/zetachain-users-hit-by-phishing-drainer-scam-over-1-8m-stolen).

The core of the attack was social engineering, convincing the user to authorise the theft of their own funds under the guise of a legitimate action.

## Red flags you should have seen

While sophisticated, this attack presented several warning signs that a cautious user might have spotted. Learning how to avoid these traps is crucial.

*   **Incorrect App Name and Developer:** The single biggest red flag was the name. The official app is "World App." The developer of the official app is "Tools for Humanity," not "Artisanal Bots." A simple check on Worldcoin's official website would have revealed this discrepancy.
*   **Lack of History and Reviews:** A new app for a multi-billion dollar project should be viewed with extreme suspicion. The fake app had few to no legitimate reviews, no version history, and no established presence.
*   **Urgency and Vague Permissions:** When connecting your wallet, any request that seems overly broad or asks for permission to "spend" your tokens should be an immediate deal-breaker. Legitimate dApps are typically very specific about what they need access to and for what purpose. This fake Orb App warning should serve as a lesson to read every single word of a transaction request before signing.
*   **Source of Information:** If you found the app by searching the App Store instead of following a direct link from the official Worldcoin website, you were taking an unnecessary risk.

## What to do if you've been hit

If you suspect you downloaded this app or have had funds disappear from your wallet, act immediately.

1.  **Revoke All Permissions:** Do not delete the app first. Go to a trusted token approval checker like Revoke.cash, connect the affected wallet, and find any and all permissions granted to unknown or suspicious contracts. Revoke them immediately. This cuts off the attacker's access.
2.  **Create a New Wallet:** Your wallet's security has been compromised. Create a brand new wallet with a new seed phrase.
3.  **Transfer Remaining Assets:** Transfer any remaining funds from the compromised wallet to your new, secure wallet. The old wallet should be considered burned and never used again for storing funds.
4.  **Report the Incident:** File a report with Apple through their official channels and report the scam to your local authorities. You can also help warn others by [submitting a report to us](/submit).
5.  **Beware
