import { Link } from "react-router-dom";
import { ShieldCheck, Star, ArrowRight, ExternalLink, BadgeCheck, Scale, Coins, Lock, Eye, Wallet, Trophy, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import AuroraBackdrop from "@/components/AuroraBackdrop";
import WatchdogMascot from "@/components/WatchdogMascot";
import LogoTile from "@/components/LogoTile";
import RatingBadge from "@/components/RatingBadge";
import { hubs } from "@/content/hubs";
import { casinos, casinosRanked, featuredCasino, type Casino } from "@/content/casinos";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

const ACCENT = "#F5A524";

const scoreColor = (n: number) => (n >= 75 ? "text-rating-green" : n >= 50 ? "text-rating-orange" : "text-rating-red");
const ringColor = (n: number) => (n >= 75 ? "#16C784" : n >= 50 ? "#F5A524" : "#F23F52");

const TrustRing = ({ score }: { score: number }) => {
  const r = 24, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(100, score));
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 56 56" className="h-16 w-16 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={ringColor(score)} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-heading text-base font-bold text-foreground">{score}</span>
        <span className="text-[8px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
};

const CasinoCard = ({ c, rank }: { c: Casino; rank: number }) => (
  <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl" style={{ background: c.accent, opacity: 0.14 }} />
    <div className="absolute left-0 top-0 rounded-br-xl bg-foreground/5 px-2.5 py-1 text-xs font-bold text-muted-foreground">#{rank}</div>

    <div className="relative mt-3 flex items-start gap-3">
      <LogoTile name={c.name} domain={c.domain} accent={c.accent} size={56} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-heading text-lg font-semibold">{c.name}</h3>
        <span className="text-xs text-muted-foreground">{c.kind}</span>
        <div className="mt-1.5"><RatingBadge rating={c.rating} /></div>
      </div>
      <TrustRing score={c.trustScore} />
    </div>

    <p className="relative mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{c.highlight}</p>

    <div className="relative mt-3 flex flex-wrap gap-1.5 text-[11px]">
      <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-0.5 text-muted-foreground"><Scale className="h-3 w-3" />{c.license}</span>
      <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-0.5 text-muted-foreground"><Coins className="h-3 w-3" />{c.coins}</span>
      <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-0.5 text-muted-foreground">Est. {c.established}</span>
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 font-medium text-amber-500/90">Provisional</span>
    </div>

    <div className="relative mt-4 flex items-center justify-between border-t border-border/60 pt-3">
      <Link to={`/reviews/${c.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        Read review <ArrowRight className="h-3.5 w-3.5" />
      </Link>
      <a href={`https://${c.domain}`} target="_blank" rel="sponsored noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        Visit <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  </article>
);

const CryptoCasinos = () => {
  const f = featuredCasino;
  const rest = casinosRanked.filter((c) => c.slug !== f.slug);
  const faqs = [
    { q: "Are crypto casinos and sportsbooks safe?", a: "It depends entirely on the operator. The established names with long track records and verifiable licensing are lower-risk, but crypto gambling is largely Curaçao-licensed and restricted in many countries. Always check our review, confirm it's legal where you live, and never deposit more than you can afford to lose." },
    { q: "What is 'provably fair'?", a: "Provably fair is a cryptographic method that lets you verify each bet result wasn't tampered with. It's a strong trust signal — but it doesn't guarantee the operator will pay out or stay solvent, which is what our audits focus on." },
    { q: "How does CryptoWatchdog rate gambling sites?", a: "We weigh licensing, ownership transparency, payout and withdrawal track record, provably-fair tech, complaint patterns, and responsible-gambling tools. Commission never affects a rating — we don't promote red-rated operators." },
    { q: "Do you earn money if I sign up?", a: "Some links may be affiliate links that pay us a commission at no extra cost to you. That keeps the site free and independent. It never changes our scores, and you'll always find the honest review one click away." },
  ];

  return (
    <>
      <Seo
        title="Best Crypto Casinos & Sportsbooks 2026 (Vetted & Ranked)"
        description="Independent, evidence-led rankings of the best crypto casinos and Bitcoin sportsbooks in 2026 — licensing, payouts, provably-fair tech and safety, scored out of 100. No paid placement."
        path="/crypto-casinos"
        type="website"
        jsonLd={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Crypto Casinos & Sportsbooks", path: "/crypto-casinos" }]),
          faqJsonLd(faqs) || {},
          {
            "@context": "https://schema.org", "@type": "ItemList", name: "Best Crypto Casinos & Sportsbooks 2026",
            itemListElement: casinosRanked.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, url: `https://cryptowatchdog.net/reviews/${c.slug}` })),
          },
        ]}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <AuroraBackdrop accent={ACCENT} variant="hero" imagePrompt="a luxurious dark futuristic crypto casino floor with glowing golden roulette and neon sportsbook screens, bitcoin chips, cinematic volumetric gold and teal light, ultra detailed" imageSeed={61} />
          <SectionWrapper className="pb-12 pt-32 md:pt-40">
            <div className="grid items-center gap-8 md:grid-cols-5">
              <div className="md:col-span-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-500 backdrop-blur">
                  <Trophy className="h-4 w-4" /> Crypto Gambling
                </span>
                <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
                  Best Crypto Casinos &amp; <span className="bg-gradient-to-r from-amber-400 to-primary bg-clip-text text-transparent">Sportsbooks</span> 2026
                </h1>
                <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                  Independent, evidence-led rankings of crypto casinos and Bitcoin sportsbooks — judged on licensing,
                  payouts, provably-fair tech and safety. Scored out of 100. <strong className="text-foreground">No paid placement.</strong>
                </p>
                <div className="mt-7 flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-card/60 px-3 py-1.5 font-medium backdrop-blur"><BadgeCheck className="h-4 w-4 text-rating-green" />{casinos.length} sites vetted</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-card/60 px-3 py-1.5 font-medium backdrop-blur"><ShieldCheck className="h-4 w-4 text-primary" />Independent scoring</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-card/60 px-3 py-1.5 font-medium backdrop-blur">🔞 18+ • Gamble responsibly</span>
                </div>
              </div>
              <div className="hidden md:col-span-2 md:block">
                <div className="cw-float mx-auto w-60"><WatchdogMascot mood="caution" title="Crypto gambling safety" /></div>
              </div>
            </div>
          </SectionWrapper>
        </section>

        {/* Trust bar */}
        <SectionWrapper className="border-y border-border bg-card/40 py-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Scale, t: "Licensing checked", d: "We verify who regulates each operator." },
              { icon: Wallet, t: "Payouts tested", d: "Withdrawal speed and reliability, not just bonuses." },
              { icon: Eye, t: "No paid placement", d: "Rankings by evidence — never by commission." },
            ].map((x) => (
              <div key={x.t} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"><x.icon className="h-5 w-5 text-primary" /></div>
                <div><p className="font-heading text-sm font-semibold">{x.t}</p><p className="text-xs text-muted-foreground">{x.d}</p></div>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* Featured pick */}
        <SectionWrapper>
          <div className="mb-6 inline-flex items-center gap-2 text-amber-500">
            <Star className="h-5 w-5 fill-amber-500" /><span className="text-sm font-semibold uppercase tracking-wider">Editor's top pick</span>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 via-card/60 to-card/60 p-6 backdrop-blur-md md:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
              <LogoTile name={f.name} domain={f.domain} accent={f.accent} size={88} rounded="rounded-3xl" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-heading text-2xl font-bold">{f.name}</h2>
                  <RatingBadge rating={f.rating} size="md" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{f.kind} • {f.license} • Est. {f.established} • {f.coins}</p>
                <p className="mt-3 max-w-xl text-muted-foreground">{f.highlight}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={`/reviews/${f.slug}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">
                    Read our {f.name} review <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href={`https://${f.domain}`} target="_blank" rel="sponsored noopener noreferrer nofollow" className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:border-primary/40">
                    Visit {f.name} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
              <div className="md:pl-4"><TrustRing score={f.trustScore} /></div>
            </div>
          </div>
        </SectionWrapper>

        {/* Ranked grid */}
        <SectionWrapper className="pt-0">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">All vetted crypto gambling sites</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">Ranked by our provisional trust score. Tap any box for the in-depth review.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((c, i) => <CasinoCard key={c.slug} c={c} rank={i + 2} />)}
          </div>
        </SectionWrapper>

        {/* Comparison table */}
        <SectionWrapper className="border-y border-border bg-card/40">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">At a glance</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card/60 backdrop-blur-md">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-primary/10 to-transparent text-left">
                  {["Site", "Type", "Score", "Rating", "License", "Crypto"].map((h) => (
                    <th key={h} className="px-4 py-3 font-heading font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {casinosRanked.map((c) => (
                  <tr key={c.slug} className="border-t border-border/60 transition-colors hover:bg-foreground/5">
                    <td className="px-4 py-3">
                      <Link to={`/reviews/${c.slug}`} className="flex items-center gap-2 font-medium hover:text-primary">
                        <LogoTile name={c.name} domain={c.domain} accent={c.accent} size={28} rounded="rounded-lg" />{c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.kind}</td>
                    <td className={`px-4 py-3 font-heading font-bold ${scoreColor(c.trustScore)}`}>{c.trustScore}</td>
                    <td className="px-4 py-3"><RatingBadge rating={c.rating} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{c.license}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.coins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>

        {/* How we rate */}
        <SectionWrapper>
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold md:text-3xl">How we rate crypto gambling sites</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Every operator runs through the same checklist before it gets a score.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Scale, t: "Licensing & ownership", d: "Who regulates it, who runs it, and how transparent they are." },
              { icon: Wallet, t: "Payouts & withdrawals", d: "Real-world payout speed, limits and complaint patterns." },
              { icon: Lock, t: "Security & fairness", d: "Provably-fair tech, account security, data handling." },
              { icon: ShieldCheck, t: "Responsible gambling", d: "Deposit limits, self-exclusion and player protections." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><x.icon className="h-5 w-5 text-primary" /></div>
                <h3 className="mt-3 font-heading font-semibold">{x.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* Responsible gambling */}
        <SectionWrapper className="pt-0">
          <div className="flex items-start gap-4 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
            <div className="text-sm text-muted-foreground">
              <p className="font-heading font-semibold text-foreground">Please gamble responsibly (18+)</p>
              <p className="mt-1">
                Crypto gambling is high-risk and illegal or restricted in many countries — it's your responsibility to check
                your local laws. Never bet more than you can afford to lose. If gambling is affecting you, free, confidential
                help is available at <a href="https://www.begambleaware.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">BeGambleAware</a>.
                Provisional ratings reflect early research; full audits are in progress.
              </p>
            </div>
          </div>
        </SectionWrapper>

        {/* FAQ */}
        <SectionWrapper className="border-y border-border bg-card/40">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-3xl font-bold">Frequently asked questions</h2>
            <div className="mt-6 space-y-3">
              {faqs.map((f) => (
                <details key={f.q} className="group rounded-xl border border-border bg-card/60 p-5 backdrop-blur">
                  <summary className="cursor-pointer list-none font-heading font-semibold marker:content-none">
                    <span className="flex items-center justify-between gap-3">{f.q}<span className="text-primary transition-transform group-open:rotate-45">+</span></span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </SectionWrapper>

        {/* Explore other categories */}
        <SectionWrapper>
          <h2 className="font-heading text-2xl font-bold">Explore more categories</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {hubs.map((h) => (
              <Link key={h.slug} to={`/${h.slug}`} className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:border-primary/40 hover:text-primary">
                {h.eyebrow}
              </Link>
            ))}
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
};

export default CryptoCasinos;
