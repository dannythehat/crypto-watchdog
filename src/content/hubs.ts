// Category landing-page ("hub") definitions. Each hub is a curated, keyword-
// targeted page that shows the platforms we ENDORSE (green) vs ones to approach
// with CAUTION (orange) vs ones to AVOID (red / active scam warnings) — with
// deep internal links into reviews, warnings and guides.
//
// Slugs map to clean root URLs (e.g. /ai-finance). Review/warning/post slugs are
// resolved at render time; anything missing is silently skipped, so it is always
// safe to list an aspirational slug here.

import type { MascotMood } from "@/components/WatchdogMascot";

export interface HubFaq { q: string; a: string }

export interface Hub {
  slug: string;
  eyebrow: string;
  title: string;          // H1
  metaTitle: string;
  metaDescription: string;
  keyword: string;
  mood: MascotMood;       // mascot mood on the hero
  accent: string;         // hex used for hero glow
  heroPrompt: string;     // Pollinations FLUX prompt for the hero image
  heroSeed: number;       // fixed seed → stable image
  intro: string;          // markdown, rendered under the hero
  trusted: string[];      // review slugs (green)
  caution: string[];      // review slugs (orange)
  avoid: string[];        // review slugs (red)
  warnings: string[];     // warning slugs (active scam alerts)
  relatedPosts: string[]; // blog slugs
  faq: HubFaq[];
}

