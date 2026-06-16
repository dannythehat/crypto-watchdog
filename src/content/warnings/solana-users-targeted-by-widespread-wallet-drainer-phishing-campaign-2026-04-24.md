---
type: "warning"
title: "Solana Users Targeted by Widespread 'Wallet Drainer' Phishing Campaign"
slug: "solana-users-targeted-by-widespread-wallet-drainer-phishing-campaign-2026-04-24"
summary: "A sophisticated phishing campaign is actively targeting Solana users through deceptive links on platforms like X (formerly Twitter) and Discord. These links lead to wallet drainer kits that mimic legitimate Solana ecosystem dApps, tricking users into signing malicious transaction"
severity: "critical"
platform_name: "Multiple"
alert_type: "platform"
published: true
published_at: "2026-04-24T06:01:03.655+00:00"
updated_at: "2026-04-24T06:01:03.710941+00:00"
---
# Solana Users Targeted by Widespread 'Wallet Drainer' Phishing Campaign

A sophisticated and aggressive phishing campaign is actively draining the wallets of Solana users, leveraging deceptive links on social media platforms like X and Discord. Security researchers at Scam Sniffer have confirmed that these wallet drainer attacks stole over $4 million from more than 4,000 victims in February 2024 alone. The attackers use fake websites that mimic popular Solana projects to trick users into signing malicious transactions, granting them full control over the user's assets.

## TL;DR

*   **What Happened:** Scammers are promoting fake airdrops and websites for Solana projects on X (formerly Twitter) and Discord. These sites trick users into connecting their wallets and signing transactions that drain all their SOL, SPL tokens, and NFTs.
*   **Who Is Affected:** Anyone interacting with the Solana ecosystem, particularly those using hot wallets like Phantom or Solflare and clicking on links from social media. Over 4,600 victims have been identified so far.
*   **What to Do NOW:** Do not click on unsolicited links promising airdrops or mints. If you suspect you have interacted with a malicious site, use a tool like `sol-incinerator.com` or Step Finance to revoke all token approvals immediately. Move any remaining funds to a new, secure wallet with a fresh seed phrase.

## What Happened

Throughout February and continuing into March 2024, a coordinated phishing campaign has been systematically targeting the Solana community. On March 1st, blockchain security firm Scam Sniffer published a report detailing the scale of the operation. Their analysis revealed that in February, a network of phishing sites using specialised "wallet drainer" kits successfully stole approximately $4.17 million from at least 4,642 victims.

The attackers' primary method involves compromising or creating social media accounts on X and Discord to spread malicious links. These posts and direct messages often impersonate well-known crypto influencers or projects, announcing a surprise airdrop, a limited-time NFT mint, or access to a new decentralised application (dApp). The links lead to meticulously crafted websites that are pixel-perfect copies of legitimate platforms such as Phantom, Jupiter, Jito, and others within the Solana ecosystem. Unsuspecting users, believing they are on a genuine site, are prompted to connect their wallet to claim their "reward."

## How the Scam Works / How they Got In

This particular Solana scam relies on social engineering and malicious smart contract interactions, not on hacking the Solana network itself. The vulnerability is human, not technical.

1.  **The Bait:** An enticing link is shared on social media. It might be a reply to a popular crypto personality's post, a direct message from a "friend" whose account has been compromised, or a post in a Discord server. The message creates a sense of urgency or FOMO (Fear Of Missing Out).
2.  **The Phishing Site:** The link directs the victim to a fake website. The URL might be subtly different from the real one (e.g., `jupiters.io` instead of `jup.ag`). The site looks and feels completely authentic.
3.  **The Malicious Transaction:** The user is prompted to connect their wallet. Then, the site asks them to "approve" or "sign" a transaction to proceed. This is the critical step. The pop-up from the user's wallet (like Phantom) will show a transaction, but many users, conditioned to click "approve" quickly, don't inspect the details. The transaction they are signing is not a simple login; it's often a `setApprovalForAll` command or a pre-signed transfer that gives the scammer's contract permission to move assets out of the user's wallet.
4.  **The Drain:** Once the malicious transaction is signed, the drainer script executes instantly. It programmatically scans the victim's wallet for all valuable assets—SOL, USDC, BONK, WIF, and any NFTs—and transfers them to wallets controlled by the attacker. The entire process is automated and takes mere seconds.

