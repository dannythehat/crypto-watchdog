import { Link } from "react-router-dom";
import { Shield, Search, FileCheck, ArrowRight, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Send, BrainCircuit, ArrowLeftRight, Wallet, Users, Layers, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import ReviewCard from "@/components/ReviewCard";
import BlogCard from "@/components/BlogCard";
import AuroraBackdrop from "@/components/AuroraBackdrop";
import WatchdogMascot from "@/components/WatchdogMascot";
import OfferCard from "@/components/OfferCard";
import NewsCard from "@/components/NewsCard";
import { hubs } from "@/content/hubs";
import { offersByDateDesc } from "@/content/offers";
import { useLiveNews } from "@/hooks/useLiveNews";
import { useReviews } from "@/hooks/useReviews";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useWarnings } from "@/hooks/useWarnings";

const HUB_ICONS: Record<string, typeof BrainCircuit> = {
  "ai-finance": BrainCircuit,
  "crypto-exchanges": ArrowLeftRight,
  "crypto-wallets": Wallet,
  "copy-trading": Users,
  "defi-platforms": Layers,
  "crypto-trading-bots": Bot,
};

// Top-level category tiles for the homepage. Each opens a landing page (umbrella)
// or its category pillar. Image-led; falls back to an icon where no art exists yet.
const CATS: { label: string; about: string; to: string; image?: string; icon: typeof BrainCircuit; accent: string }[] = [
  { label: "AI Finance", about: "AI trading, bots & agents — what's real, and what's a scam in a chatbot costume.", to: "/ai-finance", image: "/ai-finance/hero.png", icon: BrainCircuit, accent: "#4F8BFF" },
  { label: "Exchanges", about: "Where you buy, sell and trade — and where we test withdrawals for real.", to: "/crypto-exchanges", image: "/crypto-exchanges/hero.png", icon: ArrowLeftRight, accent: "#16C784" },
  { label: "Wallets", about: "Self-custody and hot wallets we actually trust — plus the fakes to avoid.", to: "/crypto-wallets", image: "/crypto-wallets/hero.png", icon: Wallet, accent: "#16C784" },
  { label: "DeFi", about: "Real yield vs Ponzi yield — protocols rated on what's verifiable on-chain.", to: "/defi-platforms", image: "/defi-platforms/hero.png", icon: Layers, accent: "#4F8BFF" },
  { label: "Tokenized Assets", about: "Gold, US treasuries and property, brought on-chain (RWA).", to: "/tokenized-assets", image: "/tokenized-assets/hero.png", icon: BrainCircuit, accent: "#A78BFA" },
  { label: "NFT Marketplaces", about: "Where to mint and trade collectibles — minus the wallet drainers.", to: "/nft-marketplaces", image: "/nft-marketplaces/hero.png", icon: BrainCircuit, accent: "#A78BFA" },
  { label: "Casinos & Sportsbooks", about: "Vetted crypto casinos and Bitcoin sportsbooks, scored out of 100.", to: "/crypto-casinos", image: "/crypto-casinos/hero.png", icon: Shield, accent: "#F5A524" },
  { label: "Scams & Safety", about: "Spot, avoid and recover from crypto scams — the patterns that keep you safe.", to: "/scam-guides", image: "/scam-guides/hero.png", icon: Shield, accent: "#F23F52" },
];

