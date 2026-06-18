import { Handshake } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import Markdown from "@/components/Markdown";
import { breadcrumbJsonLd } from "@/lib/seo";

const CONTENT = `
Let's be upfront about how this site pays for itself, because trust is the only thing we're actually selling.

## The short version

Some links on Crypto Watchdog are affiliate links. If you sign up to a platform through one of them, we may earn a commission — at no extra cost to you. That commission helps fund the testing, research and writing. It does **not** buy a good rating, and it never will.

## What an affiliate link does and doesn't change

- **It doesn't change the verdict.** We decide a rating from the evidence before any commercial relationship exists. A commission can't move it up, and the absence of one can't move it down.
- **It doesn't cost you more.** You pay the same whether you use our link or go direct.
- **It never appears on a scam.** We don't put affiliate links on red-rated platforms or scam warnings. Full stop. If we've flagged something as dangerous, we're not also trying to earn off it.

We've reversed a positive rating to a scam warning before — and stripped the affiliate link out the moment we did. The rating leads; the commercial side follows.

## How to spot a paid link

Affiliate links are marked with \`rel="sponsored"\`, and many route through a \`/go/\` redirect so we can keep them tidy and track which ones people find useful. Where a link in an article is to a partner, we say so in or near the article. If a link isn't an affiliate link, it earns us nothing — we link to plenty of sources, regulators and rival guides simply because they help you.

## Why we use affiliates at all

Independent testing costs money — deposits, time, tools. We could run ads or charge platforms for reviews. We don't, because both quietly corrupt the incentive to tell you the truth. Affiliate commissions on platforms we'd recommend anyway is the least conflicted model we've found. If that ever stops being true, we'll change it.

## The honest caveat

Recommending a platform is never a guarantee about your money. Crypto is high-risk, much of it is unregulated, and even good platforms can fail. Treat every rating as a starting point for your own research, read the full review, and never invest more than you can afford to lose.

For how ratings are actually decided, see our [methodology](/methodology) and [editorial policy](/editorial-policy). Questions? Email **dannythehat2@gmail.com**.
`;

const AffiliateDisclosure = () => (
  <>
    <Seo
      title="Affiliate Disclosure"
      description="How Crypto Watchdog earns money through affiliate links — and why a commission never buys a good rating. Affiliate links never appear on scams or red-rated platforms."
      path="/affiliate-disclosure"
      type="website"
      jsonLd={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Affiliate Disclosure", path: "/affiliate-disclosure" }])]}
    />
    <Navbar />
    <main>
      <SectionWrapper className="pt-28 md:pt-36">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Handshake className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-4xl md:text-5xl">Affiliate disclosure</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              How we make money — and the hard line between getting paid and telling you the truth.
            </p>
          </div>
          <div className="mt-12">
            <Markdown content={CONTENT} />
          </div>
        </div>
      </SectionWrapper>
    </main>
    <Footer />
  </>
);

export default AffiliateDisclosure;
