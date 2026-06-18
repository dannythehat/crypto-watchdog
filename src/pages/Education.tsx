import { Link } from "react-router-dom";
import { GraduationCap, Wallet, Building2, Bot, Coins } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/content";
import { breadcrumbJsonLd } from "@/lib/seo";

const pick = (re: RegExp, n = 4) =>
  blogPosts
    .filter((p) => p.published && (re.test(p.title) || re.test(p.summary || "")))
    .sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""))
    .slice(0, n);

const TOPICS = [
  { icon: Wallet, title: "Wallets & self-custody", re: /wallet|self-custody|custodial|seed phrase|hardware/i },
  { icon: Building2, title: "Exchanges & buying", re: /exchange|buy|kyc|withdrawal|fiat/i },
  { icon: Bot, title: "Trading bots & AI", re: /bot|ai |copy trad|signal|automat/i },
  { icon: Coins, title: "DeFi, yield & tokens", re: /defi|yield|staking|token|rwa|dex|smart contract/i },
];

const Education = () => (
  <>
    <Seo
      title="Crypto Education: Plain-English Guides for Safer Crypto"
      description="Learn crypto the safe way — wallets and self-custody, choosing an exchange, trading bots and AI, DeFi and tokens. Clear, beginner-friendly guides with no hype."
      path="/education"
      type="website"
      jsonLd={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Education", path: "/education" }])]}
    />
    <Navbar />
    <main>
      <SectionWrapper className="pt-28 md:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-4xl md:text-5xl">Crypto, explained safely</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            You don't need to become an expert to stay safe — you need the right few things explained properly. These guides do that: plain English, real examples, and the safety bits most tutorials skip.
          </p>
        </div>
      </SectionWrapper>

      {TOPICS.map((topic, idx) => {
        const posts = pick(topic.re);
        if (!posts.length) return null;
        return (
          <SectionWrapper key={topic.title} className={idx % 2 === 0 ? "bg-card" : ""}>
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-2">
                <topic.icon className="h-6 w-6 text-primary" />
                <h2 className="text-2xl md:text-3xl">{topic.title}</h2>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {posts.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/blog/${p.slug}`}
                    className="group flex flex-col rounded-xl border border-border bg-background p-5 transition hover:border-primary/40 hover:bg-card"
                  >
                    <h3 className="font-heading text-sm font-semibold leading-snug text-foreground group-hover:text-primary">{p.title}</h3>
                    {p.summary && <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{p.summary}</p>}
                  </Link>
                ))}
              </div>
            </div>
          </SectionWrapper>
        );
      })}

      <SectionWrapper className="bg-primary/5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl">Got the basics? Put them to work</h2>
          <p className="mt-4 text-muted-foreground">
            See which platforms pass our checks, learn how we rate them, and steer clear of the ones we're warning about.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link to="/reviews">Browse reviews</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/methodology">How we rate</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/scam-guides">Scam guides</Link></Button>
          </div>
        </div>
      </SectionWrapper>
    </main>
    <Footer />
  </>
);

export default Education;
