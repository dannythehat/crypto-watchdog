import { Link } from "react-router-dom";
import { Gift, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import AuroraBackdrop from "@/components/AuroraBackdrop";
import WatchdogMascot from "@/components/WatchdogMascot";
import OfferCard from "@/components/OfferCard";
import { offersByDateDesc } from "@/content/offers";
import { breadcrumbJsonLd } from "@/lib/seo";

const Freebies = () => (
  <>
    <Seo
      title="Crypto Freebies & Offers 2026 — Vetted Deals"
      description="Hand-picked crypto sign-up bonuses, discounts, airdrops and freebies — only from platforms CryptoWatchdog has vetted. No scams, no guaranteed-return nonsense."
      path="/freebies"
      type="website"
      jsonLd={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Freebies & Offers", path: "/freebies" }])]}
    />
    <Navbar />
    <main>
      <section className="relative overflow-hidden">
        <AuroraBackdrop
          accent="#16C784"
          variant="hero"
          imagePrompt="a friendly chrome robot guardian dog holding a glowing gift box with golden crypto coins spilling out, emerald and gold volumetric light, dark cinematic background, ultra detailed, joyful"
          imageSeed={41}
        />
        <SectionWrapper className="pb-12 pt-32 md:pt-40">
          <div className="grid items-center gap-8 md:grid-cols-5">
            <div className="md:col-span-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-rating-green/30 bg-rating-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rating-green backdrop-blur">
                <Gift className="h-4 w-4" /> Daily & ongoing
              </span>
              <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
                Crypto freebies &amp; offers — <span className="bg-gradient-to-r from-rating-green to-primary bg-clip-text text-transparent">vetted only</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Bonuses, discounts, airdrops and freebies — but <strong>only</strong> from platforms we've actually
                audited. We don't list deals from red-rated platforms, and we never promise guaranteed returns. Always
                confirm the current terms on the provider's site.
              </p>
            </div>
            <div className="hidden md:col-span-2 md:block">
              <div className="cw-float mx-auto w-56"><WatchdogMascot mood="approve" title="Vetted offers" /></div>
            </div>
          </div>
        </SectionWrapper>
      </section>

      <SectionWrapper>
        <div className="mb-6 flex items-center gap-2 text-rating-green">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">Currently live</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offersByDateDesc.map((o) => <OfferCard key={o.id} offer={o} />)}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card/60 p-6 text-sm text-muted-foreground backdrop-blur">
          <p className="font-semibold text-foreground">How we choose offers</p>
          <p className="mt-2">
            Every offer here points to a platform we've reviewed. Some links are affiliate links — if you sign up through
            them we may earn a commission at no extra cost to you, which keeps CryptoWatchdog independent and free. That
            never changes our ratings: we don't list offers for platforms rated red, and you'll always find the honest
            review one click away. See our <Link to="/about" className="text-primary hover:underline">full disclosure</Link>.
          </p>
        </div>
      </SectionWrapper>
    </main>
    <Footer />
  </>
);

export default Freebies;
