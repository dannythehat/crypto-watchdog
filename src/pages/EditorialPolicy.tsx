import { BookOpenCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import Markdown from "@/components/Markdown";
import { breadcrumbJsonLd } from "@/lib/seo";

const CONTENT = `
Crypto Watchdog exists to help people make safer decisions before their money leaves their hands. This page sets out the standards we hold ourselves to. If we ever fall short of them, tell us — the email's at the bottom.

## Independence comes first

We are not sponsored by the platforms we cover, and no company can pay to change a rating. We earn money through affiliate links, but the verdict is decided on the evidence before any commercial relationship exists, and it doesn't move because one shows up later. We've flipped a platform from a positive rating to a scam warning when the evidence demanded it, affiliate link and all. We'd do it again without hesitating.

For the full commercial picture, read our [affiliate disclosure](/affiliate-disclosure).

## Evidence over opinion

Every rating is built from things you can check, not things we feel. Our full process is laid out on the [methodology page](/methodology), but the short version:

- Where we can, we test the product with real money — deposits, the actual product, withdrawals — and report what happened.
- Where we can't test directly, we lean on on-chain records, public filings, audits and aggregated user reports, and we say which is which.
- We rate against the same eight checks every time: custody, transparency, regulation, security history, fees, recourse, team and product integrity.

## Sourcing and accuracy

When we cite a figure, a date or a named case, we link a real, current source so you can verify it yourself. We don't invent statistics to make a point land harder. If a number is contested or a case isn't fully confirmed, we flag the uncertainty out loud — "we couldn't verify this" is more useful than false confidence.

## Corrections

We get things wrong sometimes. When we do, we fix it and say so rather than quietly editing the page. If you spot an error — a broken fact, an out-of-date detail, a platform that's changed since we looked — email us and we'll re-check. Reviews carry a "last checked" date, and we re-audit on any material change and at least every six months.

## On hype, and on victims

We roast scams, not the people they hurt. On scam warnings, recovery and anything involving real losses, we keep the bite aimed at the bad actors and stay genuinely careful with the people who got burned. We never use "guaranteed", "risk-free" or price predictions as promises, and humour never overstates safety or downplays risk.

## How we use AI

We use software tools — including AI — to help with research, drafting and production. A human is responsible for every published verdict, every factual claim and every rating. Tools speed up the work; they don't make the call.

## Questions or corrections

Found a mistake, or want us to look at something? Email **dannythehat2@gmail.com** or [submit a platform](/submit). We usually reply within 24–48 hours.
`;

const EditorialPolicy = () => (
  <>
    <Seo
      title="Editorial Policy"
      description="How Crypto Watchdog stays independent: no paid ratings, evidence over opinion, real sourcing, transparent corrections, and a human responsible for every verdict."
      path="/editorial-policy"
      type="website"
      jsonLd={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Editorial Policy", path: "/editorial-policy" }])]}
    />
    <Navbar />
    <main>
      <SectionWrapper className="pt-28 md:pt-36">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <BookOpenCheck className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-4xl md:text-5xl">Editorial policy</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              The standards behind everything we publish — and how we keep ourselves honest.
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

export default EditorialPolicy;
