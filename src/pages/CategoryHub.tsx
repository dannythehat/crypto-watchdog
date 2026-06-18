import { useParams, Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, ShieldX, ArrowRight, AlertTriangle, BookOpen, Star, ExternalLink, Scale, Eye, Wallet, BadgeCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import Markdown from "@/components/Markdown";
import AuroraBackdrop from "@/components/AuroraBackdrop";
import WatchdogMascot from "@/components/WatchdogMascot";
import PlatformCard from "@/components/PlatformCard";
import LogoTile from "@/components/LogoTile";
import RatingBadge from "@/components/RatingBadge";
import NotFound from "./NotFound";
import { getHub, hubs } from "@/content/hubs";
import { getReview, getWarning, getBlogPost, getHubGuide, getAffiliateByReviewSlug, isMonetisable } from "@/content";
import { trackEvent } from "@/lib/analytics";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

type Variant = "endorsed" | "caution" | "avoid";
const ratingVariant = (r?: string | null): Variant => (r === "green" ? "endorsed" : r === "red" ? "avoid" : "caution");
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

const Band = ({ icon: Icon, tone, title, subtitle, children }: { icon: typeof ShieldCheck; tone: string; title: string; subtitle: string; children: React.ReactNode }) => (
  <div>
    <div className={`mb-2 inline-flex items-center gap-2 ${tone}`}>
      <Icon className="h-5 w-5" />
      <span className="text-sm font-semibold uppercase tracking-wider">{title}</span>
    </div>
    <p className="mb-6 max-w-2xl text-muted-foreground">{subtitle}</p>
    {children}
  </div>
);

const CategoryHub = () => {
  const { hubSlug } = useParams<{ hubSlug: string }>();
  const hub = getHub(hubSlug);
  if (!hub) return <NotFound />;

  const path = `/${hub.slug}`;
  const trusted = hub.trusted.filter(getReview);
  const caution = hub.caution.filter(getReview);
  const avoid = hub.avoid.filter(getReview);
  const warnings = hub.warnings.map(getWarning).filter(Boolean) as NonNullable<ReturnType<typeof getWarning>>[];
  const posts = hub.relatedPosts.map(getBlogPost).filter(Boolean) as NonNullable<ReturnType<typeof getBlogPost>>[];
  const otherHubs = hubs.filter((h) => h.slug !== hub.slug && !h.hidden);
  const guide = getHubGuide(hub.slug);

  // All listed platforms (from groups if present, else trusted+caution+avoid).
  const allSlugs = Array.from(new Set(hub.groups ? hub.groups.flatMap((g) => g.slugs) : [...trusted, ...caution, ...avoid]));
  const allReviews = allSlugs.map(getReview).filter(Boolean) as NonNullable<ReturnType<typeof getReview>>[];
  const slugType = new Map<string, string>();
  if (hub.groups) hub.groups.forEach((g) => g.slugs.forEach((s) => slugType.set(s, g.title)));

  const greens = allReviews.filter((r) => r.rating === "green").length;
  const oranges = allReviews.filter((r) => r.rating === "orange").length;
  const avoidCount = allReviews.filter((r) => r.rating === "red").length + warnings.length;

  // Featured = highest-scoring green platform (fallback: highest overall).
  const ranked = [...allReviews].sort((a, b) => (b.trust_score ?? 0) - (a.trust_score ?? 0));
  const featured = ranked.find((r) => r.rating === "green") ?? ranked[0] ?? null;
  const featuredAff = featured ? getAffiliateByReviewSlug(featured.slug) : null;

  return (
    <>
      <Seo
        title={hub.metaTitle}
        description={hub.metaDescription}
        path={path}
        type="website"
        jsonLd={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: hub.eyebrow, path }]),
          faqJsonLd(hub.faq.map((f) => ({ q: f.q, a: f.a }))) || {},
          { "@context": "https://schema.org", "@type": "ItemList", name: hub.metaTitle, itemListElement: ranked.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.name, url: `https://cryptowatchdog.net/reviews/${r.slug}` })) },
        ]}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <AuroraBackdrop accent={hub.accent} variant="hero" imagePrompt={hub.heroPrompt} imageSeed={hub.heroSeed} />
          <SectionWrapper className="pb-12 pt-32 md:pt-40">
            <div className="grid items-center gap-8 md:grid-cols-5">
              <div className="md:col-span-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">{hub.eyebrow}</span>
                <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">{hub.title}</h1>
                <p className="mt-5 max-w-xl text-lg text-muted-foreground">{hub.metaDescription}</p>
                <div className="mt-7 flex flex-wrap gap-3 text-sm">
                  {greens > 0 && <a href="#picks" className="inline-flex items-center gap-1.5 rounded-full bg-rating-green/15 px-3 py-1.5 font-semibold text-rating-green"><ShieldCheck className="h-4 w-4" />{greens} trusted</a>}
                  {oranges > 0 && <a href="#picks" className="inline-flex items-center gap-1.5 rounded-full bg-rating-orange/15 px-3 py-1.5 font-semibold text-rating-orange"><ShieldAlert className="h-4 w-4" />{oranges} caution</a>}
                  {avoidCount > 0 && <a href="#avoid" className="inline-flex items-center gap-1.5 rounded-full bg-rating-red/15 px-3 py-1.5 font-semibold text-rating-red"><ShieldX className="h-4 w-4" />{avoidCount} avoid</a>}
                </div>
                <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>Reviewed by the <span className="font-semibold text-foreground">Crypto Watchdog</span> team</span>
                  <span aria-hidden>·</span>
                  <span>Updated June 2026</span>
                  <span aria-hidden>·</span>
                  <Link to="/methodology" className="font-medium text-primary hover:underline">Our methodology</Link>
                </p>
              </div>
              <div className="md:col-span-2">
                {hub.heroImage ? (
                  <>
                    <div className="relative overflow-hidden rounded-2xl border border-primary/30 shadow-2xl ring-1 ring-white/10">
                      <img src={hub.heroImage} alt={`${hub.eyebrow} — ${hub.title}`} className="w-full" loading="eager" />
                    </div>
                    <div className="cw-float mx-auto mt-5 hidden w-28 lg:block"><WatchdogMascot mood={hub.mood} title={`CryptoWatchdog — ${hub.eyebrow}`} /></div>
                  </>
                ) : (
                  <div className="cw-float mx-auto hidden w-64 max-w-full md:block"><WatchdogMascot mood={hub.mood} title={`CryptoWatchdog — ${hub.eyebrow}`} /></div>
                )}
              </div>
            </div>
          </SectionWrapper>
        </section>

        {/* Intro */}
        <SectionWrapper className="border-y border-border bg-card/40 backdrop-blur">
          <div className="mx-auto max-w-3xl"><Markdown content={hub.intro} /></div>
        </SectionWrapper>

        {/* Featured top pick */}
        {featured && featured.rating === "green" && (
          <SectionWrapper>
            <span id="picks" className="block -translate-y-28" />
            <div className="mb-6 inline-flex items-center gap-2 text-rating-green"><Star className="h-5 w-5 fill-rating-green" /><span className="text-sm font-semibold uppercase tracking-wider">Our top pick</span></div>
            <div className="relative overflow-hidden rounded-3xl border border-rating-green/30 bg-gradient-to-br from-rating-green/10 via-card/60 to-card/60 p-6 backdrop-blur-md md:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rating-green/20 blur-3xl" />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
                <LogoTile name={featured.name} logoUrl={featured.logo_url} domain={(featured.website_url || "").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || null} accent={hub.accent} size={80} rounded="rounded-3xl" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3"><h2 className="font-heading text-2xl font-bold">{featured.name}</h2><RatingBadge rating="green" size="md" /></div>
                  {slugType.get(featured.slug) && <p className="mt-1 text-sm text-muted-foreground">{slugType.get(featured.slug)}</p>}
                  <p className="mt-3 max-w-xl text-muted-foreground">{(featured.summary || "").replace(/[#>*_`~|]/g, " ").slice(0, 180)}…</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link to={`/reviews/${featured.slug}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">Read our {featured.name} review <ArrowRight className="h-4 w-4" /></Link>
                    {isMonetisable(featuredAff) && (
                      <a href={`/go/${featuredAff!.id}`} target="_blank" rel="sponsored noopener noreferrer" onClick={() => trackEvent("affiliate_click", { affiliate_id: featuredAff!.id, placement: "hub_featured", review_slug: featured.slug })} className="inline-flex items-center gap-2 rounded-xl bg-rating-green px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Visit {featured.name} <ExternalLink className="h-3.5 w-3.5" /></a>
                    )}
                  </div>
                </div>
                {featured.trust_score != null && <div className="md:pl-4"><TrustRing score={featured.trust_score} /></div>}
              </div>
            </div>
          </SectionWrapper>
        )}

        {/* Platforms — grouped by type, or endorsed/caution */}
        {hub.groups ? (
          hub.groups.map((g) => {
            const slugs = g.slugs.filter(getReview);
            if (!slugs.length) return null;
            return (
              <SectionWrapper key={g.title} className="border-t border-border/60 pt-10">
                <h2 className="font-heading text-2xl font-bold">{g.title}</h2>
                {g.subtitle && <p className="mt-1 max-w-2xl text-muted-foreground">{g.subtitle}</p>}
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {slugs.map((s) => <PlatformCard key={s} slug={s} variant={ratingVariant(getReview(s)!.rating)} />)}
                </div>
              </SectionWrapper>
            );
          })
        ) : (
          <>
            {trusted.length > 0 && (
              <SectionWrapper>
                <span id="picks" className="block -translate-y-28" />
                <Band icon={ShieldCheck} tone="text-rating-green" title="Sites we endorse" subtitle="Platforms that passed our audit with strong, verifiable signals.">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{trusted.map((s) => <PlatformCard key={s} slug={s} variant="endorsed" />)}</div>
                </Band>
              </SectionWrapper>
            )}
            {caution.length > 0 && (
              <SectionWrapper className="border-y border-border bg-card/40">
                <Band icon={ShieldAlert} tone="text-rating-orange" title="Approach with caution" subtitle="Mixed signals — usable for some, with real trade-offs. Read the full review first.">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{caution.map((s) => <PlatformCard key={s} slug={s} variant="caution" />)}</div>
                </Band>
              </SectionWrapper>
            )}
          </>
        )}

        {/* Avoid */}
        {(avoid.length > 0 || warnings.length > 0) && (
          <SectionWrapper className="bg-rating-red/5">
            <span id="avoid" className="block -translate-y-28" />
            <Band icon={ShieldX} tone="text-rating-red" title="Avoid / scam alerts" subtitle="Serious red flags, confirmed scams or platforms that have failed. Steer clear.">
              {avoid.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{avoid.map((s) => <PlatformCard key={s} slug={s} variant="avoid" />)}</div>}
              {warnings.length > 0 && (
                <div className="mt-6 space-y-3">
                  {warnings.map((w) => (
                    <Link key={w.slug} to={`/warnings/${w.slug}`} className="flex items-center justify-between gap-3 rounded-xl border border-rating-red/20 bg-card p-4 transition-all hover:border-rating-red/40 hover:shadow-md">
                      <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rating-red" /><div><h3 className="font-heading text-sm font-semibold">{w.title}</h3>{w.platform_name && <span className="text-xs text-muted-foreground">{w.platform_name}</span>}</div></div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </Band>
          </SectionWrapper>
        )}

        {/* At a glance — comparison table */}
        {ranked.length > 1 && (
          <SectionWrapper className="border-y border-border bg-card/40">
            <h2 className="font-heading text-2xl font-bold md:text-3xl">At a glance</h2>
            <p className="mt-2 text-sm text-muted-foreground md:hidden">Swipe the table sideways →</p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card/60 backdrop-blur-md">
              <table className="w-full min-w-[640px] text-sm">
                <thead><tr className="bg-gradient-to-r from-primary/10 to-transparent text-left">{["#", "Platform", "Type", "Score", "Rating", ""].map((h, hi) => <th key={hi} className="px-4 py-3 font-heading font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {ranked.map((r, i) => {
                    const rowAff = getAffiliateByReviewSlug(r.slug);
                    const showCta = r.rating !== "red" && isMonetisable(rowAff);
                    return (
                    <tr key={r.slug} className={`border-t border-border/60 transition-colors hover:bg-foreground/5 ${i % 2 ? "bg-foreground/[0.015]" : ""}`}>
                      <td className="px-4 py-3 font-heading font-bold text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3"><Link to={`/reviews/${r.slug}`} className="font-medium hover:text-primary">{r.name}</Link></td>
                      <td className="px-4 py-3 text-muted-foreground">{slugType.get(r.slug) || r.categories?.name || hub.eyebrow}</td>
                      <td className={`px-4 py-3 font-heading font-bold ${scoreColor(r.trust_score ?? 0)}`}>{r.trust_score ?? "—"}</td>
                      <td className="px-4 py-3">{r.rating && <RatingBadge rating={r.rating as "green" | "orange" | "red"} />}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {showCta ? (
                          <a href={`/go/${rowAff!.id}`} target="_blank" rel="sponsored noopener noreferrer" onClick={() => trackEvent("affiliate_click", { affiliate_id: rowAff!.id, placement: "hub_table", review_slug: r.slug })} className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-rating-green to-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5">Visit <ExternalLink className="h-3 w-3" /></a>
                        ) : (
                          <Link to={`/reviews/${r.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Review <ArrowRight className="h-3 w-3" /></Link>
                        )}
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        )}

        {/* Buyer's guide (expandable long-form SEO content) */}
        {guide && (
          <SectionWrapper>
            <div className="mx-auto max-w-3xl">
              <details className="group rounded-2xl border border-border bg-card/60 p-6 backdrop-blur md:p-8">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 marker:content-none">
                  <span className="flex items-center gap-2 font-heading text-xl font-bold"><BookOpen className="h-5 w-5 text-primary" /> The complete {hub.eyebrow.toLowerCase()} buyer's guide</span>
                  <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground group-open:hidden">Read the full guide +</span>
                  <span className="hidden shrink-0 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground group-open:inline">Collapse −</span>
                </summary>
                <div className="mt-6 border-t border-border pt-6"><Markdown content={guide} /></div>
              </details>
            </div>
          </SectionWrapper>
        )}

        {/* How we rate */}
        <SectionWrapper className="border-y border-border bg-card/40">
          <div className="text-center"><h2 className="font-heading text-2xl font-bold md:text-3xl">How we rate {hub.eyebrow.toLowerCase()}</h2><p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Every platform runs through the same evidence-led checklist before it gets a score.</p></div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Scale, t: "Regulation & ownership", d: "Who runs it, where it's based, and how transparent they are." },
              { icon: Wallet, t: "Funds & withdrawals", d: "Real deposit/withdrawal testing, fees, and complaint patterns." },
              { icon: ShieldCheck, t: "Security & track record", d: "Custody model, security history, and time in operation." },
              { icon: Eye, t: "No paid placement", d: "Rankings by evidence — never by affiliate commission." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><x.icon className="h-5 w-5 text-primary" /></div><h3 className="mt-3 font-heading font-semibold">{x.t}</h3><p className="mt-1.5 text-sm text-muted-foreground">{x.d}</p></div>
            ))}
          </div>
        </SectionWrapper>

        {/* Related guides */}
        {posts.length > 0 && (
          <SectionWrapper>
            <Band icon={BookOpen} tone="text-primary" title="Read before you commit" subtitle="In-depth guides that go deeper on this category.">
              <div className="grid gap-5 md:grid-cols-3">
                {posts.map((p) => (
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
            </Band>
          </SectionWrapper>
        )}

        {/* FAQ */}
        {hub.faq.length > 0 && (
          <SectionWrapper className="border-y border-border bg-card/40">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-heading text-3xl font-bold">Frequently asked questions</h2>
              <div className="mt-6 space-y-3">
                {hub.faq.map((f) => (
                  <details key={f.q} className="group rounded-xl border border-border bg-card/60 p-5 backdrop-blur">
                    <summary className="cursor-pointer list-none font-heading font-semibold marker:content-none"><span className="flex items-center justify-between gap-3">{f.q}<span className="text-primary transition-transform group-open:rotate-45">+</span></span></summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </SectionWrapper>
        )}

        {/* Explore other hubs */}
        <SectionWrapper>
          <h2 className="font-heading text-2xl font-bold">Explore more categories</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {otherHubs.map((h) => <Link key={h.slug} to={`/${h.slug}`} className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:border-primary/40 hover:text-primary">{h.eyebrow}</Link>)}
            <Link to="/crypto-casinos" className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:border-primary/40 hover:text-primary">Casinos &amp; Sportsbooks</Link>
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
};

export default CategoryHub;
