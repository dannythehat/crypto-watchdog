import { Link } from "react-router-dom";
import { ArrowRight, Users, Bot, BrainCircuit, ShieldCheck, Star, ExternalLink, Eye, Scale, Wallet, Gauge, LineChart, Repeat } from "lucide-react";
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

const SECTORS: { slug: string; label: string; blurb: string; icon: typeof Bot; accent: string; image?: string }[] = [
  { slug: "copy-trading", label: "Copy Trading", blurb: "Mirror proven traders automatically — link your account and follow the experts, the safe way.", icon: Users, accent: "#F5A524", image: "/copy-trading/hero.png" },
  { slug: "crypto-trading-bots", label: "Trading Bots", blurb: "Automated strategies that run 24/7 — the transparent tools you stay in control of, not black boxes.", icon: Bot, accent: "#4F8BFF" },
  { slug: "ai-trading-platforms", label: "AI Trading Platforms", blurb: "AI agents and quant models that trade or manage liquidity for you.", icon: BrainCircuit, accent: "#4F8BFF", image: "/ai-finance/hero.png" },
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
  { icon: Repeat, title: "1 · Copy", desc: "Link your account and automatically mirror an experienced trader's positions. Their wins are your wins — and their losses are too, so the trader's risk record matters more than one hot month." },
  { icon: Gauge, title: "2 · Automate", desc: "A bot runs a defined strategy for you, around the clock. Good ones are transparent tools you control; bad ones ask you to deposit into their account and promise fixed profit." },
  { icon: LineChart, title: "3 · AI strategies", desc: "AI agents read the market and execute through bots or smart contracts. The key question is always the same: do your funds stay in your wallet, and are the returns real?" },
];

const FAQS = [
  { q: "Is copy trading or bot trading safe?", a: "It can be — on a regulated platform with transparent, verifiable track records and sensible risk limits. It isn't safe when returns are unverifiable, leverage is high, or you're copying an anonymous trader in a Telegram group. We rate each platform on exactly those points." },
  { q: "Can I lose more than I put in?", a: "With leveraged copy trading or bots, yes — losses can exceed your initial stake. Always check whether a platform uses leverage and what the maximum drawdown could be before you fund it." },
  { q: "What's the difference between a bot and an AI trading platform?", a: "A bot runs a fixed, pre-set strategy. An 'AI' platform claims to adapt using models. Both are only as trustworthy as their transparency, custody model and verifiable results — the label matters far less than those three things." },
  { q: "How do you rate trading platforms?", a: "Real team, custody you can verify, withdrawals that clear, transparent fees, and no guaranteed-return claims. Anything promising fixed daily profit gets an orange or red rating. See our methodology." },
];

const Trading = () => {
  return (
    <>
      <Seo
        title="Crypto Trading 2026: Copy Trading, Bots & AI — Rated"
        description="Your map to crypto trading: copy trading, automated bots and AI strategies — what each is, how it works, and which platforms we trust. Evidence-led reviews and trust scores."
        path="/trading"
        type="website"
        jsonLd={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Trading", path: "/trading" }]), faqJsonLd(FAQS) || {}]}
      />
      <Navbar />
      <main>
        <section className="relative overflow-hidden">
          <AuroraBackdrop accent="#F5A524" variant="hero" imageSeed={34} />
          <SectionWrapper className="pb-12 pt-32 md:pt-40">
            <div className="grid items-center gap-8 md:grid-cols-5">
              <div className="md:col-span-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">The Trading hub</span>
                <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">Crypto trading, mapped and rated</h1>
                <p className="mt-5 max-w-xl text-lg text-muted-foreground">Three ways to trade without staring at charts all day — <strong className="text-primary">copy trading, automated bots and AI strategies.</strong> Here's how each one works, and which platforms we actually trust.</p>
                <div className="mt-7 flex flex-wrap gap-3 text-sm">
                  <a href="#sectors" className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 font-semibold text-primary">{SECTORS.length} ways to trade</a>
                  <a href="#platforms" className="inline-flex items-center gap-1.5 rounded-full bg-rating-green/15 px-3 py-1.5 font-semibold text-rating-green"><ShieldCheck className="h-4 w-4" />Platforms rated</a>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="relative overflow-hidden rounded-2xl border border-primary/30 shadow-2xl ring-1 ring-white/10">
                  <img src="/copy-trading/hero.png" alt="Crypto trading — copy trading, bots and AI strategies" className="w-full" loading="eager" />
                </div>
                <div className="cw-float mx-auto mt-5 hidden w-28 lg:block"><WatchdogMascot mood="caution" title="CryptoWatchdog — Trading" /></div>
              </div>
            </div>
          </SectionWrapper>
        </section>

        <SectionWrapper className="border-y border-border bg-card/40 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold md:text-3xl">What is crypto trading — the hands-off way?</h2>
            <p className="mt-4 leading-relaxed text-foreground/80"><strong className="text-primary">Most people don't have time to day-trade — so they let something else do it.</strong> That's what this hub covers: copying a proven trader, running an automated bot, or handing the wheel to an AI strategy. Same goal, three very different risk profiles.</p>
            <p className="mt-4 leading-relaxed text-foreground/80">The upside is real, and so is the downside. <strong className="text-primary">Leverage cuts both ways, past performance is easy to fake, and "guaranteed profit" is always a lie.</strong> The trick is knowing what you're actually signing up for — which is exactly what we test.</p>
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

        <SectionWrapper>
          <span id="sectors" className="block -translate-y-28" />
          <h2 className="font-heading text-2xl font-bold md:text-3xl">The three ways to trade</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">Pick your style — each has its own deep-dive page with the platforms we endorse, the ones to approach with caution, and the ones to avoid.</p>
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


        <SectionWrapper>
          <div className="text-center"><h2 className="font-heading text-2xl font-bold md:text-3xl">How we rate trading platforms</h2><p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Every platform runs through the same evidence-led checklist. <Link to="/methodology" className="font-medium text-primary underline underline-offset-2">See our full methodology</Link>.</p></div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Scale, t: "Who runs it", d: "Real, named team and a verifiable track record — not anonymous gurus." },
              { icon: Wallet, t: "Where the money goes", d: "Custodial vs self-custody. We test deposits and withdrawals for real." },
              { icon: ShieldCheck, t: "Proof, not promises", d: "Verifiable results and no guaranteed-return claims — ever." },
              { icon: Eye, t: "No paid placement", d: "Scores are earned on evidence, never bought with commission." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><x.icon className="h-5 w-5 text-primary" /></div><h3 className="mt-3 font-heading font-semibold">{x.t}</h3><p className="mt-1.5 text-sm text-muted-foreground">{x.d}</p></div>
            ))}
          </div>
        </SectionWrapper>

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

export default Trading;
