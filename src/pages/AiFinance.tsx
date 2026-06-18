import { Link } from "react-router-dom";
import {
  ArrowRight, Bot, Building2, Wallet, Users, Network, Coins, Gem, Image as ImageIcon,
  CreditCard, Boxes, Cpu, LifeBuoy, BrainCircuit, Database, Cog, ShieldCheck, Star, ExternalLink, Eye, Scale,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import AuroraBackdrop from "@/components/AuroraBackdrop";
import WatchdogMascot from "@/components/WatchdogMascot";
import PlatformCard from "@/components/PlatformCard";
import RatingBadge from "@/components/RatingBadge";
import { getHub } from "@/content/hubs";
import { getReview, getAffiliateByReviewSlug, isMonetisable } from "@/content";
import { trackEvent } from "@/lib/analytics";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

// Sectors that branch off AI / crypto finance. Each tile links to its hub and
// uses its own artwork (falls back to an icon until an image is supplied).
const SECTORS: { slug: string; label: string; blurb: string; icon: typeof Bot; accent: string; image?: string }[] = [
  { slug: "ai-trading-platforms", label: "AI Trading Platforms", blurb: "AI agents and bots that trade or manage liquidity for you.", icon: BrainCircuit, accent: "#4F8BFF", image: "/ai-finance/hero.png" },
  { slug: "copy-trading", label: "Copy Trading", blurb: "Mirror proven traders automatically — the safe way.", icon: Users, accent: "#F5A524", image: "/copy-trading/hero.png" },
  { slug: "crypto-trading-bots", label: "Trading Bots", blurb: "Automated strategies you stay in control of.", icon: Bot, accent: "#4F8BFF" },
  { slug: "crypto-exchanges", label: "Exchanges", blurb: "Where you buy, sell and trade — and where withdrawals get tested.", icon: Building2, accent: "#16C784", image: "/crypto-exchanges/hero.png" },
  { slug: "crypto-wallets", label: "Wallets", blurb: "Self-custody and hot wallets we actually trust.", icon: Wallet, accent: "#16C784", image: "/crypto-wallets/hero.png" },
  { slug: "defi-platforms", label: "DeFi Platforms", blurb: "Real yield vs Ponzi yield — protocols rated on evidence.", icon: Network, accent: "#4F8BFF" },
  { slug: "crypto-staking", label: "Staking", blurb: "Earn genuine network rewards without the traps.", icon: Coins, accent: "#16C784" },
  { slug: "tokenized-assets", label: "Tokenized Assets (RWA)", blurb: "Gold, treasuries and property, on-chain.", icon: Gem, accent: "#A78BFA", image: "/tokenized-assets/hero.png" },
  { slug: "nft-marketplaces", label: "NFT Marketplaces", blurb: "Where to mint and trade — minus the drainers.", icon: ImageIcon, accent: "#A78BFA", image: "/nft-marketplaces/hero.png" },
  { slug: "crypto-cards", label: "Crypto Cards", blurb: "Spend crypto in the real world, cashback and all.", icon: CreditCard, accent: "#16C784" },
  { slug: "blockchains", label: "Blockchains", blurb: "The base layers, rated by security and track record.", icon: Boxes, accent: "#4F8BFF" },
  { slug: "cloud-mining", label: "Cloud Mining", blurb: "One of crypto's scam-heaviest corners — tread carefully.", icon: Cpu, accent: "#F5A524" },
];

const hubCount = (slug: string): number => {
  const h = getHub(slug);
  if (!h) return 0;
  const set = new Set(h.groups ? h.groups.flatMap((g) => g.slugs) : [...h.trusted, ...h.caution, ...h.avoid]);
  return [...set].filter(getReview).length;
};

const TrustRing = ({ score }: { score: number }) => {
  const r = 24, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(100, score));
  const hex = score >= 75 ? "#16C784" : score >= 50 ? "#F5A524" : "#F23F52";
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 56 56" className="h-16 w-16 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={hex} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-heading text-base font-bold text-foreground">{score}</span>
        <span className="text-[8px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
};

const HOW_IT_WORKS = [
  { icon: Database, title: "1 · Data & signals", desc: "Models read market data, on-chain flows and indicators to decide when to act. The honest ones tell you what the strategy is; the scams hide behind \"secret AI\"." },
  { icon: Cog, title: "2 · Execution", desc: "Trades run through bots, smart contracts or a managed account. The key question is whether your funds stay in your wallet or sit in theirs." },
  { icon: ShieldCheck, title: "3 · Custody & risk", desc: "Self-custody beats \"send us your money\" every time. We test withdrawals, read the audits, and check who controls the keys before we score anything." },
];

