import { Newspaper } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import AuroraBackdrop from "@/components/AuroraBackdrop";
import WatchdogMascot from "@/components/WatchdogMascot";
import NewsCard from "@/components/NewsCard";
import { useLiveNews } from "@/hooks/useLiveNews";
import { breadcrumbJsonLd } from "@/lib/seo";

const News = () => {
  const { items, live } = useLiveNews();
  return (
  <>
    <Seo
      title="Latest Crypto News & Safety Take — CryptoWatchdog"
      description="The crypto headlines that matter, with a safety-first 'Watchdog take' on each. Updated regularly so you stay ahead of the market — and the scammers."
      path="/news"
      type="website"
      jsonLd={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "News", path: "/news" }])]}
    />
    <Navbar />
    <main>
      <section className="relative overflow-hidden">
        <AuroraBackdrop
          accent="#4F8BFF"
          variant="hero"
          imagePrompt="a futuristic holographic crypto news hub with floating glowing headlines and a sleek robotic watchdog observing the data streams, electric blue volumetric light, dark cinematic background, ultra detailed"
          imageSeed={51}
        />
        <SectionWrapper className="pb-12 pt-32 md:pt-40">
          <div className="grid items-center gap-8 md:grid-cols-5">
            <div className="md:col-span-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">
                <Newspaper className="h-4 w-4" /> Updated regularly
              </span>
              <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
                Crypto news, with a <span className="bg-gradient-to-r from-primary to-[#5B8DEF] bg-clip-text text-transparent">safety lens</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                The headlines that move the market — and what they mean for <em>your</em> safety. We add a short
                "Watchdog take" wherever there's a risk worth flagging.
              </p>
            </div>
            <div className="hidden md:col-span-2 md:block">
              <div className="cw-float mx-auto w-56"><WatchdogMascot mood="scan" title="Crypto news" /></div>
            </div>
          </div>
        </SectionWrapper>
      </section>

      <SectionWrapper>
        {live && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rating-green/30 bg-rating-green/10 px-3 py-1 text-xs font-semibold text-rating-green">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rating-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rating-green" />
            </span>
            Live feed
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => <NewsCard key={item.id} item={item} />)}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Headlines link to original sources. CryptoWatchdog summarises and adds safety context; we don't republish full articles.
        </p>
      </SectionWrapper>
    </main>
    <Footer />
    </>
  );
};

export default News;
