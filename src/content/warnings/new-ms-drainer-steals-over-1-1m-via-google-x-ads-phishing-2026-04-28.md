---
type: "warning"
title: "New 'MS' Drainer Steals Over $1.1M via Google & X Ads Phishing"
slug: "new-ms-drainer-steals-over-1-1m-via-google-x-ads-phishing-2026-04-28"
summary: "A new wallet drainer kit, dubbed 'MS', is being used in a widespread phishing campaign promoted via malicious Google and X (Twitter) ads. The campaign impersonates popular crypto projects like Ethena, ZkSync, and Orbiter Finance, tricking users into signing malicious signatures t"
severity: "critical"
platform_name: "Multiple"
alert_type: "platform"
published: true
published_at: "2026-04-28T06:00:57.795+00:00"
updated_at: "2026-05-09T03:27:50.072+00:00"
---
## Quick summary

A sophisticated phishing campaign is currently exploiting the advertising networks of Google and X. Using a malicious toolkit known as the MS drainer, attackers have stolen over 1.1 million dollars from hundreds of victims. This operation targets users looking for popular decentralised finance protocols.

The scam relies on high quality impersonation of legitimate projects. By purchasing top tier ad placements, the criminals bypass traditional search filters. Victims unknowingly grant permission for the drainer to empty their wallets. This alert details the mechanics of the MS drainer and how to protect your assets.

## What happened

On 13 May 2024, security researchers identified a massive spike in wallet drainer activity. The MS drainer kit emerged as the primary tool behind a coordinated phishing effort. In just 24 hours, the campaign successfully compromised more than 800 individual wallets.

The attackers purchased sponsored links on Google and promoted posts on X. These ads appeared when users searched for terms related to Ethena, ZkSync, or Orbiter Finance. Because the links appeared as official advertisements, many users assumed they were safe to click.

Once a user clicks the ad, they are directed to a near perfect replica of the official project website. These sites are designed to harvest signatures rather than provide services. The speed and scale of the losses highlight the efficiency of modern automated drainer scripts.

## Why this matters

This campaign proves that even experienced users can be deceived by paid placements on reputable platforms. Many people trust Google search results or verified X accounts. When scammers buy their way into these slots, the traditional trust model of the internet breaks down.

The MS drainer is part of a growing trend of "Scam as a Service" models. Criminal developers lease these tools to affiliates who run the marketing. This professionalisation of crypto theft makes it harder for individual investors to stay ahead of the latest [crypto scam warnings](/warnings).

Furthermore, the assets stolen are often moved through mixers or decentralised exchanges instantly. This makes recovery almost impossible for the average user. Understanding the technical nature of these signatures is now a mandatory skill for anyone interacting with on chain protocols.

## How the scam or exploit works

The MS drainer operates through a process called signature phishing. It does not need your private key or seed phrase to steal your funds. Instead, it tricks you into signing a specific type of transaction that grants the attacker control over your tokens.

When you connect your wallet to the fake site, a pop up appears. It often looks like a standard "Connect" or "Verify" request. However, the underlying code is requesting an `increaseAllowance` or `permit` function. These are legitimate smart contract commands used for trading.

By signing this request, you are effectively giving the scammer a blank cheque. The MS drainer script then scans your wallet for the most valuable assets. It uses the permission you just granted to transfer those assets to the attacker's address in a single transaction.

This method is particularly dangerous because it bypasses the need for the user to manually send funds. The drainer does the work for them. For more information on protecting your digital assets, consult our [crypto safety education](/education) resources.

## Red flags to check first

The most obvious red flag is any crypto project using paid search ads for an airdrop. Legitimate protocols rarely use Google Ads to distribute tokens. They rely on their official documentation and verified social media profiles to communicate with their community.

Check the URL carefully for subtle misspellings or unusual domain extensions. Scammers might use a .net or .org extension when the real project uses .fi or .com. If the site feels rushed or creates a high sense of urgency, it is likely a trap.

Be wary of any site that asks for token approvals immediately upon landing. A standard connection should only request to view your address. If your wallet extension warns you about "Permit" or "Set Approval For All," stop immediately and close the browser tab.

Finally, ignore any direct messages on X or Telegram claiming to offer technical support for these platforms. These are often secondary layers of the same phishing campaign. You can find more tips on identifying these traps in our [crypto scam guides](/scam-guides).

## What victims should do now

If you have interacted with a suspicious ad, you must act within seconds. Your first priority is to sever the connection between your wallet and the malicious contract. Use a tool like [Revoke cash approval checker](@@P0@@) to see which contracts have permission to move your funds.

Revoke every suspicious permission you find. Do not wait to see if your funds are still there. If the drainer has not yet executed the transfer, revoking the approval will stop it. If your funds are already gone, the wallet is permanently compromised.

Never use that specific wallet address again. Even if you revoke permissions, the attackers may have logged your IP or other metadata. Move any remaining dust or low value tokens to a fresh wallet created with a new seed phrase.

Be extremely careful of anyone claiming they can recover your lost crypto. These are almost always [crypto recovery scam warnings](/blog/crypto-recovery-scams-warning) designed to steal even more money from victims. No legitimate security firm will ask for an upfront fee to "hack back" your stolen assets.

## How to avoid similar crypto scams

The best way to avoid the MS drainer is to never click on sponsored links in search results. Use a reputable ad blocker to hide these results entirely. Always navigate to crypto platforms via official links found in their verified X bios or documentation.

Consider using a dedicated browser for crypto activities. This browser should have no social media accounts logged in and minimal extensions. This reduces the risk of cross site scripting attacks and keeps your financial activity isolated from your general web browsing.

For long term storage, a hardware wallet is essential. However, even a hardware wallet cannot protect you if you sign a malicious "Permit" transaction. You must read every line of the transaction summary in your wallet before clicking confirm.

Before using any new platform, you can use our [free crypto safety check](/reviews) to look for known issues. Staying informed through [vetted crypto platform reviews](/reviews) is also a vital part of a safe investment strategy. If you encounter a new suspicious site, please [report a crypto scam](/submit) to help the community.

## Related reading

To further enhance your security posture, we recommend reviewing the following resources. The [MetaMask stay safe in web3 guide](@@P1@@) provides excellent technical advice for wallet users. For broader trends in digital asset crime, the [Chainalysis crypto crime research](@@P2@@) is an industry standard.

If you are a victim in the UK, you should report the incident to [Action Fraud UK](@@P3@@). Residents of the United States should contact the [FBI Internet Crime Complaint Center](@@P4@@). These reports help law enforcement track the movement of stolen funds across the globe.

For those interested in the technical evolution of these threats, the [Scam Sniffer wallet drainer reports](@@P5@@) offer deep dives into malicious code. Staying educated is your best defence against the rapidly changing landscape of decentralised finance.

_This alert is educational and not financial advice. Always verify directly with official sources and your own research._
