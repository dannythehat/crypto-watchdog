import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, Bot, Users, Building2, ShieldCheck, Eye, Scale, Wallet, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import AuroraBackdrop from "@/components/AuroraBackdrop";
import WatchdogMascot from "@/components/WatchdogMascot";
import { getHub } from "@/content/hubs";
import { getReview, getBlogPost } from "@/content";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

// Sub-categories of Crypto Trading. Each is its own final platform page.
const SUBS: { slug: string; label: string; blurb: string; icon: typeof Bot; accent: string; image?: string }[] = [
  { slug: "ai-trading-bots", label: "AI Trading Bots", blurb: "Bots that claim to adapt to the market — a few genuine, many AI-washed scams. Rated on evidence.", icon: BrainCircuit, accent: "#4F8BFF", image: "/ai-trading-bots/hero.png" },
  { slug: "trading-bots", label: "Trading Bots", blurb: "Rule-based automation — grid, DCA, rebalancing. Transparent tools you stay in control of.", icon: Bot, accent: "#F5A524", image: "/trading-bots/hero.png" },
  { slug: "copy-trading", label: "Copy Trading", blurb: "Mirror proven traders automatically — the safe way, without the fake gurus.", icon: Users, accent: "#F5A524", image: "/copy-trading/hero.png" },
  { slug: "crypto-exchanges", label: "Exchanges", blurb: "Where you buy, sell and trade yourself — and where we test withdrawals for real.", icon: Building2, accent: "#16C784", image: "/crypto-exchanges/hero.png" },
];

const hubCount = (slug: string): number => {
  const h = getHub(slug);
  if (!h) return 0;
  const set = new Set(h.groups ? h.groups.flatMap((g) => g.slugs) : [...h.trusted, ...h.caution, ...h.avoid]);
  return [...set].filter(getReview).length;
};

const HOW = [
  { icon: Users, title: "Copy a trader", desc: "Mirror an experienced trader's positions automatically. Their record matters more than one hot month — and leverage copies across too." },
  { icon: Bot, title: "Run a bot", desc: "Automate a fixed strategy (grid, DCA) through trade-only API keys on your own exchange. You keep custody; the bot just executes." },
  { icon: BrainCircuit, title: "Use AI", desc: "Adaptive models that adjust to the market. Powerful when real and self-custody — and the favourite costume of high-yield scams when not." },
];

const FAQS = [
  { q: "What counts as 'crypto trading' here?", a: "The hands-off ways to trade: copy trading, rule-based bots, AI bots, and the exchanges you trade on yourself. Pick the sub-category that fits how involved you want to be." },
  { q: "What's the difference between a trading bot and an AI trading bot?", a: "A rule-based bot does exactly what you set (grid, DCA). An AI bot claims to adapt using models. Both are only as safe as their custody, transparency and verifiable results — the label matters less than those three." },
  { q: "What's the universal red flag?", a: "Any platform that holds your funds and guarantees a fixed daily return. Real tools let you keep custody and never promise the impossible." },
  { q: "How do you rate trading platforms?", a: "Real team, custody you can verify, withdrawals that clear, transparent fees, and no guaranteed-return claims. See our methodology for the full checklist." },
];

