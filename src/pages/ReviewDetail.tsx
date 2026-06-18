import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import RatingBadge from "@/components/RatingBadge";
import TrustScore from "@/components/TrustScore";
import Seo from "@/components/Seo";
import AffiliateCTA from "@/components/AffiliateCTA";
import Markdown from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { useReview } from "@/hooks/useReviews";
import { getAffiliateByReviewSlug, isMonetisable } from "@/content";
import { breadcrumbJsonLd, reviewJsonLd, faqJsonLd } from "@/lib/seo";

const ReviewDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: review, isLoading } = useReview(slug ?? "");

  if (isLoading) {
    return (
      <>
        <Navbar />
        <SectionWrapper className="pt-28">
          <div className="mx-auto max-w-3xl animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-12 w-full rounded bg-muted" />
            <div className="h-64 w-full rounded bg-muted" />
          </div>
        </SectionWrapper>
      </>
    );
  }

  if (!review) {
    return (
      <>
        <Navbar />
        <SectionWrapper className="pt-28 text-center">
          <h1 className="text-3xl">Review not found</h1>
          <Button asChild className="mt-4">
            <Link to="/reviews">Back to Reviews</Link>
          </Button>
        </SectionWrapper>
        <Footer />
      </>
    );
  }

  const auditData = review.detailed_audit as Record<string, any> | null;
  const rc = ((review as any).rich_content || {}) as Record<string, any>;
  const rcFaqs = Array.isArray(rc.faq) ? rc.faq.map((f: any) => ({ q: f.question || f.q, a: f.answer || f.a })).filter((f: any) => f.q && f.a) : [];
  const path = `/reviews/${review.slug}`;

  return (
    <>
      <Seo
        title={(review as any).meta_title || `${review.name} Review`}
        description={(review as any).meta_description || review.summary || undefined}
        path={path}
        image={review.logo_url || (review as any).social_image_url}
        type="article"
        jsonLd={[
          reviewJsonLd({
            name: review.name,
            description: review.summary || undefined,
            path,
            rating: review.rating,
            trustScore: review.trust_score,
            image: review.logo_url || (review as any).social_image_url,
            publishedAt: (review as any).published_at,
            modifiedAt: (review as any).updated_at,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Reviews", path: "/reviews" },
            { name: review.name, path },
          ]),
          faqJsonLd(rcFaqs) || {},
        ]}
      />
      <Navbar />
      <main>
        <SectionWrapper className="pt-28 md:pt-36">
          <div className="mx-auto max-w-3xl">
            <Link to="/reviews" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Reviews
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl">{review.name}</h1>
                {(review as any).categories?.name && (
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {(review as any).categories.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {review.trust_score != null && (
                  <TrustScore score={review.trust_score} size="lg" />
                )}
                <RatingBadge rating={review.rating as "green" | "orange" | "red"} size="md" />
              </div>
            </div>

            <div className="mt-6 max-w-none">
              <Markdown content={review.summary || ""} />
            </div>

            {isMonetisable(getAffiliateByReviewSlug(review.slug)) ? (
              <AffiliateCTA reviewSlug={review.slug} label={`Visit ${review.name}`} />
            ) : (
              review.website_url && (
                <a
                  href={review.website_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  Visit website <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )
            )}

            {/* Verdict */}
            {review.verdict && (
              <div className={`mt-8 rounded-lg border-2 p-6 ${
                review.rating === "green" ? "border-rating-green/30 bg-rating-green/5" :
                review.rating === "red" ? "border-rating-red/30 bg-rating-red/5" :
                "border-rating-orange/30 bg-rating-orange/5"
              }`}>
                <h2 className="font-heading text-xl font-semibold">Our Verdict</h2>
                <div className="mt-3 max-w-none"><Markdown content={review.verdict || ""} /></div>
              </div>
            )}

            {/* Audit Details */}
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {review.deposit_info && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-heading font-semibold">📥 Deposits</h3>
                  <div className="mt-2 text-sm"><Markdown content={review.deposit_info || ""} /></div>
                </div>
              )}
              {review.withdrawal_info && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-heading font-semibold">📤 Withdrawals</h3>
                  <div className="mt-2 text-sm"><Markdown content={review.withdrawal_info || ""} /></div>
                </div>
              )}
              {review.fees_info && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-heading font-semibold">💸 Fees</h3>
                  <div className="mt-2 text-sm"><Markdown content={review.fees_info || ""} /></div>
                </div>
              )}
              {review.interview_url && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-heading font-semibold">🎙️ Interview</h3>
                  <a href={review.interview_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    Watch interview <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {review.video_url && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-heading font-semibold">📹 Video Review</h3>
                  <a href={review.video_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    Watch video <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Detailed Audit Breakdown */}
            {auditData && Object.keys(auditData).length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 font-heading text-2xl font-semibold">Detailed Audit</h2>
                <div className="space-y-4">
                  {Object.entries(auditData).map(([key, value]) => (
                    <div key={key} className="rounded-lg border border-border bg-card p-5">
                      <h3 className="font-heading font-semibold capitalize">{key.replace(/_/g, " ")}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {typeof value === "string" ? value : JSON.stringify(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pros & Cons */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {review.pros && review.pros.length > 0 && (
                <div>
                  <h3 className="mb-3 font-heading font-semibold text-rating-green">✅ Pros</h3>
                  <ul className="space-y-2">
                    {review.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-rating-green" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {review.cons && review.cons.length > 0 && (
                <div>
                  <h3 className="mb-3 font-heading font-semibold text-rating-red">❌ Cons</h3>
                  <ul className="space-y-2">
                    {review.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-rating-red" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Key features */}
            {Array.isArray(rc.key_features) && rc.key_features.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 font-heading text-2xl font-semibold">What you get</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {rc.key_features.map((f: any, i: number) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center gap-2">
                        {f.icon && <span className="text-xl">{f.icon}</span>}
                        <h3 className="font-heading font-semibold">{f.title}</h3>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Green / Red flags */}
            {((Array.isArray(rc.green_flags) && rc.green_flags.length > 0) || (Array.isArray(rc.red_flags) && rc.red_flags.length > 0)) && (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {Array.isArray(rc.green_flags) && rc.green_flags.length > 0 && (
                  <div className="rounded-2xl border border-rating-green/30 bg-rating-green/5 p-5">
                    <h3 className="font-heading font-semibold text-rating-green">Green flags</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {rc.green_flags.map((g: string, i: number) => <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-rating-green" />{g}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(rc.red_flags) && rc.red_flags.length > 0 && (
                  <div className="rounded-2xl border border-rating-red/30 bg-rating-red/5 p-5">
                    <h3 className="font-heading font-semibold text-rating-red">Red flags to watch</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {rc.red_flags.map((g: string, i: number) => <li key={i} className="flex items-start gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-rating-red" />{g}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Who it's for */}
            {rc.who_its_for && (
              <div className="mt-8 rounded-xl border-l-4 border-primary bg-primary/5 p-5">
                <h3 className="font-heading font-semibold">Who it's for</h3>
                <p className="mt-2 text-sm text-muted-foreground">{rc.who_its_for}</p>
              </div>
            )}

            {/* Stats */}
            {Array.isArray(rc.stats) && rc.stats.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {rc.stats.map((s: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
                    <p className="font-heading text-xl font-bold text-primary">{s.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Verify, don't trust */}
            {rc.verify_dont_trust && (
              <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                <h3 className="font-heading font-semibold text-amber-500">🔒 Verify, don't trust</h3>
                <p className="mt-2 text-sm text-muted-foreground">{rc.verify_dont_trust}</p>
              </div>
            )}

            {/* FAQ */}
            {rcFaqs.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 font-heading text-2xl font-semibold">Frequently asked questions</h2>
                <div className="space-y-3">
                  {rcFaqs.map((f: any, i: number) => (
                    <details key={i} className="group rounded-xl border border-border bg-card p-5">
                      <summary className="cursor-pointer list-none font-heading font-semibold marker:content-none"><span className="flex items-center justify-between gap-3">{f.q}<span className="text-primary transition-transform group-open:rotate-45">+</span></span></summary>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-10 rounded-lg border border-border bg-muted/50 p-5 text-xs text-muted-foreground">
              <p className="font-semibold">Disclaimer</p>
              <p className="mt-1">
                This review is based on publicly available information, community reports, and our own testing at the time of writing.
                It is not financial advice. Always do your own research before using any crypto platform. Ratings and Trust Scores can change as new information emerges.
              </p>
            </div>
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
};

export default ReviewDetail;
