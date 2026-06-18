import { Link } from "react-router-dom";
import { Shield, Search, Eye, Scale, FileCheck, RefreshCw, CircleDollarSign, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

const RATINGS = [
  { label: "Trusted", color: "text-rating-green", ring: "border-rating-green/40 bg-rating-green/5", desc: "Passed our checks. We've usually tested it ourselves — deposits, withdrawals, the lot — and found a real team, clear terms and money that comes back out. Still not risk-free; nothing in crypto is." },
  { label: "Caution", color: "text-rating-orange", ring: "border-rating-orange/40 bg-rating-orange/5", desc: "Usable, but with unresolved concerns — partial disclosure, mixed track record, high fees, or risks you need to understand before depositing. Read the full review and size accordingly." },
  { label: "High Risk / Avoid", color: "text-rating-red", ring: "border-rating-red/40 bg-rating-red/5", desc: "Serious red flags or active scam signals: guaranteed-return claims, custodial funds with no recourse, fake teams, or withdrawals that don't clear. We never put an affiliate link on these." },
];

const FRAMEWORK = [
  { icon: Shield, area: "Custody", q: "Who actually holds your money — you, or them? What happens to your funds if the company disappears tomorrow?" },
  { icon: Eye, area: "Transparency", q: "Are ownership, company registration, licensing and terms public and verifiable — or vague, dated and self-attested?" },
  { icon: Scale, area: "Regulation", q: "What's the regulatory standing in the markets it serves? Is it licensed where it claims to be?" },
  { icon: FileCheck, area: "Security history", q: "Audits, proof of reserves, past incidents and how they were handled. We'd rather see a disclosed, fixed bug than silence." },
  { icon: CircleDollarSign, area: "Fees & hidden costs", q: "Headline fees vs effective cost — spreads, slippage, withdrawal minimums, FX markups and early-exit penalties." },
  { icon: Search, area: "User recourse", q: "If something goes wrong, can you actually get help? Or does support vanish the moment money is involved?" },
  { icon: CheckCircle2, area: "Team & track record", q: "Real, identified people with a history — or anonymous founders and a brand-new domain?" },
  { icon: RefreshCw, area: "Product integrity", q: "Do the claims match reality? We test the actual product against what the marketing promises." },
];

const FAQS = [
  { q: "How do you make money, and does it affect ratings?", a: "Some links on the site are affiliate links, so we may earn a commission if you sign up through them. Ratings are decided before any commercial relationship and never change because of one. We never place an affiliate link on a red-rated or scam platform. See our affiliate disclosure for the detail." },
  { q: "Do you test platforms with real money?", a: "Where we can, yes — we deposit, use the product and withdraw, then report exactly what happened. Where we can't test directly, we say so and lean on on-chain evidence, public records and aggregated user reports instead." },
  { q: "How often do you re-check a review?", a: "We re-audit on a material change (a new incident, a disclosure update, an ownership change) and at least every six months. Each review shows when it was last checked." },
  { q: "What does the Trust Score out of 100 mean?", a: "It's a weighted roll-up of the eight areas below into a single number, mapped to our traffic-light rating. It's a summary, not a substitute for reading the review — the reasoning is what matters." },
];

const Methodology = () => (
  <>
    <Seo
      title="How We Rate: The Crypto Watchdog Methodology"
      description="The evidence-led, 8-point framework behind every Crypto Watchdog rating — custody, transparency, regulation, security, fees, recourse, team and product integrity — plus our traffic-light system and Trust Score."
      path="/methodology"
      type="website"
      jsonLd={[
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Methodology", path: "/methodology" },
        ]),
        faqJsonLd(FAQS),
      ]}
    />
    <Navbar />
    <main>
      <SectionWrapper className="pt-28 md:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <Scale className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-4xl md:text-5xl">How we rate</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Every rating on this site comes from the same place: evidence, not vibes. Here's exactly how we judge a crypto platform — and what our colours and scores actually mean — so you can check our work, not just trust it.
          </p>
        </div>
      </SectionWrapper>

      {/* Traffic-light ratings */}
      <SectionWrapper className="bg-card">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl">The three ratings</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            One colour, one verdict. It's deliberately blunt — you shouldn't need a glossary to know whether something's safe.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {RATINGS.map((r) => (
              <div key={r.label} className={`rounded-2xl border p-6 ${r.ring}`}>
                <h3 className={`font-heading text-xl font-bold ${r.color}`}>{r.label}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
            Alongside the colour, we publish a <strong className="text-foreground">Trust Score out of 100</strong> — a weighted roll-up of the eight checks below. Treat it as a summary; the reasoning in the full review is the part that protects you.
          </p>
        </div>
      </SectionWrapper>

      {/* 8-point framework */}
      <SectionWrapper>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl">The 8-point framework</h2>
          <p className="mt-4 text-muted-foreground">
            We score every platform against the same eight areas. The order matters: custody and transparency come first because they're where people lose the most.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          {FRAMEWORK.map((f, i) => (
            <div key={f.area} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold">
                  <span className="mr-2 text-primary">{i + 1}.</span>{f.area}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.q}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Independence + cadence */}
      <SectionWrapper className="bg-card">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl">Independence, and keeping reviews honest</h2>
          <div className="mt-8 space-y-5 leading-relaxed text-muted-foreground">
            <p>
              The rating is decided before any commercial relationship exists, and it doesn't move because one shows up later. If a platform we rate well turns sour, the rating changes — we've done exactly that, flipping a platform from green to red when the evidence demanded it.
            </p>
            <p>
              We re-audit on any material change — a hack, a disclosure update, an ownership shuffle — and at minimum every six months. Each review carries the date it was last checked, so you're never reading a verdict that's quietly gone stale.
            </p>
            <p>
              When we can't verify something, we say so out loud rather than dress a guess up as a fact. "We couldn't confirm this" is a more useful sentence than false confidence. For the commercial side of all this, read our <Link to="/affiliate-disclosure" className="font-medium text-primary underline underline-offset-2">affiliate disclosure</Link> and <Link to="/editorial-policy" className="font-medium text-primary underline underline-offset-2">editorial policy</Link>.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl">Frequently asked questions</h2>
          <div className="mt-8 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-heading text-base font-semibold text-foreground">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper className="bg-primary/5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl">See the framework in action</h2>
          <p className="mt-4 text-muted-foreground">
            Browse the platforms we've put through it — and the ones we're warning people away from.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link to="/reviews">Read our reviews</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/warnings">See scam alerts</Link></Button>
          </div>
        </div>
      </SectionWrapper>
    </main>
    <Footer />
  </>
);

export default Methodology;
