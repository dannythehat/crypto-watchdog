import { Link } from "react-router-dom";
import { Shield, Search, FileCheck, ArrowRight, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import ReviewCard from "@/components/ReviewCard";
import BlogCard from "@/components/BlogCard";
import { useReviews } from "@/hooks/useReviews";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useWarnings } from "@/hooks/useWarnings";

const Index = () => {
  const { data: reviews } = useReviews();
  const { data: posts } = useBlogPosts();
  const { data: warnings } = useWarnings();

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <SectionWrapper id="hero" className="pt-32 md:pt-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Shield className="h-4 w-4" />
              Independent Crypto Safety Reviews
            </div>
            <h1 className="text-4xl leading-tight md:text-5xl lg:text-6xl">
              Don't trust. <span className="text-primary">Verify.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              We audit crypto wallets, exchanges, trading bots, and DeFi platforms so you can make informed decisions. Transparent ratings. No sponsorships. No hidden agendas.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/reviews">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Reviews
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/warnings">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Scam Alerts
                </Link>
              </Button>
            </div>
          </div>
        </SectionWrapper>

        {/* Our Story - brief version */}
        <SectionWrapper className="bg-card">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl md:text-4xl">Why We Exist</h2>
            <div className="mt-8 space-y-4 text-muted-foreground">
              <p>
                Before building Crypto Watchdog, our founder worked at Crypto.com as a Complaints Manager — seeing the devastating
                fallout of scams and misleading crypto activity every single day. People lost homes, savings, and life-changing
                amounts of money. In one case, the damage was so severe that the person later took his own life.
              </p>
              <p>
                That experience made it impossible to treat crypto risk as theory or internet drama. <strong className="text-foreground">The damage is real, personal, and often devastating.</strong>
              </p>
              <p>
                Crypto Watchdog is not a hype brand. It's a response to seeing what happens when people trust the wrong platform.
                We test, expose, warn, and help people make safer decisions <em>before</em> money leaves their hands.
              </p>
            </div>
            <div className="mt-6 text-center">
              <Button asChild variant="outline">
                <Link to="/about">Read Our Full Story <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </SectionWrapper>

        {/* Rating System Explainer */}
        <SectionWrapper>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl">Our Alert System</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Every product gets a clear, colour-coded alert signal after our multi-point audit process, plus a Trust Score out of 100.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                color: "text-rating-green",
                bg: "bg-rating-green/10 border-rating-green/20",
                title: "🟢 Green Alert — Broadly Credible",
                desc: "Strong signs of legitimacy. Transparent team, working product, verifiable track record, healthy withdrawal reports, and lower apparent risk.",
              },
              {
                icon: ShieldAlert,
                color: "text-rating-orange",
                bg: "bg-rating-orange/10 border-rating-orange/20",
                title: "🟠 Orange Alert — Caution Required",
                desc: "Mixed signals. Unresolved concerns, key limitations, insufficient data, or past incidents that need watching. Proceed carefully.",
              },
              {
                icon: ShieldX,
                color: "text-rating-red",
                bg: "bg-rating-red/10 border-rating-red/20",
                title: "🔴 Red Alert — Serious Warning",
                desc: "Major unresolved issues, misleading behaviour, confirmed scam reports, or critical red flags. Avoid or proceed at extreme risk.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-lg border p-6 ${item.bg}`}
              >
                <item.icon className={`h-10 w-10 ${item.color}`} />
                <h3 className="mt-4 font-heading text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* How We Audit */}
        <SectionWrapper className="bg-card">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl">How We Audit</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Our reviews go far deeper than a surface-level check. Every review follows a strict, repeatable framework.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
              <div key={item.title} className="rounded-lg border border-border bg-background p-6">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-3 font-heading font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* Active Warnings */}
        {(warnings ?? []).length > 0 && (
          <SectionWrapper className="bg-rating-red/5">
            <div className="flex items-end justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 text-rating-red">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Active Warnings</span>
                </div>
                <h2 className="text-3xl md:text-4xl">Scam Alerts</h2>
                <p className="mt-2 text-muted-foreground">Urgent risk warnings — check before you deposit.</p>
              </div>
              <Link to="/warnings" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
                All warnings <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 space-y-3">
              {(warnings ?? []).slice(0, 3).map((w: any) => (
                <Link
                  key={w.id}
                  to={`/warnings/${w.slug}`}
                  className="block rounded-lg border border-rating-red/20 bg-card p-5 transition-all hover:border-rating-red/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase text-rating-red">
                        {w.severity === "critical" ? "🔴 Critical" : "🟠 High Risk"}
                      </span>
                      <h3 className="mt-1 font-heading font-semibold">{w.title}</h3>
                      {w.platform_name && <span className="text-sm text-muted-foreground">{w.platform_name}</span>}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
              <h2 className="text-3xl md:text-4xl">Latest Reviews</h2>
              <p className="mt-2 text-muted-foreground">Recently audited platforms.</p>
            </div>
            <Link to="/reviews" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(reviews ?? []).slice(0, 6).map((r: any) => (
              <ReviewCard
                key={r.id}
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
            <Button asChild variant="outline">
              <Link to="/reviews">View all reviews</Link>
            </Button>
          </div>
        </SectionWrapper>

        {/* Latest Blog Posts */}
        <SectionWrapper className="bg-card">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl">From the Blog</h2>
              <p className="mt-2 text-muted-foreground">Daily crypto safety insights, updated automatically.</p>
            </div>
            <Link to="/blog" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
              All posts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {(posts ?? []).slice(0, 3).map((p: any) => (
              <BlogCard
                key={p.id}
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
        <SectionWrapper className="bg-primary/5">
          <div className="mx-auto max-w-2xl text-center">
            <Send className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-3xl md:text-4xl">Want us to investigate a platform?</h2>
            <p className="mt-4 text-muted-foreground">
              If there's a wallet, exchange, bot, or DeFi protocol you want us to investigate, submit it. We'll put it through our full audit process.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/submit">Submit a Platform</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">Learn Our Process</Link>
              </Button>
            </div>
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
};

export default Index;