const AiFinance = () => {
  const hub = getHub("ai-finance");
  const faqs = hub?.faq ?? [];

  // Company umbrella: top-rated platforms across the AI-finance family.
  const familySlugs = ["ai-trading-platforms", "copy-trading", "crypto-trading-bots", "defi-platforms"];
  const seen = new Set<string>();
  const family = familySlugs.flatMap((s) => {
    const h = getHub(s);
    return h ? [...h.trusted, ...h.caution] : [];
  });
  const topPlatforms = family
    .filter((slug) => { if (seen.has(slug)) return false; seen.add(slug); return !!getReview(slug); })
    .map((slug) => getReview(slug)!)
    .sort((a, b) => (b.trust_score ?? 0) - (a.trust_score ?? 0));
  const featured = topPlatforms.find((r) => r.rating === "green") ?? topPlatforms[0] ?? null;
  const featuredAff = featured ? getAffiliateByReviewSlug(featured.slug) : null;
  const rest = topPlatforms.filter((r) => r.slug !== featured?.slug).slice(0, 6);

  const totalReviewed = new Set(SECTORS.flatMap((s) => {
    const h = getHub(s.slug);
    return h ? (h.groups ? h.groups.flatMap((g) => g.slugs) : [...h.trusted, ...h.caution, ...h.avoid]) : [];
  })).size;

  return (
    <>
      <Seo
        title="AI Crypto Finance 2026: Trading, Bots, DeFi & More — Rated"
        description="Your map to AI-powered crypto finance: what it is, how it works, and which platforms we trust. Explore every sector — AI trading, copy trading, exchanges, wallets, DeFi and more — with evidence-led reviews and trust scores."
        path="/ai-finance"
        type="website"
        jsonLd={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "AI Finance", path: "/ai-finance" }]),
          faqJsonLd(faqs.map((f) => ({ q: f.q, a: f.a }))) || {},
        ]}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <AuroraBackdrop accent="#4F8BFF" variant="hero" imagePrompt={hub?.heroPrompt} imageSeed={hub?.heroSeed} />
          <SectionWrapper className="pb-12 pt-32 md:pt-40">
            <div className="grid items-center gap-8 md:grid-cols-5">
              <div className="md:col-span-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">The AI Finance hub</span>
                <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">AI Crypto Finance, mapped and rated</h1>
                <p className="mt-5 max-w-xl text-lg text-muted-foreground">"AI finance" covers a huge spread — trading bots, copy trading, exchanges, DeFi, wallets and more. This is your map to all of it: <strong className="text-primary">what each sector is, how it works, and which platforms we actually trust.</strong></p>
                <div className="mt-7 flex flex-wrap gap-3 text-sm">
                  <a href="#sectors" className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 font-semibold text-primary"><Boxes className="h-4 w-4" />{SECTORS.length} sectors</a>
                  <a href="#platforms" className="inline-flex items-center gap-1.5 rounded-full bg-rating-green/15 px-3 py-1.5 font-semibold text-rating-green"><ShieldCheck className="h-4 w-4" />{totalReviewed}+ platforms rated</a>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="relative overflow-hidden rounded-2xl border border-primary/30 shadow-2xl ring-1 ring-white/10">
                  <img src="/ai-finance/hero.png" alt="AI Finance — smarter decisions: AI-powered insights, risk management, algorithmic trading and portfolio optimization across banking, investments and fintech" className="w-full" loading="eager" />
                </div>
                <div className="cw-float mx-auto mt-5 hidden w-28 lg:block"><WatchdogMascot mood="scan" title="CryptoWatchdog — AI Finance" /></div>
              </div>
            </div>
          </SectionWrapper>
        </section>

        {/* What is AI finance */}
        <SectionWrapper className="border-y border-border bg-card/40 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold md:text-3xl">What is AI crypto finance?</h2>
            <p className="mt-4 leading-relaxed text-foreground/80"><strong className="text-primary">AI finance is where automation meets your money on-chain.</strong> Instead of you watching charts all day, software reads the market and acts — placing trades, copying expert traders, rebalancing a portfolio or managing liquidity in a DeFi pool.</p>
            <p className="mt-4 leading-relaxed text-foreground/80">Used well, it's a genuine edge. Used as a costume, it's the oldest scam in crypto with a chatbot bolted on. The difference always comes down to the same things: <strong className="text-primary">who controls the money, whether the returns are real, and whether you can get your funds back out.</strong> That's exactly what we test.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><s.icon className="h-5 w-5 text-primary" /></div>
                <h3 className="mt-3 font-heading font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* Explore by sector */}
        <SectionWrapper>
          <span id="sectors" className="block -translate-y-28" />
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Explore AI finance by sector</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">Every corner of crypto finance, each with its own deep-dive page — the platforms we endorse, the ones to approach with caution, and the ones to avoid.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECTORS.map((s) => {
              const count = hubCount(s.slug);
              return (
                <Link key={s.slug} to={`/${s.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl">
                  {s.image ? (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={s.image} alt={s.label} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
                    </div>
                  ) : (
                    <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${s.accent}26, transparent)` }}>
                      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl" style={{ background: `${s.accent}40` }} />
                      <s.icon className="relative h-14 w-14" style={{ color: s.accent }} />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-heading text-lg font-bold">{s.label}</h3>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.blurb}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                      <span className="text-xs font-semibold text-muted-foreground">{count > 0 ? `${count} reviewed` : "Guide"}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </SectionWrapper>

        {/* Company umbrella — top-rated platforms */}
        {featured && (
          <SectionWrapper className="border-y border-border bg-card/40">
            <span id="platforms" className="block -translate-y-28" />
            <h2 className="font-heading text-2xl font-bold md:text-3xl">Top-rated AI finance platforms</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">The highest-scoring platforms across AI trading, copy trading, bots and DeFi — each with our full review and trust score.</p>

            {/* Featured */}
            <div className="mt-8 relative overflow-hidden rounded-3xl border border-rating-green/30 bg-gradient-to-br from-rating-green/10 via-card/60 to-card/60 p-6 backdrop-blur-md md:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rating-green/20 blur-3xl" />
              <div className="relative mb-4 inline-flex items-center gap-2 text-rating-green"><Star className="h-5 w-5 fill-rating-green" /><span className="text-sm font-semibold uppercase tracking-wider">Our top pick</span></div>
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-border bg-background/70">
                  {featured.logo_url ? <img src={featured.logo_url} alt={featured.name} className="h-full w-full object-contain p-2" /> : <span className="font-heading text-2xl font-bold text-muted-foreground">{featured.name.charAt(0)}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3"><h3 className="font-heading text-2xl font-bold">{featured.name}</h3>{featured.rating && <RatingBadge rating={featured.rating as "green" | "orange" | "red"} size="md" />}</div>
                  <p className="mt-3 max-w-xl text-muted-foreground">{(featured.summary || "").replace(/[#>*_`~|]/g, " ").slice(0, 180)}…</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link to={`/reviews/${featured.slug}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">Read our {featured.name} review <ArrowRight className="h-4 w-4" /></Link>
                    {isMonetisable(featuredAff) && (
                      <a href={`/go/${featuredAff!.id}`} target="_blank" rel="sponsored noopener noreferrer" onClick={() => trackEvent("affiliate_click", { affiliate_id: featuredAff!.id, placement: "aifinance_featured", review_slug: featured.slug })} className="inline-flex items-center gap-2 rounded-xl bg-rating-green px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Visit {featured.name} <ExternalLink className="h-3.5 w-3.5" /></a>
                    )}
                  </div>
                </div>
                {featured.trust_score != null && <div className="md:pl-4"><TrustRing score={featured.trust_score} /></div>}
              </div>
            </div>

            {rest.length > 0 && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((r) => <PlatformCard key={r.slug} slug={r.slug} variant={r.rating === "green" ? "endorsed" : r.rating === "red" ? "avoid" : "caution"} />)}
              </div>
            )}
          </SectionWrapper>
        )}

        {/* How we rate */}
        <SectionWrapper>
          <div className="text-center"><h2 className="font-heading text-2xl font-bold md:text-3xl">How we rate AI finance platforms</h2><p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Every platform runs through the same evidence-led checklist before it gets a score. <Link to="/methodology" className="font-medium text-primary underline underline-offset-2">See our full methodology</Link>.</p></div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Scale, t: "Who runs it", d: "Real, named team and a verifiable track record — not anonymous founders." },
              { icon: Wallet, t: "Where the money goes", d: "Self-custody vs custodial. We test deposits and withdrawals for real." },
              { icon: ShieldCheck, t: "Proof, not promises", d: "Audits, on-chain evidence and honest performance — no guaranteed returns." },
              { icon: Eye, t: "No paid placement", d: "Scores are earned on evidence, never bought with affiliate commission." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><x.icon className="h-5 w-5 text-primary" /></div><h3 className="mt-3 font-heading font-semibold">{x.t}</h3><p className="mt-1.5 text-sm text-muted-foreground">{x.d}</p></div>
            ))}
          </div>
        </SectionWrapper>

        {/* FAQ */}
        {faqs.length > 0 && (
          <SectionWrapper className="border-y border-border bg-card/40">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-heading text-3xl font-bold">Frequently asked questions</h2>
              <div className="mt-6 space-y-3">
                {faqs.map((f) => (
                  <details key={f.q} className="group rounded-xl border border-border bg-card/60 p-5 backdrop-blur">
                    <summary className="cursor-pointer list-none font-heading font-semibold marker:content-none"><span className="flex items-center justify-between gap-3">{f.q}<span className="text-primary transition-transform group-open:rotate-45">+</span></span></summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </SectionWrapper>
        )}
      </main>
      <Footer />
    </>
  );
};

export default AiFinance;
