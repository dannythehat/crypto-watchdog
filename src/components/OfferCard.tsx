import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { type Offer, KIND_META } from "@/content/offers";
import { getAffiliateByReviewSlug, isMonetisable, getReview } from "@/content";
import { trackEvent } from "@/lib/analytics";

const isFresh = (iso: string) => (Date.now() - new Date(iso).getTime()) / 86400000 <= 14;

const OfferCard = ({ offer }: { offer: Offer }) => {
  const meta = KIND_META[offer.kind];
  const aff = offer.reviewSlug ? getAffiliateByReviewSlug(offer.reviewSlug) : null;
  const monetisable = isMonetisable(aff);
  const review = offer.reviewSlug ? getReview(offer.reviewSlug) : null;

  const href = monetisable ? `/go/${aff!.id}` : offer.reviewSlug ? `/reviews/${offer.reviewSlug}` : offer.externalUrl;
  const external = monetisable || !!offer.externalUrl;

  const CTA = (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
      Claim offer {external ? <ExternalLink className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
    </span>
  );

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-xs font-semibold ${meta.tone}`}>
          <span>{meta.emoji}</span> {meta.label}
        </span>
        {(offer.hot || isFresh(offer.addedAt)) && (
          <span className="rounded-full bg-rating-red/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rating-red">
            {offer.hot ? "🔥 Hot" : "New"}
          </span>
        )}
      </div>

      <h3 className="relative mt-3 font-heading text-base font-semibold leading-snug">{offer.title}</h3>
      <div className="relative mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{offer.platform}</span>
        {review?.trust_score != null && (
          <span className={`font-semibold ${review.trust_score >= 70 ? "text-rating-green" : review.trust_score >= 40 ? "text-rating-orange" : "text-rating-red"}`}>
            Trust {review.trust_score}/100
          </span>
        )}
      </div>
      <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{offer.blurb}</p>

      <div className="relative mt-4 flex items-center justify-between">
        {href ? (
          external ? (
            <a href={href} target="_blank" rel="sponsored noopener noreferrer"
              onClick={() => trackEvent("offer_click", { offer_id: offer.id, platform: offer.platform, monetisable })}>
              {CTA}
            </a>
          ) : (
            <Link to={href} onClick={() => trackEvent("offer_click", { offer_id: offer.id, platform: offer.platform })}>{CTA}</Link>
          )
        ) : <span />}
        {offer.reviewSlug && (
          <Link to={`/reviews/${offer.reviewSlug}`} className="text-xs text-muted-foreground hover:text-foreground">Read review</Link>
        )}
      </div>
    </article>
  );
};

export default OfferCard;
