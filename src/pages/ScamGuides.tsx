import { Link } from "react-router-dom";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { blogPosts, warnings } from "@/content";
import { breadcrumbJsonLd } from "@/lib/seo";

const KEYWORDS = /scam|fraud|phishing|rug ?pull|drainer|avoid|protect|safe|safety|spot|vet|red flag|due diligence|recover|ponzi|fake/i;

const guides = blogPosts
  .filter((p) => p.published && (KEYWORDS.test(p.title) || KEYWORDS.test(p.summary || "") || /scam|security|safety/i.test(p.category || "")))
  .sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""))
  .slice(0, 12);

const recentAlerts = warnings
  .filter((w) => w.published)
  .sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""))
  .slice(0, 6);

const ScamGuides = () => (
  <>
    <Seo
      title="Crypto Scam Guides: How to Spot and Avoid Crypto Scams"
      description="Plain-English guides to spotting and avoiding crypto scams — phishing, rug pulls, wallet drainers, fake bots, recovery scams and more — plus our latest scam alerts."
      path="/scam-guides"
      type="website"
      jsonLd={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Scam Guides", path: "/scam-guides" }])]}
    />
    <Navbar />
    <main>
      <SectionWrapper className="pt-28 md:pt-36">
        <div className="grid items-center gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-rating-red/30 bg-rating-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rating-red"><ShieldAlert className="h-4 w-4" /> Scam prevention</span>
            <h1 className="mt-4 text-4xl md:text-5xl">Crypto scam guides</h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              The scams change costume; the playbook rarely does. These guides teach you the patterns — so you can <strong className="text-foreground">spot the next one before it spots you.</strong> No jargon, no fear-mongering, just what actually works.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-rating-red/30 shadow-2xl ring-1 ring-white/10">
              <img src="/scam-guides/hero.png" alt="Crypto Watchdog — detect, verify and protect against crypto scams" className="w-full" loading="eager" />
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper className="bg-card">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl">Learn the patterns</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Start with whichever fits your worry right now. Each one is built from real cases, not hypotheticals.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-background p-5 transition hover:border-primary/40 hover:bg-card"
              >
                {p.category && <span className="text-xs font-medium text-primary">{p.category}</span>}
                <h3 className="mt-1 font-heading font-semibold leading-snug text-foreground group-hover:text-primary">{p.title}</h3>
                {p.summary && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.summary}</p>}
              </Link>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-rating-red" />
            <h2 className="text-2xl md:text-3xl">Latest scam alerts</h2>
          </div>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Live incidents we've logged — fresh drainers, exploits and rug pulls worth knowing about.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentAlerts.map((w) => (
              <Link
                key={w.slug}
                to={`/warnings/${w.slug}`}
                className="group flex flex-col rounded-xl border border-rating-red/25 bg-rating-red/5 p-5 transition hover:border-rating-red/50"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-rating-red">
                  {w.alert_type || "Scam alert"}
                </span>
                <h3 className="mt-1 font-heading font-semibold leading-snug text-foreground group-hover:text-rating-red">{w.title}</h3>
                {w.summary && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{w.summary}</p>}
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline"><Link to="/warnings">See all scam alerts</Link></Button>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper className="bg-primary/5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl">Not sure about a platform?</h2>
          <p className="mt-4 text-muted-foreground">
            Check our independent reviews before you deposit — or ask us to investigate one we haven't covered yet.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link to="/reviews">Browse reviews</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/submit">Submit a platform</Link></Button>
          </div>
        </div>
      </SectionWrapper>
    </main>
    <Footer />
  </>
);

export default ScamGuides;
