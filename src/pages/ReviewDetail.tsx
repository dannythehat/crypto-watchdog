import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import RatingBadge from "@/components/RatingBadge";
import TrustScore from "@/components/TrustScore";
import { Button } from "@/components/ui/button";
import { useReview } from "@/hooks/useReviews";

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

  return (
    <>
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

            <p className="mt-6 text-lg text-muted-foreground">{review.summary}</p>

            {review.website_url && (
              <a
                href={review.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Visit website <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {/* Verdict */}
            {review.verdict && (
              <div className={`mt-8 rounded-lg border-2 p-6 ${
                review.rating === "green" ? "border-rating-green/30 bg-rating-green/5" :
                review.rating === "red" ? "border-rating-red/30 bg-rating-red/5" :
                "border-rating-orange/30 bg-rating-orange/5"
              }`}>
                <h2 className="font-heading text-xl font-semibold">Our Verdict</h2>
                <p className="mt-3 text-muted-foreground">{review.verdict}</p>
              </div>
            )}

            {/* Audit Details */}
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {review.deposit_info && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-heading font-semibold">📥 Deposits</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{review.deposit_info}</p>
                </div>
              )}
              {review.withdrawal_info && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-heading font-semibold">📤 Withdrawals</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{review.withdrawal_info}</p>
                </div>
              )}
              {review.fees_info && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-heading font-semibold">💸 Fees</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{review.fees_info}</p>
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
