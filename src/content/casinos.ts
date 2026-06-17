// Crypto sportsbooks & casinos — listing data for the flagship template page.
// STRUCTURE DEMO: ratings here are PROVISIONAL (full audits in progress). Crypto
// gambling is high-risk by nature (mostly Curaçao-licensed, restricted in many
// countries). We never imply a completed audit we haven't done — cards carry a
// "Provisional" marker until the in-depth review is published.

export type CasinoKind = "Casino" | "Sportsbook" | "Casino & Sportsbook";

export interface Casino {
  slug: string;
  name: string;
  domain: string;        // for logo + display
  kind: CasinoKind;
  rating: "green" | "orange" | "red";
  trustScore: number;    // provisional 0-100
  established: string;    // year or "—"
  license: string;
  coins: string;         // e.g. "50+ coins"
  highlight: string;     // one-line hook
  accent: string;        // brand-ish colour for the logo tile
  featured?: boolean;
}

export const casinos: Casino[] = [
  { slug: "cloudbet", name: "Cloudbet", domain: "cloudbet.com", kind: "Casino & Sportsbook", rating: "green", trustScore: 84, established: "2013", license: "Curaçao", coins: "30+ coins", highlight: "12-year track record, high limits, Zero-Margin odds.", accent: "#f5a623", featured: true },
  { slug: "stake", name: "Stake", domain: "stake.com", kind: "Casino & Sportsbook", rating: "green", trustScore: 82, established: "2017", license: "Curaçao", coins: "20+ coins", highlight: "One of the largest crypto books; huge sportsbook + originals.", accent: "#00e701" },
  { slug: "bitstarz", name: "BitStarz", domain: "bitstarz.com", kind: "Casino", rating: "green", trustScore: 80, established: "2014", license: "Curaçao", coins: "Crypto + fiat", highlight: "Long-running hybrid casino with fast payouts.", accent: "#2bb3ff" },
  { slug: "sportsbet-io", name: "Sportsbet.io", domain: "sportsbet.io", kind: "Sportsbook", rating: "green", trustScore: 78, established: "2016", license: "Curaçao", coins: "Major coins", highlight: "Sportsbook-first, deep live markets, established group.", accent: "#ffd400" },
  { slug: "bitcasino-io", name: "Bitcasino.io", domain: "bitcasino.io", kind: "Casino", rating: "orange", trustScore: 74, established: "2014", license: "Curaçao", coins: "Major coins", highlight: "Pioneer crypto casino; large live-dealer lobby.", accent: "#e63946" },
  { slug: "bc-game", name: "BC.Game", domain: "bc.game", kind: "Casino & Sportsbook", rating: "orange", trustScore: 64, established: "2017", license: "Curaçao", coins: "50+ coins", highlight: "Community-driven; big bonuses, broad altcoin support.", accent: "#f9d100" },
  { slug: "roobet", name: "Roobet", domain: "roobet.com", kind: "Casino", rating: "orange", trustScore: 62, established: "2019", license: "Curaçao", coins: "BTC, ETH, LTC", highlight: "Popular slots-led casino with crash games.", accent: "#ffb800" },
  { slug: "lucky-block", name: "Lucky Block", domain: "luckyblock.com", kind: "Casino & Sportsbook", rating: "orange", trustScore: 60, established: "2022", license: "Curaçao", coins: "15+ coins", highlight: "Newer all-rounder; casino + sportsbook + bonuses.", accent: "#00c2a8" },
  { slug: "rollbit", name: "Rollbit", domain: "rollbit.com", kind: "Casino & Sportsbook", rating: "orange", trustScore: 58, established: "2020", license: "Curaçao", coins: "Major coins", highlight: "$RLB token, staking & profit-share; higher risk profile.", accent: "#7c3aed" },
];

export const featuredCasino = casinos.find((c) => c.featured) ?? casinos[0];
export const casinosRanked = [...casinos].sort((a, b) => b.trustScore - a.trustScore);