const CryptoTrading = () => {
  const guides = ["aurum-neyro-bot-review-is-aurum-a-scam", "ai-trading-bots-and-agents-2026-honest-guide", "what-is-copy-crypto-trading-your-2026-guide", "copy-ai-trading-explained-2026", "non-custodial-ai-trading-bots-explained", "crypto-trading-bot-audit-step-by-step-guide", "the-hidden-costs-of-crypto-leverage-for-beginners-more-than-just-margin-calls-2026-04-18", "ai-trading-bots-your-guide-to-separating-genuine-tools-from-get-rich-quick-scams-2026-05-25", "are-telegram-trading-bots-safe-a-crypto-watchdog-investigation-2026-05-09", "crypto-trading-bot-risks-safer-trading"]
    .map(getBlogPost).filter(Boolean).slice(0, 13) as NonNullable<ReturnType<typeof getBlogPost>>[];

  return (
    <>
      <Seo
        title="Crypto Trading 2026: Bots, AI & Copy Trading — Rated"
        description="Your map to hands-off crypto trading: AI trading bots, rule-based bots, copy trading and the exchanges you trade on. What each is, how it works, and which platforms we trust."
        path="/crypto-trading"
        type="website"
        jsonLd={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "AI Finance", path: "/ai-finance" }, { name: "Crypto Trading", path: "/crypto-trading" }]), faqJsonLd(FAQS) || {}]}
      />
      <Navbar />
      <main>
        <section className="relative overflow-hidden">
          <AuroraBackdrop accent="#F5A524" variant="hero" imageSeed={36} />
          <SectionWrapper className="pb-12 pt-32 md:pt-40">
            <div className="grid items-center gap-8 md:grid-cols-5">
              <div className="md:col-span-3">
                <Link to="/ai-finance" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary hover:underline">AI Finance</Link>
                <h1 className="mt-2 font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">Crypto trading, mapped and rated</h1>
                <p className="mt-5 max-w-xl text-lg text-muted-foreground">Trading without staring at charts all day comes in a few flavours — <strong className="text-primary">AI bots, rule-based bots, copy trading, and the exchanges you trade on yourself.</strong> Pick your style; we'll show you who to trust.</p>
                <div className="mt-7 flex flex-wrap gap-3 text-sm">
                  <a href="#subs" className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 font-semibold text-primary">{SUBS.length} ways to trade</a>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rating-green/15 px-3 py-1.5 font-semibold text-rating-green"><ShieldCheck className="h-4 w-4" />Evidence-led ratings</span>
                </div>
                <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>Reviewed by the <span className="font-semibold text-foreground">Crypto Watchdog</span> team</span>
                  <span aria-hidden>·</span><span>Updated June 2026</span>
                  <span aria-hidden>·</span><Link to="/methodology" className="font-medium text-primary hover:underline">Our methodology</Link>
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="relative overflow-hidden rounded-2xl border border-primary/30 shadow-2xl ring-1 ring-white/10">
                  <img src="/crypto-trading/hero.png" alt="Crypto trading — AI bots, trading bots, copy trading and exchanges" className="w-full" loading="eager" />
                </div>
                <div className="cw-float mx-auto mt-5 hidden w-28 lg:block"><WatchdogMascot mood="caution" title="CryptoWatchdog — Crypto Trading" /></div>
              </div>
            </div>
          </SectionWrapper>
        </section>

        <SectionWrapper className="border-y border-border bg-card/40 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold md:text-3xl">The ways to trade crypto, hands-off</h2>
            <p className="mt-4 leading-relaxed text-foreground/80"><strong className="text-primary">Most people don't have time to day-trade — so they let something else do it.</strong> You can copy a proven trader, run an automated bot, hand the wheel to an AI strategy, or just trade yourself on an exchange. Same goal, very different risk profiles.</p>
            <p className="mt-4 leading-relaxed text-foreground/80">The upside is real and so is the downside: <strong className="text-primary">leverage cuts both ways, past performance is easy to fake, and "guaranteed profit" is always a lie.</strong> Pick the lane that suits you below — each has its own page with the platforms we trust.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
            {HOW.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><s.icon className="h-5 w-5 text-primary" /></div>
                <h3 className="mt-3 font-heading font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper>
          <span id="subs" className="block -translate-y-28" />
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Crypto trading categories</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">Four ways in — each with its own deep-dive page of endorsed, caution and avoid platforms.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SUBS.map((s) => {
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

        <SectionWrapper className="border-y border-border bg-card/40">
          <div className="text-center"><h2 className="font-heading text-2xl font-bold md:text-3xl">How we rate trading platforms</h2><p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Every platform runs through the same evidence-led checklist. <Link to="/methodology" className="font-medium text-primary underline underline-offset-2">See our full methodology</Link>.</p></div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Scale, t: "Who runs it", d: "Real, named team and a verifiable track record — not anonymous gurus." },
              { icon: Wallet, t: "Where the money goes", d: "Custodial vs self-custody. We test deposits and withdrawals for real." },
              { icon: ShieldCheck, t: "Proof, not promises", d: "Verifiable results, and no guaranteed-return claims — ever." },
              { icon: Eye, t: "No paid placement", d: "Scores are earned on evidence, never bought with commission." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><x.icon className="h-5 w-5 text-primary" /></div><h3 className="mt-3 font-heading font-semibold">{x.t}</h3><p className="mt-1.5 text-sm text-muted-foreground">{x.d}</p></div>
            ))}
          </div>
        </SectionWrapper>

        {guides.length > 0 && (
          <SectionWrapper>
            <div className="mb-6 inline-flex items-center gap-2 text-primary"><BookOpen className="h-5 w-5" /><span className="text-sm font-semibold uppercase tracking-wider">Go deeper</span></div>
            <h2 className="font-heading text-2xl font-bold md:text-3xl">Trading guides worth reading first</h2>
            {guides[0] && (
              <Link to={`/blog/${guides[0].slug}`} className="group mt-8 grid overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-2xl md:grid-cols-2">
                {guides[0].image_url && (
                  <div className="aspect-[16/10] w-full overflow-hidden bg-muted md:aspect-auto">
                    <img src={guides[0].image_url} alt={guides[0].title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="flex flex-col justify-center p-6 md:p-8">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">Featured guide</span>
                  <h3 className="mt-3 font-heading text-2xl font-bold leading-tight md:text-3xl">{guides[0].title}</h3>
                  {guides[0].summary && <p className="mt-3 text-muted-foreground">{guides[0].summary.replace(/[#>*_`~|]/g, " ").slice(0, 220)}</p>}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Read the full guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
                </div>
              </Link>
            )}
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {guides.slice(1).map((p) => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
                  {p.image_url && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                      <img src={p.image_url} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    {p.category && <span className="text-xs font-semibold uppercase tracking-wide text-primary">{p.category}</span>}
                    <h3 className="mt-1 font-heading font-semibold leading-snug">{p.title}</h3>
                    {p.summary && <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{p.summary.replace(/[#>*_`~|]/g, " ").slice(0, 140)}</p>}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">Read guide <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </SectionWrapper>
        )}

        <SectionWrapper className="border-y border-border bg-card/40">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-3xl font-bold">Frequently asked questions</h2>
            <div className="mt-6 space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="group rounded-xl border border-border bg-card/60 p-5 backdrop-blur">
                  <summary className="cursor-pointer list-none font-heading font-semibold marker:content-none"><span className="flex items-center justify-between gap-3">{f.q}<span className="text-primary transition-transform group-open:rotate-45">+</span></span></summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
};

export default CryptoTrading;
