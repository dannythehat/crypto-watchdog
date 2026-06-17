// Daily & ongoing offers / freebies. Repo-driven so it can be refreshed every
// day from research and shipped via a normal commit (same model as the rest of
// the content). Offers tied to a reviewSlug auto-resolve to our cloaked /go/
// affiliate link when one exists; otherwise they link to the review.
//
// RULES: never list an offer for a red-rated platform; never promise guaranteed
// returns; always tell people to verify current terms on the provider's site.

export type OfferKind = "bonus" | "discount" | "airdrop" | "freebie" | "cashback";

export interface Offer {
  id: string;
  title: string;
  platform: string;
  reviewSlug?: string;     // resolves to affiliate /go link or /reviews/<slug>
  externalUrl?: string;    // fallback if no review exists
  kind: OfferKind;
  blurb: string;
  addedAt: string;         // ISO date
  expiresAt?: string | null;
  hot?: boolean;
}

export const KIND_META: Record<OfferKind, { label: string; emoji: string; tone: string }> = {
  bonus: { label: "Sign-up bonus", emoji: "🎁", tone: "text-rating-green" },
  discount: { label: "Discount", emoji: "🏷️", tone: "text-primary" },
  airdrop: { label: "Airdrop", emoji: "🪂", tone: "text-rating-orange" },
  freebie: { label: "Freebie", emoji: "✨", tone: "text-primary" },
  cashback: { label: "Cashback", emoji: "💸", tone: "text-rating-green" },
};

// Seeded with honest, non-fabricated entries tied to platforms we endorse.
// Specific dollar amounts are deliberately avoided unless verified — copy points
// users to the live terms. Refreshed from daily research.
export const offers: Offer[] = [
  {
    id: "kraken-welcome",
    title: "New-user welcome offer on Kraken",
    platform: "Kraken",
    reviewSlug: "kraken",
    kind: "bonus",
    blurb: "One of the highest-trust exchanges in our audit (98/100) runs new-user promotions. Check the current welcome terms before you fund your account.",
    addedAt: "2026-06-17",
    hot: true,
  },
  {
    id: "coinbase-earn",
    title: "Coinbase 'Learn & Earn' free crypto",
    platform: "Coinbase",
    reviewSlug: "coinbase",
    kind: "freebie",
    blurb: "Watch short lessons and earn small amounts of crypto for completing quizzes. A genuinely free way to start — no deposit required.",
    addedAt: "2026-06-17",
  },
  {
    id: "ledger-bundle",
    title: "Ledger hardware wallet bundles",
    platform: "Ledger",
    reviewSlug: "ledger-nano-x",
    kind: "discount",
    blurb: "Ledger frequently bundles devices and accessories. If you're moving to cold storage, watch for bundle pricing on the Nano range.",
    addedAt: "2026-06-17",
  },
  {
    id: "trezor-deals",
    title: "Trezor seasonal device deals",
    platform: "Trezor",
    reviewSlug: "trezor",
    kind: "discount",
    blurb: "Open-source cold storage we rate 92/100. Trezor runs periodic discounts on the Model One and Safe range — check current pricing.",
    addedAt: "2026-06-17",
  },
  {
    id: "kinesis-yield",
    title: "Kinesis gold & silver yield",
    platform: "Kinesis Money",
    reviewSlug: "kinesis-money",
    kind: "cashback",
    blurb: "Earn a yield on allocated physical gold and silver you actually own. Read our review first and confirm the current rates on their site.",
    addedAt: "2026-06-17",
  },
  {
    id: "pionex-free-bots",
    title: "Pionex free built-in trading bots",
    platform: "Pionex",
    reviewSlug: "pionex",
    kind: "freebie",
    blurb: "Pionex includes grid and DCA bots at no extra software cost — a legitimate, lower-risk way to automate (you keep custody via your account).",
    addedAt: "2026-06-17",
  },
];

export const offersByDateDesc = [...offers].sort(
  (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
);
