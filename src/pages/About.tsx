import { Shield, Search, Users, Video, FileCheck, Mail, Eye, Scale, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";

const About = () => (
  <>
    <Navbar />
    <main>
      {/* Hero */}
      <SectionWrapper className="pt-28 md:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <Shield className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-4xl md:text-5xl">About Crypto Watchdog</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            We exist because the crypto space desperately needs an independent, unsponsored filter. Not a cheerleader for the industry — a watchdog.
          </p>
        </div>
      </SectionWrapper>

      {/* Our Story */}
      <SectionWrapper className="bg-card">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl md:text-4xl">Our Story</h2>
          <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed">
            <p>Our story comes from the front line.</p>
            <p>
              Before building Crypto Watchdog, our founder worked at <strong className="text-foreground">Crypto.com as a Complaints Manager</strong>.
              He saw the fallout of scams and misleading crypto activity on a daily basis. These were not minor complaints. People were scammed out
              of homes, savings, and life-changing amounts of money. Some lost millions. In one case, the emotional and financial damage was so severe
              that the person later took his own life.
            </p>
            <p>
              That experience changed how we view the industry. It made it impossible to treat crypto risk as theory, content, or internet drama.
              <strong className="text-foreground"> The damage is real, personal, and often devastating.</strong>
            </p>
            <p>
              That is why Crypto Watchdog exists. This is not a hype brand and it is not a content farm. It is a response to seeing what happens when
              people trust the wrong platform, the wrong bot, the wrong investment, or the wrong promise.
            </p>
            <p>
              We want to be more useful on the front line: testing, exposing, warning, and helping people make safer decisions before money leaves their hands.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* Mission, Vision, Positioning */}
      <SectionWrapper>
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <Eye className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-heading text-lg font-semibold">Mission</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Help people avoid costly crypto mistakes by testing products properly, exposing risk clearly, and publishing
                honest, evidence-based reviews in plain English.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <Search className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-heading text-lg font-semibold">Vision</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Become the most trusted independent destination for crypto due diligence, product testing, scam warnings,
                interviews, and practical risk education.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <Scale className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-heading text-lg font-semibold">Positioning</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We are the filter. We check what really happens behind the landing page, the promises, and the influencer posts.
                Not a cheerleader — a watchdog.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* What We Do */}
      <SectionWrapper className="bg-card">
        <h2 className="text-center text-3xl">What We Investigate</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Everything in crypto that asks for trust, deposits, or action from a user.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {[
            { icon: Search, title: "Deep Investigations", desc: "Domain records, company registrations, team backgrounds, regulatory filings, and community reports." },
            { icon: Users, title: "Real User Data", desc: "We aggregate withdrawal reports, deposit experiences, and support interactions from across the web." },
            { icon: Video, title: "Under the Bonnet Videos", desc: "We interview platform founders, do live walkthroughs, and create video deep-dives into how things actually work." },
            { icon: FileCheck, title: "Transparent Ratings", desc: "Our Green/Orange/Red alert system plus Trust Score out of 100. Every rating comes with detailed reasoning." },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <item.icon className="mt-1 h-6 w-6 shrink-0 text-primary" />
              <div>
                <h3 className="font-heading font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Review Framework */}
      <SectionWrapper>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl">Our Review Framework</h2>
          <p className="mt-4 text-muted-foreground">Every review covers these core areas — strict, practical, and repeatable:</p>
        </div>
        <div className="mx-auto mt-8 max-w-2xl space-y-4">
          {[
            { area: "Onboarding", what: "Sign-up flow, KYC, friction — does the platform feel serious from day one?" },
            { area: "Deposits", what: "Funding methods, speed, failed attempts, clarity of fees." },
            { area: "Withdrawals", what: "Success rate, timing, limits, hidden conditions — the critical trust test." },
            { area: "Security", what: "2FA, confirmations, device checks, wallet controls, risk prompts." },
            { area: "Transparency", what: "Ownership, company details, licensing claims, terms, disclosures." },
            { area: "Support", what: "Response time, usefulness, escalation, accountability." },
            { area: "Claims vs Reality", what: "Performance claims, guarantees, proof — cutting through exaggeration." },
            { area: "User Trust Signals", what: "Complaint patterns, common issues, consistency across channels." },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div>
                <span className="font-heading text-sm font-semibold">{item.area}</span>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.what}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Brand Principles */}
      <SectionWrapper className="bg-card">
        <div className="mx-auto max-w-3xl text-center">
          <Heart className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-3xl">Brand Principles</h2>
        </div>
        <div className="mx-auto mt-8 max-w-2xl grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            "Protection first",
            "Plain English",
            "Evidence over hype",
            "Sceptical, not cynical",
            "Clear disclosures",
            "No blind promotion",
            "User before platform",
            "Earned trust",
          ].map((p) => (
            <div key={p} className="rounded-lg border border-border bg-background p-4 text-center text-sm font-medium">
              {p}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper className="bg-primary/5">
        <div className="mx-auto max-w-2xl text-center">
          <Mail className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-3xl">Get in Touch</h2>
          <p className="mt-4 text-muted-foreground">
            Want us to review a platform? Have a tip about a suspicious project? Partnership enquiry? Interview request?
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/submit">Submit a Platform</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="mailto:dannythehat2@gmail.com">Email Us</a>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            We typically respond within 24–48 hours.
          </p>
        </div>
      </SectionWrapper>
    </main>
    <Footer />
  </>
);

export default About;
