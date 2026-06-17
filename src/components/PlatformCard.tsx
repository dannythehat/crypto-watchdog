import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { getReview, getAffiliateByReviewSlug, isMonetisable } from "@/content";
import { trackEvent } from "@/lib/analytics";

type Variant = "endorsed" | "caution" | "avoid";

const STYLE: Record<Variant, { ring: string; glow: string; chip: string; text: string; Icon: typeof ShieldCheck; label: string; hex: string }> = {
  endorsed: { ring: "border-rating-green/30 hover:border-rating-green/60", glow: "bg-rating-green/10", chip: "bg-rating-green/15 text-rating-green", text: "text-rating-green", Icon: ShieldCheck, label: "Endorsed", hex: "#16C784" },
  caution: { ring: "border-rating-orange/30 hover:border-rating-orange/60", glow: "bg-rating-orange/10", chip: "bg-rating-orange/15 text-rating-orange", text: "text-rating-orange", Icon: ShieldAlert, label: "Caution", hex: "#F5A524" },
  avoid: { ring: "border-rating-red/30 hover:border-rating-red/60", glow: "bg-rating-red/10", chip: "bg-rating-red/15 text-rating-red", text: "text-rating-red", Icon: ShieldX, label: "Avoid", hex: "#F23F52" },
};

const toExcerpt = (s = "", n = 130): string => {
  const plain = s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > n ? plain.slice(0, n - 1).trimEnd() + "…" : plain;
};

const TrustRing = ({ score, hex }: { score: number | null; hex: string }) => {
  if (score == null) return null;
  const r = 22;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 52 52" className="h-14 w-14 -rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="5" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={hex} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-heading text-sm font-bold text-foreground">{score}</span>
        <span className="text-[8px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
};

const PlatformCard = ({ slug, variant }: { slug: string; variant: Variant }) => {
  const review = getReview(slug);
  if (!review) return null;
  const s = STYLE[variant];
  const aff = getAffiliateByReviewSlug(slug);
  const showAffiliate = variant !== "avoid" && isMonetisable(aff);
  const initial = (review.name || "?").trim().charAt(0).toUpperCase();

  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card/60 p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-xl ${s.ring}`}>
      <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl ${s.glow}`} />

      <div className="relative flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background/70">
          {review.logo_url ? (
            <img src={review.logo_url} alt={`${review.name} logo`} loading="lazy" className="h-full w-full object-contain p-1.5" />
          ) : (
            <span className="font-heading text-lg font-bold text-muted-foreground">{initial}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-heading text-base font-semibold">{review.name}</h3>
          </div>
          <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.chip}`}>
            <s.Icon className="h-3 w-3" /> {s.label}
          </span>
        </div>
        <TrustRing score={review.trust_score} hex={s.hex} />
      </div>

      <p className="relative mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{toExcerpt(review.summary || "")}</p>

      <div className="relative mt-4 flex items-center gap-2">
        <Link to={`/reviews/${slug}`} className={`inline-flex items-center gap-1 text-sm font-semibold ${s.text} hover:underline`}>
          Read review <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {showAffiliate && (
          <a
            href={`/go/${aff!.id}`}
            onClick={() => trackEvent("affiliate_click", { affiliate_id: aff!.id, placement: "hub_card", review_slug: slug })}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 rounded-lg bg-rating-green px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-rating-green/90"
          >
            Visit site <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </article>
  );
};

export default PlatformCard;
