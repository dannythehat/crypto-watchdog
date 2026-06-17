// Latest crypto news — repo-driven so it ships with the build (great for SEO and
// "come back daily"). Refreshed daily from research / the connected crypto-news
// feed. Each item links to its original source and may carry a short "Watchdog
// take" — our safety-first angle on the story.
//
// RULES: real headlines + real source URLs only (never fabricate). Keep the
// watchdog take factual and non-promotional.

export type NewsTag = "Markets" | "Regulation" | "Security" | "Institutional" | "Tokenization";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string; // ISO date
  tag: NewsTag;
  summary: string;
  watchdogTake?: string;
}

export const TAG_TONE: Record<NewsTag, string> = {
  Markets: "text-primary",
  Regulation: "text-rating-green",
  Security: "text-rating-red",
  Institutional: "text-rating-orange",
  Tokenization: "text-primary",
};

export const news: NewsItem[] = [
  {
    id: "btc-eth-june-2026-red",
    title: "Bitcoin and Ether open June in the red as geopolitical tension weighs on risk",
    source: "CoinDesk",
    url: "https://www.coindesk.com/markets/2026/06/01/bitcoin-ether-start-june-in-the-red-while-futures-show-taste-for-risk-xlm-hype-gain",
    publishedAt: "2026-06-01",
    tag: "Markets",
    summary: "BTC and ETH each slipped around 1% to start the month amid US–Iran tensions, even as futures positioning hinted at lingering risk appetite and XLM drew hype.",
    watchdogTake: "Volatility cuts both ways. If a platform is promising you 'fixed daily returns' while the market itself is down, that's a red flag — markets don't pay guaranteed yields.",
  },
  {
    id: "cftc-perp-futures-2026",
    title: "CFTC issues first guidance approving US-regulated crypto perpetual futures",
    source: "Latham & Watkins — US Crypto Policy Tracker",
    url: "https://www.lw.com/en/us-crypto-policy-tracker/regulatory-developments",
    publishedAt: "2026-05-29",
    tag: "Regulation",
    summary: "The CFTC permitted a registered contract market to list a cash-settled Bitcoin perpetual futures contract — pulling previously offshore derivatives under US oversight.",
    watchdogTake: "Perps are powerful and dangerous. Regulation helps, but leverage still liquidates beginners fastest — read our guide on the hidden costs of leverage before touching them.",
  },
  {
    id: "crypto-etfs-2026-tailwinds",
    title: "Crypto ETFs head into a crowded 2026 with regulatory tailwinds",
    source: "The Block",
    url: "https://www.theblock.co/post/383361/crypto-etfs-2026-regulatory-tailwinds-issuers-brace-crowded-year",
    publishedAt: "2026-05-20",
    tag: "Institutional",
    summary: "Issuers are bracing for a packed year of new crypto ETF launches as the regulatory backdrop turns more favourable to spot and multi-asset products.",
  },
  {
    id: "grayscale-2026-market-structure",
    title: "Grayscale: bipartisan crypto market-structure law expected to pass in 2026",
    source: "Grayscale Research",
    url: "https://research.grayscale.com/reports/2026-digital-asset-outlook-dawn-of-the-institutional-era",
    publishedAt: "2026-05-15",
    tag: "Regulation",
    summary: "Grayscale's 2026 outlook anticipates US market-structure legislation becoming law, deepening the link between public blockchains and traditional finance.",
    watchdogTake: "Clearer rules mean more consumer protection — but scammers move fastest in the grey zones. Keep verifying before you trust.",
  },
  {
    id: "us-market-structure-bill-2026",
    title: "US market-structure reform bill could redefine exchanges, ETFs and Bitcoin",
    source: "Bitcoin Foundation",
    url: "https://bitcoinfoundation.org/news/bitcoin/u-s-crypto-market-structure-reform-is-this-the-bill-that-will-redefine-bitcoin-etfs-and-crypto-exchanges-in-2026/",
    publishedAt: "2026-05-10",
    tag: "Regulation",
    summary: "Proposed legislation aims to clarify which regulator oversees which assets and set clearer rules for exchanges, custody and token classification.",
  },
];

export const newsByDateDesc = [...news].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);