export const hubs: Hub[] = [
  {
    slug: "ai-finance",
    eyebrow: "AI Finance",
    title: "AI Crypto Finance: Which Platforms Are Real — and Which Are Scams",
    metaTitle: "AI Crypto Finance 2026: Real Platforms vs Scams",
    metaDescription:
      "AI trading agents, yield bots and 'quant funds' are the most scam-prone niche in crypto. See which AI finance platforms we endorse — and which to avoid.",
    keyword: "ai crypto finance",
    mood: "scan",
    accent: "#4F8BFF",
    heroPrompt:
      "dark cinematic cyber trading floor with a glowing blue AI neural-network brain made of circuitry hovering above holographic candlestick charts, electric blue and violet volumetric light, ultra detailed, futuristic, octane render",
    heroSeed: 31,
    intro:
      "“AI” is the most abused word in crypto right now. For every genuine tool that uses machine learning to manage risk, there are a dozen **AI-washed** schemes that slap a chatbot on a Ponzi and promise guaranteed daily returns.\n\nWe test these platforms the same way we test everything: who runs it, where the money actually goes, and whether you can get it back out. Below are the AI finance platforms we currently **endorse**, the ones that need **caution**, and the ones to **avoid outright**. Start with our guide on [how to spot AI-washing](/blog/how-to-spot-ai-washing-crypto).",
    trusted: ["moneyflare", "aurum-foundation", "topone-futures", "kinesis-money"],
    caution: ["pionex", "3commas", "cryptohopper"],
    avoid: ["yieldmax-ai", "shadowtradebot", "crypto-signal-services-general"],
    warnings: ["yieldmax-ai-scam-warning", "telegram-investment-bot-scams", "cryptomine-pro-scam-warning"],
    relatedPosts: ["how-to-spot-ai-washing-crypto", "what-is-ai-finance-crypto", "are-telegram-trading-bots-safe-a-crypto-watchdog-investigation-2026-05-09"],
    faq: [
      { q: "Can AI really trade crypto profitably for me?", a: "Some tools genuinely use automation and risk models that help disciplined traders. But no honest platform can promise fixed daily profits — markets don't work that way. Any 'AI bot' guaranteeing returns is the oldest scam in a new costume." },
      { q: "What is 'AI-washing'?", a: "It's when a project markets itself as AI-powered to look sophisticated, while the underlying business is just a high-yield investment scheme paying old investors with new deposits. The 'AI' is decoration." },
      { q: "How do you decide which AI platforms to endorse?", a: "We look for a real, named team, a working product you control, transparent fees, withdrawals that actually clear, and no guaranteed-return claims. Platforms that fail these get an orange or red rating." },
    ],
  },
  {
    slug: "crypto-exchanges",
    eyebrow: "Exchanges",
    title: "Best Crypto Exchanges 2026: The Safe Ones vs the Risky Ones",
    metaTitle: "Best Crypto Exchanges 2026 (Safe vs Risky)",
    metaDescription:
      "We deposit and withdraw real money to test crypto exchanges. See which exchanges we trust in 2026, which need caution, and how to pick a safe one.",
    keyword: "best crypto exchanges",
    mood: "approve",
    accent: "#16C784",
    heroPrompt:
      "a secure futuristic crypto exchange vault, glowing emerald shields and golden bitcoin coins, holographic trading screens, deep teal and electric blue volumetric light, cinematic, ultra detailed",
    heroSeed: 32,
    intro:
      "An exchange is where most people's crypto journey starts — and where a lot of it ends badly. The difference between a well-run exchange and a risky one shows up exactly when it matters: **when you try to withdraw**.\n\nWe rate exchanges on security, regulation, transparency and real deposit/withdrawal testing. Here are the exchanges we currently trust, the ones to approach carefully, and the guides to read before you sign up — starting with [how to pick a safe crypto exchange](/blog/how-to-pick-safe-crypto-exchange-2026).",
    trusted: ["kraken", "coinbase", "binance", "xt-com", "okx", "bisq"],
    caution: ["bitget", "bybit", "kucoin", "bingx", "etoro"],
    avoid: [],
    warnings: ["recovery-scam-wave-2026"],
    relatedPosts: ["best-crypto-exchange-uk-2026", "how-to-pick-safe-crypto-exchange-2026", "your-crypto-on-an-exchange-isn-t-yours-what-happens-when-it-goes-bust-2026-05-21"],
    faq: [
      { q: "What's the safest crypto exchange in 2026?", a: "There's no single 'safest' for everyone, but exchanges with strong regulation, proof-of-reserves and clean withdrawal records — like Kraken and Coinbase — score highest in our audits. The right one depends on your country and needs." },
      { q: "Are big exchanges safer than small ones?", a: "Usually, but not always — size didn't save FTX. We weigh regulation, transparency and a verifiable withdrawal track record over brand recognition." },
      { q: "Should I leave my crypto on an exchange?", a: "For long-term holdings, no. An exchange holds the keys, which means you're trusting them to stay solvent. For anything you can't afford to lose, move it to a wallet you control." },
    ],
  },
  {
    slug: "crypto-wallets",
    eyebrow: "Wallets",
    title: "Best Crypto Wallets 2026: Hardware & Hot Wallets We Trust",
    metaTitle: "Best Crypto Wallets 2026 (Hardware & Hot)",
    metaDescription:
      "Your wallet is your last line of defence. See the hardware and software wallets CryptoWatchdog trusts in 2026 — and the fake wallet apps to avoid.",
    keyword: "best crypto wallets",
    mood: "approve",
    accent: "#16C784",
    heroPrompt:
      "a glowing hardware crypto wallet device on a pedestal inside a dark vault, protective blue energy shields and a luminous key of light, emerald and electric blue, cinematic, ultra detailed",
    heroSeed: 33,
    intro:
      "Not your keys, not your coins. A wallet you truly control is the single biggest upgrade you can make to your crypto security — but only if it's the real thing. Fake wallet apps and malicious browser extensions are one of the most common ways people get drained.\n\nBelow are the wallets we trust across hardware and software, plus the impostors to watch for. New to self-custody? Read [self-custody vs custodial wallets](/blog/self-custody-vs-custodial-wallets-2026) first.",
    trusted: ["ledger-nano-x", "trezor", "metamask", "phantom", "argent", "safe-gnosis", "trust-wallet"],
    caution: ["coinbase-wallet-custodial"],
    avoid: [],
    warnings: ["fake-metamask-extensions", "fake-airdrop-wallet-drainer"],
    relatedPosts: ["best-hardware-wallet-2026-ledger-vs-trezor", "self-custody-vs-custodial-wallets-2026", "top-crypto-wallet-features-safety-usability"],
    faq: [
      { q: "Hardware or software wallet — which should I use?", a: "For meaningful amounts, a hardware wallet (cold storage) like Ledger or Trezor is the gold standard. A reputable software wallet is fine for small, everyday amounts you actively use." },
      { q: "How do fake wallet scams work?", a: "Scammers publish lookalike apps and browser extensions, or run fake 'wallet support' that asks for your seed phrase. No real wallet will ever ask for your recovery phrase — that request is always a scam." },
      { q: "What's the one rule that keeps a wallet safe?", a: "Never type or photograph your seed phrase anywhere digital, and never share it. Whoever has the seed phrase has the coins." },
    ],
  },
  {
    slug: "copy-trading",
    eyebrow: "Copy Trading",
    title: "Copy Trading Platforms 2026: Safe Ways to Copy Pro Traders",
    metaTitle: "Copy Trading Crypto 2026: Safe Platforms vs Scams",
    metaDescription:
      "Copy trading lets you mirror experienced traders automatically — but it's a magnet for fake 'gurus'. See which copy-trading platforms we rate and which to avoid.",
    keyword: "crypto copy trading",
    mood: "caution",
    accent: "#F5A524",
    heroPrompt:
      "a futuristic trading dashboard with mirrored glowing trader silhouettes and flowing data streams, warm amber and electric blue light, dark cyber floor, cinematic, ultra detailed",
    heroSeed: 34,
    intro:
      "Copy trading sounds perfect: link your account, mirror a proven trader, and let the profits roll in. In reality, past performance is easy to fake, leverage quietly amplifies losses, and 'signal groups' are riddled with paid shillers.\n\nThere are legitimate, regulated copy-trading platforms — and a lot that aren't. Here's where we land on the main players, plus the [Telegram trading-bot investigation](/blog/are-telegram-trading-bots-safe-a-crypto-watchdog-investigation-2026-05-09) everyone considering this should read.",
    trusted: ["topone-futures"],
    caution: ["etoro-copytrader", "zulutrade", "thomas-crypto-signals", "3commas"],
    avoid: ["crypto-signal-services-general", "shadowtradebot"],
    warnings: ["telegram-investment-bot-scams", "recovery-scam-wave-2026"],
    relatedPosts: ["are-telegram-trading-bots-safe-a-crypto-watchdog-investigation-2026-05-09", "ai-trading-bots-your-guide-to-separating-genuine-tools-from-get-rich-quick-scams-2026-05-25", "the-hidden-costs-of-crypto-leverage-for-beginners-more-than-just-margin-calls-2026-04-18"],
    faq: [
      { q: "Is copy trading safe?", a: "It can be on a regulated platform with transparent, verified track records and sensible risk limits. It is not safe when 'returns' are unverifiable, leverage is high, or you're copying an anonymous trader in a Telegram group." },
      { q: "Why are signal groups risky?", a: "Many are pump-and-dump funnels or affiliate mills. The people posting 'winning' screenshots often profit from your subscription or from dumping a coin on you — not from the trades themselves." },
      { q: "Can I lose more than I invest copying a trader?", a: "With leveraged copy trading, yes — losses can exceed your initial stake. Always check whether a platform uses leverage and what the maximum drawdown could be." },
    ],
  },
  {
    slug: "defi-platforms",
    eyebrow: "DeFi",
    title: "Best DeFi Platforms 2026: Trusted Protocols vs Ponzi Traps",
    metaTitle: "Best DeFi Platforms 2026 (Trusted vs Ponzi)",
    metaDescription:
      "DeFi can offer real yield — or fake yield paid from new deposits. See the DeFi protocols CryptoWatchdog trusts, which need caution, and the ones that blew up.",
    keyword: "best defi platforms",
    mood: "scan",
    accent: "#4F8BFF",
    heroPrompt:
      "an abstract decentralized finance network of glowing interconnected nodes and liquidity pools floating in dark space, electric blue and violet energy, cinematic, ultra detailed",
    heroSeed: 35,
    intro:
      "DeFi removes the middleman — and the safety net. The best protocols are audited, battle-tested and transparent about where yield comes from. The worst dress up unsustainable token emissions as 'real yield' until the music stops.\n\nHere's our current read on the major DeFi platforms, plus the collapses worth studying. Before chasing a headline APY, read [real yield vs ponzi yield](/blog/defi-lending-real-yield-vs-ponzi-yield-2026).",
    trusted: ["aave", "uniswap", "curve-finance", "pancakeswap", "rocket-pool", "defillama", "zapper"],
    caution: ["lido-finance", "gmx"],
    avoid: ["anchor-protocol", "bitconnect", "blockfi"],
    warnings: ["solana-pump-dump-warning"],
    relatedPosts: ["defi-lending-real-yield-vs-ponzi-yield-2026", "non-custodial-smart-contract-trading-explained", "anatomy-of-a-rug-pull-7-on-chain-signals-2026"],
    faq: [
      { q: "Is DeFi safe?", a: "Established, audited protocols like Aave and Uniswap have long track records, but smart-contract risk, governance risk and de-pegs are real. DeFi is 'self-driving' money — powerful, but you're responsible for the wheel." },
      { q: "What's the difference between real yield and ponzi yield?", a: "Real yield comes from genuine economic activity — lending interest, trading fees, staking rewards. Ponzi yield is paid from new investors' deposits or inflationary token printing, and it always runs out." },
      { q: "How can I check a DeFi protocol before using it?", a: "Look for independent audits, meaningful total value locked, a transparent team or DAO, and a clear explanation of where the yield comes from. If you can't find that, treat the APY as a warning, not an invitation." },
    ],
  },
  {
    slug: "crypto-trading-bots",
    eyebrow: "Trading Bots",
    title: "Crypto Trading Bots 2026: Which Automation Is Actually Safe",
    metaTitle: "Crypto Trading Bots 2026: Safe vs Scam",
    metaDescription:
      "Trading bots promise hands-off profits. Some are legitimate automation tools; many are scams. See which crypto trading bots we rate and which to avoid in 2026.",
    keyword: "crypto trading bots",
    mood: "caution",
    accent: "#F5A524",
    heroPrompt:
      "a sleek robotic trading-bot arm interacting with floating holographic candlestick charts, amber and electric blue glow, dark cyber background, cinematic, ultra detailed",
    heroSeed: 36,
    intro:
      "A trading bot is just software that executes a strategy for you. Good ones are transparent tools you stay in control of. Bad ones are black boxes that ask you to deposit funds into *their* account and promise guaranteed profit — a classic setup for disappearing with your money.\n\nHere's how the main bots stack up, plus the [hidden costs of leverage](/blog/the-hidden-costs-of-crypto-leverage-for-beginners-more-than-just-margin-calls-2026-04-18) that automation can quietly amplify.",
    trusted: ["pionex"],
    caution: ["3commas", "cryptohopper"],
    avoid: ["shadowtradebot", "crypto-signal-services-general"],
    warnings: ["telegram-investment-bot-scams"],
    relatedPosts: ["are-telegram-trading-bots-safe-a-crypto-watchdog-investigation-2026-05-09", "ai-trading-bots-your-guide-to-separating-genuine-tools-from-get-rich-quick-scams-2026-05-25", "the-hidden-costs-of-crypto-leverage-for-beginners-more-than-just-margin-calls-2026-04-18"],
    faq: [
      { q: "Do crypto trading bots actually work?", a: "Legitimate bots can automate a strategy you already understand — grid trading, DCA, rebalancing. They are tools, not money machines, and they can lose money just as efficiently as they make it." },
      { q: "What's the biggest red flag with a trading bot?", a: "Being asked to deposit funds into the bot operator's wallet or account, rather than connecting via read/trade-only API keys on your own exchange. If they custody your money and promise profit, walk away." },
      { q: "Are bots that connect via API keys safer?", a: "Safer, yes — especially if you disable withdrawal permissions on the API key so the bot can trade but never move funds out. It's not risk-free, but you keep custody." },
    ],
  },
  {
    slug: "tokenized-assets",
    eyebrow: "Tokenization",
    title: "Tokenized Real-World Assets 2026: Gold, Treasuries & Property",
    metaTitle: "Best Tokenized Assets 2026: Gold, RWA, Treasuries",
    metaDescription:
      "Tokenized gold, US Treasuries and real estate are crypto's fastest-growing sector. See the RWA platforms CryptoWatchdog trusts — and how to buy real-world assets safely.",
    keyword: "tokenized real world assets",
    mood: "approve",
    accent: "#f5a623",
    heroPrompt:
      "a glowing golden bar of tokenized gold dissolving into blockchain data and floating coins inside a dark futuristic vault, deep gold and teal volumetric light, cinematic, ultra detailed",
    heroSeed: 71,
    intro:
      "Real-world asset (RWA) tokenization is the bridge between traditional finance and crypto — and one of the biggest narratives heading into the bull run, with tens of billions already on-chain. It lets you own a slice of **gold, US Treasuries or property** as a blockchain token.\n\nThe upside is real, but so is the risk: a token is only as good as the asset and issuer behind it. Below are the tokenization platforms we trust, the ones that need caution, and the guides to read first — starting with our [tokenized gold guide](/blog/digital-gold-2026-tokenized-gold-physically-backed-tokens-guide).",
    trusted: ["pax-gold", "ondo-finance", "kinesis-money", "aurum-foundation", "tether-gold"],
    caution: ["realt"],
    avoid: [],
    warnings: [],
    relatedPosts: ["digital-gold-2026-tokenized-gold-physically-backed-tokens-guide", "rwa-tokenization-explained-like-youre-five", "non-custodial-smart-contract-trading-explained"],
    faq: [
      { q: "What are tokenized real-world assets?", a: "They're blockchain tokens that represent ownership of a physical or traditional asset — gold, US Treasuries, real estate, or credit. The token moves on-chain while the underlying asset is held off-chain by an issuer or custodian." },
      { q: "Is tokenized gold actually backed by gold?", a: "With reputable issuers, yes — each token is redeemable for or backed by allocated physical gold, with regular attestations. The key is checking who the issuer is and whether reserves are independently verified." },
      { q: "What's the main risk with RWAs?", a: "Issuer and custody risk. If the company holding the real asset fails or isn't honest, the token can de-peg from the asset's value. Regulation, transparency and audits matter more here than headline yield." },
    ],
  },
  {
    slug: "nft-marketplaces",
    eyebrow: "NFT & Gaming",
    title: "Best NFT Marketplaces 2026: Where to Buy & Sell Safely",
    metaTitle: "Best NFT Marketplaces 2026 (Safe vs Risky)",
    metaDescription:
      "NFT marketplaces are where collectors trade — and where wallet-drainer scams thrive. See which NFT platforms CryptoWatchdog rates, plus how to avoid fake mints and drainers.",
    keyword: "best nft marketplaces",
    mood: "scan",
    accent: "#8b5cf6",
    heroPrompt:
      "a futuristic neon NFT gallery with floating glowing digital art frames and a robotic collector, electric violet and blue volumetric light, dark cinematic background, ultra detailed",
    heroSeed: 72,
    intro:
      "NFT marketplaces are how you buy, sell and mint digital collectibles and in-game items — but they're also a top hunting ground for **wallet-drainer scams**, fake mints and malicious approvals. The marketplace itself can be fine while the links and offers around it are not.\n\nHere's how the major NFT platforms compare, plus the safety guide every collector should read: [our NFT safety guide](/blog/nft-safety-guide-2026).",
    trusted: [],
    caution: ["opensea", "magic-eden", "blur", "rarible"],
    avoid: ["axie-infinity"],
    warnings: ["fake-airdrop-wallet-drainer"],
    relatedPosts: ["nft-safety-guide-2026", "how-to-spot-crypto-scam-2026"],
    faq: [
      { q: "Which NFT marketplace is safest?", a: "The big marketplaces (OpenSea, Magic Eden, Blur, Rarible) are established but each carries risk — mostly from scams that happen around them, not the platform itself. We rate them caution-level: usable with care, never on autopilot." },
      { q: "How do NFT scams usually work?", a: "Fake mint sites, lookalike collections, and 'free NFT' airdrops that prompt a malicious wallet approval which drains your assets. Never sign a transaction you don't understand, and revoke old approvals regularly." },
      { q: "Are NFT games a good investment?", a: "Be very cautious. Many play-to-earn economies (like Axie at its peak) relied on new players funding rewards — when growth stalls, token values can collapse. Treat them as high-risk, not income." },
    ],
  },
  {
    slug: "crypto-cards",
    eyebrow: "Crypto Cards",
    title: "Best Crypto Cards 2026: Spend Crypto & Earn Cashback",
    metaTitle: "Best Crypto Debit Cards 2026 (Cashback & Fees)",
    metaDescription:
      "Crypto debit cards let you spend Bitcoin and stablecoins anywhere and earn cashback. See which crypto cards CryptoWatchdog rates on fees, rewards, custody and safety.",
    keyword: "best crypto cards",
    mood: "approve",
    accent: "#2bb3ff",
    heroPrompt:
      "a sleek glowing crypto debit card floating above a dark surface with bitcoin and ethereum symbols and neon payment waves, electric blue volumetric light, cinematic, ultra detailed",
    heroSeed: 73,
    intro:
      "Crypto cards let you spend crypto (or crypto-backed credit) anywhere that takes Visa or Mastercard — often with cashback. The catch: headline rewards usually come with **staking, lock-ups, subscriptions or token exposure**, and conversion spreads can quietly eat your returns.\n\nHere's how the main cards stack up on fees, rewards, custody and country support. Read the fine print before you lock anything up.",
    trusted: ["coinbase-card", "tangem-pay"],
    caution: ["crypto-com-visa-card", "nexo-card", "oobit"],
    avoid: [],
    warnings: [],
    relatedPosts: ["oobit-review-pay-with-crypto-10-percent-cashback-2026", "tangem-pay-decentralized-debit-card-review-2026", "trustcard-decentralized-debit-card-review-2026"],
    faq: [
      { q: "Do crypto cards really pay cashback?", a: "Yes, but the best rates usually require staking or locking the platform's own token, or a paid tier. Always work out the real return after fees and spreads — and factor in the risk of the token you have to hold." },
      { q: "Are crypto debit cards safe?", a: "Cards from regulated, established providers are reasonably safe for everyday spending. Watch custody (who holds your funds), conversion fees, and whether high rewards depend on locking up volatile tokens." },
      { q: "Debit or credit crypto card?", a: "Debit cards spend your own balance (lower risk). Crypto-backed credit cards let you borrow against holdings — convenient, but they add liquidation and platform risk if the market moves against you." },
    ],
  },
  {
    slug: "blockchains",
    eyebrow: "Blockchains",
    title: "Crypto Blockchains 2026: Layer 1 & Layer 2 Networks Rated",
    metaTitle: "Crypto Blockchains 2026: L1 & L2 Networks Rated",
    metaDescription:
      "Bitcoin, Ethereum, Solana, Arbitrum and more — CryptoWatchdog rates the major Layer 1 and Layer 2 blockchains on security, decentralisation and track record.",
    keyword: "crypto blockchains rated",
    mood: "scan",
    accent: "#4F8BFF",
    heroPrompt:
      "a glowing network of interconnected blockchain nodes and chains forming a globe, electric blue and teal volumetric light, dark futuristic background, cinematic, ultra detailed",
    heroSeed: 74,
    intro:
      "The blockchain (or 'chain') a project runs on shapes its security, speed and cost. Layer 1s like Bitcoin and Ethereum are the base layers; Layer 2s like Arbitrum and Optimism scale them. Not all chains are equally battle-tested.\n\nHere's our read on the major networks by security, decentralisation and track record. New here? Start with [self-custody vs custodial wallets](/blog/self-custody-vs-custodial-wallets-2026).",
    trusted: ["bitcoin", "ethereum", "arbitrum", "optimism"],
    caution: ["solana"],
    avoid: [],
    warnings: [],
    relatedPosts: ["self-custody-vs-custodial-wallets-2026", "understanding-trust-scores"],
    faq: [
      { q: "What's the difference between Layer 1 and Layer 2?", a: "A Layer 1 (Bitcoin, Ethereum, Solana) is a base blockchain that settles transactions itself. A Layer 2 (Arbitrum, Optimism) runs on top of a Layer 1 to make transactions faster and cheaper while inheriting much of its security." },
      { q: "Which blockchain is the most secure?", a: "Bitcoin and Ethereum have the longest track records and the most decentralisation, which is why they score highest with us. Newer or faster chains often trade some security or decentralisation for speed." },
      { q: "Does the chain affect my safety?", a: "Yes — congested or less-tested chains can mean failed transactions, higher bridge risk, and more scam tokens. The chain doesn't replace your own due diligence on the specific project." },
    ],
  },
  {
    slug: "crypto-staking",
    eyebrow: "Staking",
    title: "Crypto Staking 2026: Earn Yield Without Getting Burned",
    metaTitle: "Best Crypto Staking 2026 (Safe Yield)",
    metaDescription:
      "Staking can earn real yield on your crypto — or lock it in a risky protocol. See which staking platforms CryptoWatchdog trusts and how to stake safely in 2026.",
    keyword: "crypto staking",
    mood: "approve",
    accent: "#16C784",
    heroPrompt:
      "glowing crypto coins growing on a digital tree of light inside a dark futuristic vault, emerald and teal volumetric light, cinematic, ultra detailed",
    heroSeed: 75,
    intro:
      "Staking lets you earn a yield by helping secure a proof-of-stake network — genuine, sustainable yield when it comes from real network rewards. The risks are lock-up periods, slashing, and (with liquid staking) smart-contract and de-peg risk.\n\nBelow are the staking platforms we rate. You can also stake directly on several [trusted exchanges](/crypto-exchanges). Learn the difference between real and fake yield in our [real yield vs ponzi yield guide](/blog/defi-lending-real-yield-vs-ponzi-yield-2026).",
    trusted: ["rocket-pool"],
    caution: ["lido-finance"],
    avoid: [],
    warnings: [],
    relatedPosts: ["defi-lending-real-yield-vs-ponzi-yield-2026", "understanding-trust-scores"],
    faq: [
      { q: "Is crypto staking safe?", a: "Staking on established networks and reputable platforms is relatively low-risk, but it isn't risk-free: your funds may be locked, the token price can fall, and liquid-staking tokens carry smart-contract and de-peg risk." },
      { q: "What yield is realistic?", a: "Real staking yields are typically modest single digits, depending on the network. If a 'staking' product promises fixed double-digit returns, treat it as a major red flag — that's often ponzi yield, not staking." },
      { q: "Solo staking, liquid staking or exchange staking?", a: "Solo staking is the most self-sovereign but technical. Liquid staking (e.g. Rocket Pool, Lido) keeps your stake liquid via a token. Exchange staking is easiest but means trusting the exchange with custody." },
    ],
  },
  {
    slug: "cloud-mining",
    eyebrow: "Cloud Mining",
    title: "Cloud Mining 2026: Legit Services vs Outright Scams",
    metaTitle: "Cloud Mining 2026: Legit or Scam? (Rated)",
    metaDescription:
      "Cloud mining promises passive Bitcoin income — but the sector is riddled with Ponzi schemes. See which mining services CryptoWatchdog rates and which to avoid in 2026.",
    keyword: "cloud mining legit",
    mood: "caution",
    accent: "#F5A524",
    heroPrompt:
      "rows of glowing crypto mining rigs in a dark data centre with bitcoin symbols and warning amber light, cinematic, ultra detailed",
    heroSeed: 76,
    intro:
      "Cloud mining lets you rent mining power instead of buying hardware — in theory, passive crypto income. In practice, it's **one of the most scam-dense corners of crypto**: guaranteed-return 'mining' sites are very often Ponzi schemes that pay early users with new deposits until they vanish.\n\nWe rate the few credible services and call out the rest. If a platform guarantees daily profits, that's the tell — read [how to spot a crypto scam](/blog/how-to-spot-crypto-scam-2026).",
    trusted: [],
    caution: ["nicehash"],
    avoid: ["cryptomine-pro"],
    warnings: ["cryptomine-pro-scam-warning"],
    relatedPosts: ["how-to-spot-crypto-scam-2026", "understanding-trust-scores"],
    faq: [
      { q: "Is cloud mining legit?", a: "A small number of services are genuine, but the category is dominated by scams. Any cloud-mining site promising fixed or guaranteed daily returns should be treated as a Ponzi until proven otherwise." },
      { q: "Why is cloud mining so scam-prone?", a: "It's the perfect cover story: 'mining' explains where the returns supposedly come from, so operators can run a deposit-driven Ponzi while looking technical. Real mining returns are variable and rarely impressive after fees." },
      { q: "What's safer than cloud mining?", a: "If you want exposure to mining economics without the scam risk, regulated mining stocks or simply buying and self-custodying the coin are usually safer than handing money to an anonymous 'mining' platform." },
    ],
  },
  {
    slug: "crypto-recovery",
    eyebrow: "Recovery Scams",
    title: "Crypto Recovery Services 2026: Almost All Are Scams",
    metaTitle: "Crypto Recovery Services: Scam Warning (2026)",
    metaDescription:
      "Been scammed and searching for crypto recovery? Read this first. The overwhelming majority of 'crypto recovery' services are second scams. Here's how to spot them.",
    keyword: "crypto recovery service scam",
    mood: "alert",
    accent: "#F23F52",
    heroPrompt:
      "a warning scene of a glowing red shield blocking a phishing hook reaching for bitcoin coins, dark dramatic red and teal light, cinematic, ultra detailed",
    heroSeed: 77,
    intro:
      "If you've lost crypto and you're looking for someone to 'recover' it, please read this before you pay anyone. The hard truth: the **vast majority of crypto recovery services are themselves scams** — fake firms that target victims a second time, demanding upfront fees and then disappearing.\n\nNo legitimate service can guarantee recovery, and real authorities never charge you to investigate. Here's how to protect yourself, and the honest steps that actually help in our [post-scam damage-control guide](/blog/crypto-scammed-your-step-by-step-guide-to-damage-control-2026-04-24).",
    trusted: [],
    caution: [],
    avoid: ["crypto-recovery-pro"],
    warnings: ["recovery-scam-wave-2026", "recovery-scam-targeting-victims"],
    relatedPosts: ["crypto-scammed-your-step-by-step-guide-to-damage-control-2026-04-24", "how-to-spot-crypto-scam-2026"],
    faq: [
      { q: "Can stolen crypto really be recovered?", a: "Occasionally, and only through legitimate law enforcement, your bank, or the exchange involved — never through a service that cold-contacts you or guarantees results for an upfront fee. On-chain tracing is not the same as recovery." },
      { q: "How do recovery scams work?", a: "They find victims (often from public complaints), pose as 'recovery experts', hackers or even officials, and charge fees, 'taxes' or 'deposits' to release your funds. It's a classic advance-fee scam aimed at people already hurting." },
      { q: "What should I actually do after a scam?", a: "Stop all further payments, secure your accounts and seed phrase, document everything, and report to your national fraud body (e.g. Action Fraud in the UK), the FCA and the platform. Never pay anyone who promises guaranteed recovery." },
    ],
  },
];

export const getHub = (slug?: string): Hub | null =>
  hubs.find((h) => h.slug === slug) ?? null;
