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
];

export const getHub = (slug?: string): Hub | null =>
  hubs.find((h) => h.slug === slug) ?? null;
