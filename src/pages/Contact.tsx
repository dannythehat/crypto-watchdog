import { Link } from "react-router-dom";
import { Mail, FlagTriangleRight, Search, Mic, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { breadcrumbJsonLd } from "@/lib/seo";

const EMAIL = "dannythehat2@gmail.com";

const CARDS = [
  { icon: Search, title: "Ask us to review a platform", desc: "Seen an exchange, bot, wallet or yield platform you're not sure about? Tell us and we'll put it through the framework.", cta: "Submit a platform", to: "/submit" },
  { icon: FlagTriangleRight, title: "Report a scam or a tip-off", desc: "Lost money, spotted a fake, or have inside knowledge of something dodgy? We treat tips seriously and confidentially.", cta: `Email a tip`, href: `mailto:${EMAIL}?subject=Scam tip-off` },
  { icon: Mic, title: "Interviews & partnerships", desc: "Founder who wants to go on record, or a genuine partnership idea? We do 'under the bonnet' interviews and walkthroughs.", cta: "Email us", href: `mailto:${EMAIL}?subject=Partnership / interview` },
];

const Contact = () => (
  <>
    <Seo
      title="Contact Crypto Watchdog"
      description="Ask us to review a crypto platform, report a scam, send a tip-off, or get in touch about interviews and partnerships. We usually reply within 24–48 hours."
      path="/contact"
      type="website"
      jsonLd={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])]}
    />
    <Navbar />
    <main>
      <SectionWrapper className="pt-28 md:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <Mail className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-4xl md:text-5xl">Get in touch</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Tips, review requests, corrections, partnerships — it all reaches a real person. We usually reply within 24–48 hours.
          </p>
          <div className="mt-6">
            <Button asChild size="lg"><a href={`mailto:${EMAIL}`}>Email {EMAIL}</a></Button>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper className="bg-card">
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-3">
          {CARDS.map((c) => (
            <div key={c.title} className="flex flex-col rounded-2xl border border-border bg-background p-6">
              <c.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-heading text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.desc}</p>
              <div className="mt-4">
                {c.to ? (
                  <Button asChild variant="outline" className="w-full"><Link to={c.to}>{c.cta}</Link></Button>
                ) : (
                  <Button asChild variant="outline" className="w-full"><a href={c.href}>{c.cta}</a></Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="mx-auto max-w-3xl rounded-2xl border border-rating-red/30 bg-rating-red/5 p-6">
          <div className="flex items-start gap-4">
            <ShieldAlert className="mt-0.5 h-7 w-7 shrink-0 text-rating-red" />
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground">If you've just been scammed</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                First: stop sending money, and ignore anyone who messages you promising to "recover" your funds for an upfront fee — that's almost always a second scam. We can't recover lost crypto, and neither can anyone charging you to try. Read our honest damage-control steps in the <Link to="/warnings" className="font-medium text-primary underline underline-offset-2">scam alerts</Link> and <Link to="/scam-guides" className="font-medium text-primary underline underline-offset-2">scam guides</Link>, and report it to your local authorities.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </main>
    <Footer />
  </>
);

export default Contact;