These attacks are a stark reminder of the dangers lurking behind seemingly legitimate offers and are a more advanced version of the [fake airdrop wallet drainer attacks](/warnings/fake-airdrop-wallet-drainer) we have warned about previously.

## Red Flags You Should Have Seen

Many users are asking "is Solana safe?" Whilst the underlying blockchain is secure, user security practices are paramount. This Solana warning highlights several red flags that could have prevented these losses.

*   **Unsolicited Offers:** Any direct message or random social media reply promising free money, airdrops, or exclusive access is almost certainly a scam. Legitimate projects announce airdrops through official, well-publicised channels, not through random DMs.
*   **Sense of Urgency:** Language like "Last chance!", "Only 100 spots left!", or "Claim within the hour!" is designed to make you act rashly without thinking. Pause and be sceptical.
*   **Suspicious URLs:** Always double-check the website address in your browser's URL bar before connecting your wallet. Bookmark official sites for projects you use frequently to avoid navigating via questionable links.
*   **Vague Transaction Details:** Modern wallets are improving at warning users about potentially malicious transactions. If your wallet pops up a warning or asks for broad permissions ("Allow this site to transfer all your NFTs"), reject the transaction immediately. Never sign a transaction you don't fully understand. Learning how to avoid these signature requests is a critical crypto survival skill.

## What to Do If You've Been Hit

If you suspect your wallet has been compromised, you must act immediately.

1.  **Revoke Permissions:** Go to a trusted token approval checker for Solana, such as Sol-Incinerator or the tool on Step Finance. Connect your wallet and revoke all permissions, especially any recent or suspicious ones. This may prevent the drainer from taking more assets if it hasn't already.
2.  **Create a New Wallet:** Your current wallet's seed phrase is compromised. Immediately create a brand new wallet with a new seed phrase. The safest option is a hardware wallet, which keeps your keys offline. Our review of the [Ledger Nano X](/reviews/ledger-nano-x) explains why this is the gold standard for asset security.
3.  **Transfer Remaining Funds:** Transfer any assets that were not stolen from your compromised wallet to your new, secure wallet. Do this *after* revoking permissions.
4.  **Beware of Recovery Scams:** You will likely be contacted by scammers claiming they can recover your stolen funds for an upfront fee. These are always scams designed to victimise you a second time. Read our detailed alert on [recovery scams targeting crypto victims](/warnings/recovery-scam-targeting-victims) to understand their tactics.

## Safer Alternatives

Instead of chasing high-risk airdrops on social media, focus on interacting with established, well-audited parts of the crypto ecosystem.

*   **Use Audited DeFi Protocols:** Stick to platforms with a long history, public audits, and significant total value locked (TVL). Blue-chip protocols like [Aave](/reviews/aave) on Ethereum and other EVM chains have stood the test of time and provide a benchmark for what a secure dApp looks like.
*   **Store Assets Securely:** Do not keep your life savings in a "hot wallet" that is constantly connected to the internet and used for interacting with dApps. Use a hardware wallet for long-term storage and a separate hot wallet with minimal funds for daily transactions.
*   **Explore Established Networks:** If you are interested in scalability and lower fees, consider established Layer 2 networks like [Arbitrum](/reviews/arbitrum), which have a mature and battle-tested ecosystem of applications.

The fundamental rule remains: if an offer seems too good to be true, it is. There is no free money in crypto, only risk that needs to be managed carefully.

_This alert is educational and not financial advice. Always verify directly with the platform and your own research._