const Index = () => {
  const { data: reviews } = useReviews();
  const { data: posts } = useBlogPosts();
  const { data: warnings } = useWarnings();
  const { items: newsItems } = useLiveNews();

  const reviewCount = reviews?.length ?? 0;
  const warningCount = warnings?.length ?? 0;
  const postCount = posts?.length ?? 0;
  const round = (n: number) => (n >= 10 ? `${Math.floor(n / 10) * 10}+` : `${n}`);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <AuroraBackdrop accent="#4F8BFF" variant="hero" />
          <SectionWrapper className="pb-16 pt-32 md:pt-44">
            <div className="mx-auto mb-10 w-40 cw-float md:hidden">
              <WatchdogMascot mood="approve" title="CryptoWatchdog mascot" />
            </div>
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur">
                <Shield className="h-4 w-4" />
                Independent crypto safety reviews
              </div>
              <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                Don't trust.<br />
                <span className="bg-gradient-to-r from-primary to-[#5B8DEF] bg-clip-text text-transparent">Verify.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                We test crypto exchanges, wallets, bots and DeFi platforms with real money — real deposits, real withdrawals — so you know what's safe <em>before</em> you risk a penny. Independent and evidence-led. We don't take payment for ratings.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                  <Link to="/reviews"><Search className="mr-2 h-4 w-4" />Browse Reviews</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="backdrop-blur">
                  <Link to="/warnings"><AlertTriangle className="mr-2 h-4 w-4" />Scam Alerts</Link>
                </Button>
              </div>

              {/* Trust stats */}
              <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { n: round(reviewCount), l: "Platforms audited" },
                  { n: round(warningCount), l: "Scam alerts" },
                  { n: round(postCount), l: "Safety guides" },
                  { n: "100%", l: "Independent" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur">
                    <div className="font-heading text-2xl font-bold text-foreground">{s.n}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </SectionWrapper>
        </section>

        {/* Latest crypto news */}
        <SectionWrapper>
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-primary">
                <span className="text-lg">📰</span>
                <span className="text-sm font-semibold uppercase tracking-wider">Fresh today</span>
              </div>
              <h2 className="font-heading text-3xl font-bold md:text-4xl">Latest crypto news</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">The headlines that matter — with our safety-first take on each.</p>
            </div>
            <Link to="/news" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
              All news <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {newsItems.slice(0, 3).map((item) => <NewsCard key={item.id} item={item} />)}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Button asChild variant="outline"><Link to="/news">See all news</Link></Button>
          </div>
        </SectionWrapper>

        {/* Browse by category — hub landing pages */}
        <SectionWrapper>
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Explore</span>
            <h2 className="mt-2 font-heading text-3xl font-bold md:text-4xl">Browse crypto by category</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Every corner of crypto, mapped — the platforms we trust, the ones to watch, and the ones to avoid. Pick where you're headed.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATS.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl"
              >
                {c.image ? (
                  <div className="overflow-hidden border-b border-border/60">
                    <img src={c.image} alt={c.label} loading="lazy" className="block w-full transition-transform duration-500 group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden border-b border-border/60" style={{ background: `linear-gradient(135deg, ${c.accent}26, transparent)` }}>
                    <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl" style={{ background: `${c.accent}40` }} />
                    <c.icon className="relative h-14 w-14" style={{ color: c.accent }} />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-lg font-bold">{c.label}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.about}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                </div>
              </Link>
            ))}
          </div>
        </SectionWrapper>

        {/* Vetted offers & freebies */}
        <SectionWrapper className="border-y border-border bg-card">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-rating-green">
                <span className="text-lg">🎁</span>
                <span className="text-sm font-semibold uppercase tracking-wider">Daily & ongoing</span>
              </div>
              <h2 className="font-heading text-3xl font-bold md:text-4xl">Freebies &amp; offers</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">Bonuses and deals — but only from platforms we've actually vetted. No red-rated platforms, ever.</p>
            </div>
            <Link to="/freebies" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
              All offers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offersByDateDesc.slice(0, 3).map((o) => <OfferCard key={o.id} offer={o} />)}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Button asChild variant="outline"><Link to="/freebies">See all offers</Link></Button>
          </div>
        </SectionWrapper>

        {/* Our Story - founder's note */}
        <SectionWrapper className="border-y border-border bg-card">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 md:grid-cols-5 md:items-center">
              <div className="md:col-span-2">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our mission</span>
                <h2 className="mt-2 font-heading text-3xl font-bold leading-tight md:text-4xl">Why we exist</h2>
                <blockquote className="mt-6 rounded-r-xl border-l-4 border-primary bg-primary/5 py-3 pl-5 pr-4 font-heading text-xl font-semibold leading-snug text-foreground">
                  "The damage is real, personal, and often devastating."
                </blockquote>
              </div>
              <div className="space-y-4 leading-relaxed text-muted-foreground md:col-span-3">
                <p>
                  Before building CryptoWatchdog, our founder worked at Crypto.com as a Complaints Manager — seeing the
                  devastating fallout of scams every single day. People lost homes, savings, and life-changing sums. In one
                  case the damage was so severe the person later took his own life.
                </p>
                <p>
                  That made it impossible to treat crypto risk as theory or internet drama. CryptoWatchdog isn't a hype brand —
                  it's a response. We <strong className="text-foreground">test, expose, warn</strong> and help people make safer
                  decisions <em>before</em> money leaves their hands. No sponsorships, no hidden agendas.
                </p>
                <Button asChild variant="outline" className="mt-2">
                  <Link to="/about">Read our full story <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Rating System Explainer */}
        <SectionWrapper>
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">Our alert system</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Every platform gets a colour — green, amber or red — after our multi-point audit, plus a Trust Score out of 100. No fence-sitting.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: ShieldCheck, color: "text-rating-green", ring: "hover:border-rating-green/40", glow: "bg-rating-green/10", title: "🟢 Green — Broadly Credible", desc: "The good stuff. A team you can actually find, a product that works, withdrawals that clear, and a track record that holds up. Still crypto — so still do your homework." },
              { icon: ShieldAlert, color: "text-rating-orange", ring: "hover:border-rating-orange/40", glow: "bg-rating-orange/10", title: "🟠 Orange — Caution Required", desc: "Mixed signals. A murky past, thin disclosure, or a few too many unanswered questions. Fine for some — eyes open, and only money you can afford to risk." },
              { icon: ShieldX, color: "text-rating-red", ring: "hover:border-rating-red/40", glow: "bg-rating-red/10", title: "🔴 Red — Serious Warning", desc: "Hard no. Confirmed scams, misleading claims, or serious red flags we couldn't look past. Steer well clear." },
            ].map((item) => (
              <div key={item.title} className={`group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 backdrop-blur transition-all hover:shadow-lg ${item.ring}`}>
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${item.glow}`} />
                <item.icon className={`relative h-10 w-10 ${item.color}`} />
                <h3 className="relative mt-4 font-heading text-lg font-semibold">{item.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* How We Audit */}
        <SectionWrapper className="border-y border-border bg-card">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">How we audit</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              We dig way past the homepage. Every review runs through the same strict checklist — the boring, repeatable kind that actually catches the liars.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🔑", title: "Onboarding & KYC", desc: "Sign-up flow, identity checks, friction — is the platform serious from day one?" },
              { icon: "💸", title: "Deposits & Withdrawals", desc: "Real funding tests. Speed, limits, hidden conditions, and what happens to your money." },
              { icon: "🔒", title: "Security & Controls", desc: "2FA, device checks, wallet controls, risk prompts — how does it protect your funds?" },
              { icon: "👤", title: "Team Transparency", desc: "Who runs it? Company details, licensing claims, ownership, and disclosures." },
              { icon: "📊", title: "Claims vs Reality", desc: "Performance claims, guarantees, marketing language — does it hold up under scrutiny?" },
              { icon: "💬", title: "Support Quality", desc: "Response time, usefulness, escalation, and accountability when problems arise." },
              { icon: "🔍", title: "Backend Investigation", desc: "Domain age, company records, regulatory filings, complaint patterns, and tech stack." },
              { icon: "📹", title: "Under the Bonnet", desc: "Live platform testing, interviews with founders, and video walkthroughs." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-background/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-3 font-heading font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* Active Warnings */}
        {warningCount > 0 && (
          <SectionWrapper className="bg-rating-red/5">
            <div className="flex items-end justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 text-rating-red">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Active warnings</span>
                </div>
                <h2 className="font-heading text-3xl font-bold md:text-4xl">Scam alerts</h2>
                <p className="mt-2 text-muted-foreground">Urgent risk warnings — check before you deposit.</p>
              </div>
              <Link to="/warnings" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
                All warnings <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 space-y-3">
              {(warnings ?? []).slice(0, 3).map((w: any) => (
                <Link
                  key={w.id ?? w.slug}
                  to={`/warnings/${w.slug}`}
                  className="block rounded-xl border border-rating-red/20 bg-card p-5 transition-all hover:border-rating-red/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold uppercase text-rating-red">
                        {w.severity === "critical" ? "🔴 Critical" : "🟠 High Risk"}
                      </span>
                      <h3 className="mt-1 font-heading font-semibold">{w.title}</h3>
                      {w.platform_name && <span className="text-sm text-muted-foreground">{w.platform_name}</span>}
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </SectionWrapper>
        )}

        {/* Latest Reviews */}
        <SectionWrapper>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold md:text-4xl">Latest reviews</h2>
              <p className="mt-2 text-muted-foreground">Fresh off the audit bench.</p>
            </div>
            <Link to="/reviews" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(reviews ?? []).slice(0, 6).map((r: any) => (
              <ReviewCard
                key={r.id ?? r.slug}
                name={r.name}
                slug={r.slug}
                rating={r.rating}
                summary={r.summary}
                categoryName={r.categories?.name}
                websiteUrl={r.website_url}
                trustScore={r.trust_score}
              />
            ))}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Button asChild variant="outline"><Link to="/reviews">View all reviews</Link></Button>
          </div>
        </SectionWrapper>

        {/* Latest Blog Posts */}
        <SectionWrapper className="border-y border-border bg-card">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold md:text-4xl">From the blog</h2>
              <p className="mt-2 text-muted-foreground">Safety guides and no-nonsense comparisons.</p>
            </div>
            <Link to="/blog" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
              All posts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {(posts ?? []).slice(0, 3).map((p: any) => (
              <BlogCard
                key={p.id ?? p.slug}
                title={p.title}
                slug={p.slug}
                summary={p.summary}
                category={p.category}
                publishedAt={p.published_at}
              />
            ))}
          </div>
        </SectionWrapper>

        {/* CTA */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-primary/5" />
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <SectionWrapper>
            <div className="mx-auto max-w-2xl text-center">
              <Send className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-4 font-heading text-3xl font-bold md:text-4xl">Got a platform you're not sure about?</h2>
              <p className="mt-4 text-muted-foreground">
                A wallet, exchange, bot, DeFi protocol, or an "AI" platform you've got a bad feeling about — send it over, and we'll put it through the full audit and tell you straight.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="shadow-lg shadow-primary/20"><Link to="/submit">Submit a Platform</Link></Button>
                <Button asChild variant="outline" size="lg"><Link to="/about">Learn Our Process</Link></Button>
              </div>
            </div>
          </SectionWrapper>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Index;
