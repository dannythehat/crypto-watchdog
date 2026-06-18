// Crypto sportsbooks & casinos — listing data for the flagship template page.
// STRUCTURE DEMO: ratings here are PROVISIONAL (full audits in progress). Crypto
// gambling is high-risk by nature (mostly Curaçao-licensed, restricted in many
// countries). We never imply a completed audit we haven't done — cards carry a
// "Provisional" marker until the in-depth review is published.
//
// MONEY MODEL (key design): `offer` and `special` are the *updatable* fields —
// refreshed daily from research (e.g. a timely "US Open free bet"). The
// `affiliateUrl` is the *stable* money link and must NOT change when the offer
// copy changes. If `affiliateUrl` is empty we have no deal yet → the Claim CTA
// falls back to the site (nofollow) and this brand is on the "get-affiliate" list.

export type CasinoKind = "Casino" | "Sportsbook" | "Casino & Sportsbook" | "Poker";

export interface CasinoSpecial { text: string; until?: string }

export interface Casino {
  slug: string;
  name: string;
  domain: string;
  kind: CasinoKind;
  rating: "green" | "orange" | "red";
  trustScore: number;       // provisional 0-100
  established: string;
  license: string;
  coins: string;
  highlight: string;
  offer: string;            // current welcome offer (updatable)
  special?: CasinoSpecial;  // timely promo, e.g. "US Open: £100 free bet" (updatable)
  affiliateUrl?: string;    // STABLE money link; empty = no deal yet
  logo?: string;            // self-hosted brand logo (e.g. /brands/stake.png); falls back to Clearbit
  banner?: string;          // wide affiliate banner (e.g. /brands/stake-banner.jpg); shown on the review page
  accent: string;
  featured?: boolean;
}

export const casinos: Casino[] = [
  { slug: "cloudbet", name: "Cloudbet", domain: "cloudbet.com", kind: "Casino & Sportsbook", rating: "green", trustScore: 84, established: "2013", license: "Curaçao", coins: "35+ coins", highlight: "12-year track record, high limits, no-KYC withdrawals.", offer: "Up to $2,500 in cash rewards (rakeback) over 30 days — any deposit", affiliateUrl: "https://affiliates.cloudbet.com/referral?af_token=5c19df15d41d58328206705e365c8df8", logo: "/brands/cloudbet.jpg", banner: "/brands/cloudbet-banner.png", accent: "#f5a623", featured: true },
  { slug: "stake", name: "Stake", domain: "stake.com", kind: "Casino & Sportsbook", rating: "green", trustScore: 82, established: "2017", license: "Curaçao", coins: "20+ coins", highlight: "One of the largest crypto books; huge sportsbook + originals.", offer: "VIP rakeback & reload rewards", logo: "/brands/stake.jpg", accent: "#00e701" },
  { slug: "bitstarz", name: "BitStarz", domain: "bitstarz.com", kind: "Casino", rating: "green", trustScore: 80, established: "2014", license: "Curaçao", coins: "Crypto + fiat", highlight: "Award-winning hybrid casino famous for fast payouts.", offer: "Welcome package up to 5 BTC + 180 free spins", affiliateUrl: "https://bzstarz2.com/bmw4w3vdi", logo: "/brands/bitstarz.png", banner: "/brands/bitstarz-banner.png", accent: "#2bb3ff" },
  { slug: "sportsbet-io", name: "Sportsbet.io", domain: "sportsbet.io", kind: "Sportsbook", rating: "green", trustScore: 78, established: "2016", license: "Curaçao", coins: "Major coins", highlight: "Sportsbook-first, deep live markets, established group.", offer: "Bet £10, get a £10 free bet", logo: "/brands/sportsbet-io.png", accent: "#ffd400" },
  { slug: "bitcasino-io", name: "Bitcasino.io", domain: "bitcasino.io", kind: "Casino", rating: "orange", trustScore: 74, established: "2014", license: "Curaçao", coins: "Major coins", highlight: "Pioneer crypto casino; large live-dealer lobby.", offer: "Loyalty club + reload bonuses", logo: "/brands/bitcasino-io.jpg", accent: "#e63946" },
  { slug: "bc-game", name: "BC.Game", domain: "bc.game", kind: "Casino & Sportsbook", rating: "orange", trustScore: 64, established: "2017", license: "Curaçao", coins: "50+ coins", highlight: "Community-driven; big bonuses, broad altcoin support.", offer: "Up to 470% deposit bonus", logo: "/brands/bc-game.png", accent: "#f9d100" },
  { slug: "roobet", name: "Roobet", domain: "roobet.com", kind: "Casino", rating: "orange", trustScore: 62, established: "2019", license: "Curaçao", coins: "BTC, ETH, LTC", highlight: "Popular slots-led casino with crash games.", offer: "Daily races + weekly bonuses", logo: "/brands/roobet.png", accent: "#ffb800" },
  { slug: "lucky-block", name: "Lucky Block", domain: "luckyblock.com", kind: "Casino & Sportsbook", rating: "orange", trustScore: 60, established: "2022", license: "Curaçao", coins: "15+ coins", highlight: "Newer all-rounder; casino + sportsbook + bonuses.", offer: "200% up to €25,000 + 50 free spins", logo: "/brands/lucky-block.png", accent: "#00c2a8" },
  { slug: "rollbit", name: "Rollbit", domain: "rollbit.com", kind: "Casino & Sportsbook", rating: "orange", trustScore: 58, established: "2020", license: "Curaçao", coins: "Major coins", highlight: "$RLB token, staking & profit-share; higher risk profile.", offer: "$RLB rewards & rakeback", logo: "/brands/rollbit.jpg", accent: "#7c3aed" },
  { slug: "coinpoker", name: "CoinPoker", domain: "coinpoker.com", kind: "Poker", rating: "green", trustScore: 80, established: "2017", license: "Curaçao", coins: "CHP, USDT, BTC, ETH", highlight: "Crypto-native poker room with its own CHP token, provably-fair RNG and big guaranteed tournaments.", offer: "Rakeback, freerolls & CHP rewards", logo: "/brands/coinpoker.webp", accent: "#ff5a3c" },
];

// True when we have a live affiliate deal for this brand.
export const claimUrl = (c: Casino): string => c.affiliateUrl || `https://${c.domain}`;
export const hasAffiliate = (c: Casino): boolean => !!c.affiliateUrl;

export const getCasino = (slug?: string): Casino | undefined => casinos.find((c) => c.slug === slug);
export const featuredCasino = casinos.find((c) => c.featured) ?? casinos[0];
export const casinosRanked = [...casinos].sort((a, b) => b.trustScore - a.trustScore);
