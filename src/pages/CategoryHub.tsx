import { useParams, Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, ShieldX, ArrowRight, AlertTriangle, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import Markdown from "@/components/Markdown";
import AuroraBackdrop from "@/components/AuroraBackdrop";
import WatchdogMascot from "@/components/WatchdogMascot";
import PlatformCard from "@/components/PlatformCard";
import NotFound from "./NotFound";
import { getHub, hubs } from "@/content/hubs";
import { getReview, getWarning, getBlogPost } from "@/content";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

const Band = ({
  icon: Icon, tone, title, subtitle, children,
}: { icon: typeof ShieldCheck; tone: string; title: string; subtitle: string; children: React.ReactNode }) => (
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
  const warnings = hub.warnings.map(getWarning).filter(Boolean);
  const posts = hub.relatedPosts.map(getBlogPost).filter(Boolean);
  const otherHubs = hubs.filter((h) => h.slug !== hub.slug);

  return (
    <>
      <Seo
        title={hub.metaTitle}
        description={hub.metaDescription}
        path={path}
        type="website"
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: hub.eyebrow, path },
          ]),
          faqJsonLd(hub.faq.map((f) => ({ q: f.q, a: f.a }))) || {},
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: hub.metaTitle,
            itemListElement: trusted.map((slug, i) => {
              const r = getReview(slug)!;
              return { "@type": "ListItem", position: i + 1, name: r.name, url: `https://cryptowatchdog.net/reviews/${slug}` };
            }),
          },
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
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">
                  {hub.eyebrow}
                </span>
                <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
                  {hub.title}
                </h1>
                <p className="mt-5 max-w-xl text-lg text-muted-foreground">{hub.metaDescription}</p>
                <div className="mt-7 flex flex-wrap gap-3 text-sm">
                  {trusted.length > 0 && <a href="#endorsed" className="inline-flex items-center gap-1.5 rounded-full bg-rating-green/15 px-3 py-1.5 font-semibold text-rating-green"><ShieldCheck className="h-4 w-4" />{trusted.length} endorsed</a>}
                  {caution.length > 0 && <a href="#caution" className="inline-flex items-center gap-1.5 rounded-full bg-rating-orange/15 px-3 py-1.5 font-semibold text-rating-orange"><ShieldAlert className="h-4 w-4" />{caution.length} caution</a>}
                  {(avoid.length + warnings.length) > 0 && <a href="#avoid" className="inline-flex items-center gap-1.5 rounded-full bg-rating-red/15 px-3 py-1.5 font-semibold text-rating-red"><ShieldX className="h-4 w-4" />{avoid.length + warnings.length} avoid</a>}
                </div>
              </div>
              <div className="hidden md:col-span-2 md:block">
                <div className="cw-float mx-auto w-64 max-w-full">
                  <WatchdogMascot mood={hub.mood} title={`CryptoWatchdog — ${hub.eyebrow}`} />
                </div>
              </div>
            </div>
          </SectionWrapper>
        </section>

        {/* Intro */}
        <SectionWrapper className="border-y border-border bg-card/40 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <Markdown content={hub.intro} />
          </div>
        </SectionWrapper>

        {/* Endorsed */}
        {trusted.length > 0 && (
          <SectionWrapper>
            <span id="endorsed" className="block -translate-y-28" />
            <Band icon={ShieldCheck} tone="text-rating-green" title="Sites we endorse" subtitle="Platforms that passed our audit with strong, verifiable signals. We'd consider using these ourselves.">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {trusted.map((slug) => <PlatformCard key={slug} slug={slug} variant="endorsed" />)}
              </div>
            </Band>
          </SectionWrapper>
        )}

        {/* Caution */}
        {caution.length > 0 && (
          <SectionWrapper className="border-y border-border bg-card/40">
            <span id="caution" className="block -translate-y-28" />
            <Band icon={ShieldAlert} tone="text-rating-orange" title="Approach with caution" subtitle="Mixed signals — usable for some people, but with real trade-offs or unresolved concerns. Read the full review first.">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {caution.map((slug) => <PlatformCard key={slug} slug={slug} variant="caution" />)}
              </div>
            </Band>
          </SectionWrapper>
        )}

        {/* Avoid */}
        {(avoid.length > 0 || warnings.length > 0) && (
          <SectionWrapper className="bg-rating-red/5">
            <span id="avoid" className="block -translate-y-28" />
            <Band icon={ShieldX} tone="text-rating-red" title="Avoid / scam alerts" subtitle="Serious red flags, confirmed scams or platforms that have failed. Steer clear.">
              {avoid.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {avoid.map((slug) => <PlatformCard key={slug} slug={slug} variant="avoid" />)}
                </div>
              )}
              {warnings.length > 0 && (
                <div className="mt-6 space-y-3">
                  {warnings.map((w: any) => (
                    <Link key={w.slug} to={`/warnings/${w.slug}`} className="flex items-center justify-between gap-3 rounded-xl border border-rating-red/20 bg-card p-4 transition-all hover:border-rating-red/40 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rating-red" />
                        <div>
                          <h3 className="font-heading text-sm font-semibold">{w.title}</h3>
                          {w.platform_name && <span className="text-xs text-muted-foreground">{w.platform_name}</span>}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </Band>
          </SectionWrapper>
        )}

        {/* Related guides */}
        {posts.length > 0 && (
          <SectionWrapper className="border-t border-border">
            <Band icon={BookOpen} tone="text-primary" title="Read before you commit" subtitle="In-depth guides that go deeper on this category.">
              <div className="grid gap-5 md:grid-cols-3">
                {posts.map((p: any) => (
                  <Link key={p.slug} to={`/blog/${p.slug}`} className="group flex flex-col rounded-2xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
                    {p.category && <span className="text-xs font-semibold uppercase tracking-wide text-primary">{p.category}</span>}
                    <h3 className="mt-1 font-heading font-semibold leading-snug">{p.title}</h3>
                    {p.summary && <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{p.summary.replace(/[#>*_`~|]/g, " ").slice(0, 140)}</p>}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">Read guide <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
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
                    <summary className="cursor-pointer list-none font-heading font-semibold marker:content-none">
                      <span className="flex items-center justify-between gap-3">{f.q}<span className="text-primary transition-transform group-open:rotate-45">+</span></span>
                    </summary>
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
            {otherHubs.map((h) => (
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

export default CategoryHub;
