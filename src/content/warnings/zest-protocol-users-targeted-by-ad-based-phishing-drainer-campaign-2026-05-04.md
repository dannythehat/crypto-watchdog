---
type: "warning"
title: "Zest Protocol Users Targeted by Ad-Based Phishing Drainer Campaign"
slug: "zest-protocol-users-targeted-by-ad-based-phishing-drainer-campaign-2026-05-04"
summary: "A phishing campaign is actively targeting users by impersonating the Zest Protocol via malicious Google and X advertisements. These ads lead to a fake website that tricks users into signing malicious transactions, draining their wallets. Security analysts report that over $450,00"
severity: "high"
platform_name: "Zest Protocol"
alert_type: "platform"
published: true
published_at: "2026-05-04T06:00:52.236+00:00"
updated_at: "2026-05-04T06:00:52.464633+00:00"
---
# Zest Protocol Users Targeted by Ad-Based Phishing Drainer Campaign

A sophisticated phishing campaign is actively draining the wallets of Zest Protocol users by leveraging malicious advertisements on Google and X (formerly Twitter). These ads direct unsuspecting users to a convincing but fake version of the Zest website, where they are tricked into signing transactions that grant scammers full control over their assets. On-chain analysis confirms that attackers have already siphoned over $450,000 from multiple victims in this ongoing attack.

## TL;DR

*   **What happened:** Scammers are running paid ads on Google and X that impersonate Zest Protocol. These ads lead to a phishing site that tricks users into signing malicious "permit" transactions, which drains their wallets.
*   **Who is affected:** Anyone searching for or trying to interact with Zest Protocol who clicks on these sponsored links instead of navigating to the official URL directly.
*   **What to do NOW:** NEVER click on sponsored links or ads for crypto platforms. Always type the official URL directly into your browser. If you have interacted with a suspicious site, use a tool like Revoke.cash immediately to cancel any active token approvals.

## What happened

On or around the 21st of May 2024, on-chain security analysts at Scam Sniffer first raised the alarm about a targeted phishing campaign. Attackers were using Google's and X's ad networks to promote fraudulent websites designed to look identical to the real Zest Protocol, a Bitcoin lending platform.

When users searched for terms like "Zest Protocol," these malicious ads appeared at the top of the results, labelled as "Sponsored." Clicking the ad led to a phishing domain, such as `zestprotocol.claims` (note: this is not the real site). This clone site would then prompt the user to connect their wallet.

The trap was sprung when the site requested the user to sign a transaction. Instead of a standard connection request, the site initiated a malicious signature request, typically using `permit` or `increaseAllowance` functions. One victim, who signed such a transaction, lost approximately $127,000 worth of Stacks (stSTX) tokens. Another user was drained of assets worth over $330,000. In total, verified losses have surpassed $450,000, and the figure may rise as the campaign is still active. This Zest Protocol scam uses a common "wallet drainer" script, a tactic we've seen in other recent attacks, like the [new 'MS' drainer campaign that also used Google and X ads](/warnings/new-ms-drainer-steals-over-1-1m-via-google-x-ads-phishing-2026-04-28).

## How the scam works / How they got in

The attackers' method is brutally effective because it preys on common user behaviour. It doesn't require a complex hack of the protocol itself; it simply tricks the end-user.

1.  **The Bait:** The user searches for the protocol on a trusted site like Google. The scammers have paid to place their malicious link at the very top of the search results. Most people instinctively click the first link, especially when it looks official.
2.  **The Switch:** The user lands on a pixel-perfect copy of the real Zest Protocol website. Every logo, button, and line of text is identical. The only clue is the URL in the address bar, which is subtly different from the official one.
3.  **The Hook:** The fake site prompts the user to "Connect Wallet" to use the platform. This is a standard procedure in decentralised finance (DeFi), so it doesn't raise immediate suspicion.
4.  **The Kill:** This is the critical step. The site asks the user to sign a message. To the untrained eye, it might look like a simple login confirmation. In reality, the user is signing a transaction that gives the scammer's smart contract unlimited permission (`permit`) to spend specific tokens from their wallet.
5.  **The Drain:** Once the malicious signature is on the blockchain, an automated script instantly transfers all approved assets from the victim's wallet to one controlled by the scammers. The funds are then typically laundered through mixers to obscure their trail.

## Red flags you should have seen

Many users ask, "is Zest Protocol safe?" Whilst the protocol itself was not hacked here, interacting with the wider crypto ecosystem carries risks. Knowing how to avoid these traps is your best defence.

*   **Relying on Ads:** The number one red flag was clicking a "Sponsored" link. Established projects rarely need to run aggressive ad campaigns for their main application page. Always be deeply sceptical of paid search results for financial platforms. Bookmark official sites.
*   **URL Negligence:** The phishing domain was not the official one. Always, without exception, double-check and even triple-check the URL in your browser's address bar before connecting your wallet. Look for subtle misspellings (`zestprotocoll` vs `zestprotocol`) or different domains (`.claims` vs `.io`).
*   **Vague Signature Requests:** Your wallet will ask you to approve the transaction. Modern wallets are getting better at explaining what a signature means, but many users still click "Confirm" without reading. If a site asks for broad permissions like `setApprovalForAll` or to `permit` spending, stop immediately. A simple connection does not require permission to move your funds.
*   **Sense of Urgency:** Phishing sites often dangle fake "airdrops" or "special rewards" to rush you into making a mistake. Legitimate protocols communicate these events through official, long-standing channels, not through pop-ups on a site you just landed on.

## What to do if you've been hit

If you suspect you've signed a malicious transaction, time is critical.

1.  **Revoke Permissions:** Immediately go to a token approval checker like Revoke.cash or the tool built into block explorers like Etherscan. Connect the affected wallet and revoke all permissions given to any suspicious or unknown contracts. This severs the scammer's access to your funds.
2.  **Isolate Assets:** Transfer any remaining funds from the compromised wallet to a brand new, secure wallet address. Consider the old wallet permanently burned.
3.  **Report Everything:** Report the malicious ad to Google/X. Use domain lookup tools (like WHOIS) to find the registrar and hosting provider of the phishing site and report it for abuse. This helps get it taken down.
4.  **Beware Recovery Scams:** Scammers will monitor your public address. You will likely be contacted by individuals or fake companies claiming they can recover your stolen crypto for a fee. These are *always* scams. Services like [CryptoRecoveryPro, which we rate as a scam](/reviews/crypto-recovery-pro), are designed to prey on victims a second time. There is no magic recovery button.

## Safer alternatives

This Zest Protocol warning highlights the dangers of user error in DeFi. While no digital asset is without risk, certain practices and platforms can significantly improve your security posture.

*   **Use a Hardware Wallet:** A physical device like a [Ledger Nano X](/reviews/ledger-nano-x) requires you to physically approve transactions. This extra step prevents drive-by drainer attacks and forces you to pause and consider what you are signing.
