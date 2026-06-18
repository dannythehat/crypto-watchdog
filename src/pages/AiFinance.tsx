import { Link } from "react-router-dom";
import {
  ArrowRight, Bot, Building2, Wallet, Users, Network, Coins, Gem, Image as ImageIcon,
  CreditCard, Boxes, Cpu, BrainCircuit, Database, Cog, ShieldCheck, Eye, Scale, BookOpen,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import AuroraBackdrop from "@/components/AuroraBackdrop";
import WatchdogMascot from "@/components/WatchdogMascot";
import { getHub } from "@/content/hubs";
import { getReview, getBlogPost } from "@/content";
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
  { slug: "cloud-mining", label: "Cloud Mining", blurb: "One of crypto's scam-heaviest corners — tread carefully.", icon: Cpu, accent: "#F5A524", image: "/cloud-mining/hero.png" },
];

// Typical risk per category (our editorial read) — powers the at-a-glance table.
const RISK: Record<string, string> = {
  "ai-trading-platforms": "High",
  "copy-trading": "High",
  "crypto-trading-bots": "High",
  "crypto-exchanges": "Medium",
  "crypto-wallets": "Low",
  "defi-platforms": "High",
  "crypto-staking": "Medium",
  "tokenized-assets": "Medium",
  "nft-marketplaces": "High",
  "crypto-cards": "Low",
  "blockchains": "Low",
  "cloud-mining": "Very high",
};
const riskClass = (r: string) =>
  r === "Low" ? "text-rating-green" : r === "Medium" ? "text-rating-orange" : "text-rating-red";

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

  const totalReviewed = new Set(SECTORS.flatMap((s) => {
    const h = getHub(s.slug);
    return h ? (h.groups ? h.groups.flatMap((g) => g.slugs) : [...h.trusted, ...h.caution, ...h.avoid]) : [];
  })).size;

  const guides = ["what-is-ai-finance-crypto", "how-to-spot-ai-washing-crypto", "non-custodial-ai-trading-bots-explained", "aurum-neyro-bot-review-is-aurum-a-scam", "are-telegram-trading-bots-safe-a-crypto-watchdog-investigation-2026-05-09"]
    .map(getBlogPost).filter(Boolean).slice(0, 3) as NonNullable<ReturnType<typeof getBlogPost>>[];

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
            <p className="mt-4 leading-relaxed text-foreground/80"><strong className="text-primary">AI finance is what happens when artificial intelligence is put in charge of money.</strong> It reads markets, spots patterns and acts faster than any human could. In crypto that means bots trading around the clock, agents managing liquidity in DeFi pools, copy-trading systems that mirror the best performers, and "quant" strategies that used to live behind hedge-fund doors — now running from a phone.</p>
            <p className="mt-4 leading-relaxed text-foreground/80">The promise is simple: <strong className="text-primary">let software handle the watching, the maths and the discipline</strong> — the three things people are worst at when their own money is on the line. Done well, it strips emotion and reaction time out of the equation. Done badly, or dishonestly, it's the oldest scam in crypto with a chatbot bolted on the front.</p>
            <p className="mt-4 leading-relaxed text-foreground/80">Which is which? It always comes down to the same three questions: <strong className="text-primary">who controls the money, whether the returns are real, and whether you can actually get your funds back out.</strong> That's exactly what we test — platform by platform.</p>
          </div>

          <h3 className="mx-auto mt-10 max-w-4xl font-heading text-lg font-bold">How it works, in three layers</h3>
          <div className="mx-auto mt-4 grid max-w-4xl gap-5 md:grid-cols-3">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><s.icon className="h-5 w-5 text-primary" /></div>
                <h3 className="mt-3 font-heading font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-primary/20 bg-primary/[0.06] p-6">
            <h3 className="font-heading text-lg font-bold">Why it's changing the game</h3>
            <p className="mt-2 leading-relaxed text-foreground/80">Three shifts are making AI finance impossible to ignore — each with a matching risk, which is the whole reason this hub exists:</p>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li><strong className="text-primary">Access.</strong> Strategies once reserved for institutions now run from your pocket — but "institutional-grade" is also the favourite phrase of every fake fund.</li>
              <li><strong className="text-primary">Speed.</strong> An AI agent reacts to a market move in milliseconds, not minutes — though faster execution can amplify losses just as easily as gains.</li>
              <li><strong className="text-primary">Self-custody.</strong> The best new tools trade your wallet without ever holding your funds — but only if the smart contract really is scoped the way they claim.</li>
            </ul>
          </div>
        </SectionWrapper>

        {/* Explore by sector */}
        <SectionWrapper>
          <span id="sectors" className="block -translate-y-28" />
          <h2 className="font-heading text-2xl font-bold md:text-3xl">The key categories in AI finance</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">AI finance isn't one thing — it's a family of categories, each with its own platforms, returns and red flags. Here's the map: a quick read on each, then <strong className="text-foreground">tap through for the full breakdown</strong> and our rated platforms.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECTORS.map((s) => {
              const count = hubCount(s.slug);
              return (
                <Link key={s.slug} to={`/${s.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl">
                  {s.image ? (
                    <div className="overflow-hidden border-b border-border/60">
                      <img src={s.image} alt={s.label} loading="lazy" className="block w-full transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden border-b border-border/60" style={{ background: `linear-gradient(135deg, ${s.accent}26, transparent)` }}>
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

        {/* At a glance — comparison table */}
        <SectionWrapper className="border-y border-border bg-card/40">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">AI finance categories at a glance</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">A quick comparison of every category — what it is, how risky it tends to be, and where to dig in. <span className="md:hidden">Swipe the table sideways →</span></p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card/60 backdrop-blur-md">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-primary/10 to-transparent text-left">
                  {["Category", "What it is", "Typical risk", "Reviewed", ""].map((h) => <th key={h} className="px-4 py-3 font-heading font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {SECTORS.map((s, i) => {
                  const risk = RISK[s.slug] || "Medium";
                  return (
                    <tr key={s.slug} className={`border-t border-border/60 transition-colors hover:bg-foreground/5 ${i % 2 ? "bg-foreground/[0.015]" : ""}`}>
                      <td className="px-4 py-3"><Link to={`/${s.slug}`} className="font-semibold hover:text-primary">{s.label}</Link></td>
                      <td className="px-4 py-3 text-muted-foreground">{s.blurb}</td>
                      <td className={`px-4 py-3 font-semibold ${riskClass(risk)}`}>{risk}</td>
                      <td className="px-4 py-3 text-muted-foreground">{hubCount(s.slug) || "—"}</td>
                      <td className="px-4 py-3"><Link to={`/${s.slug}`} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">Explore <ArrowRight className="h-3.5 w-3.5" /></Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionWrapper>

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

        {/* Related guides */}
        {guides.length > 0 && (
          <SectionWrapper>
            <div className="mb-6 inline-flex items-center gap-2 text-primary"><BookOpen className="h-5 w-5" /><span className="text-sm font-semibold uppercase tracking-wider">Go deeper</span></div>
            <h2 className="font-heading text-2xl font-bold md:text-3xl">AI finance guides worth reading first</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {guides.map((p) => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="group flex flex-col rounded-2xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
                  {p.category && <span className="text-xs font-semibold uppercase tracking-wide text-primary">{p.category}</span>}
                  <h3 className="mt-1 font-heading font-semibold leading-snug">{p.title}</h3>
                  {p.summary && <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{p.summary.replace(/[#>*_`~|]/g, " ").slice(0, 140)}</p>}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">Read guide <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                </Link>
              ))}
            </div>
          </SectionWrapper>
        )}
      </main>
      <Footer />
    </>
  );
};

export default AiFinance;
