import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Gift, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import RatingBadge from "@/components/RatingBadge";
import { getReview, getAffiliateByReviewSlug, isMonetisable } from "@/content";
import { trackEvent } from "@/lib/analytics";

type Variant = "endorsed" | "caution" | "avoid";

const STYLE: Record<Variant, { ring: string; glow: string; Icon: typeof ShieldCheck; hex: string }> = {
  endorsed: { ring: "border-rating-green/30 hover:border-rating-green/60", glow: "bg-rating-green/10", Icon: ShieldCheck, hex: "#16C784" },
  caution: { ring: "border-rating-orange/30 hover:border-rating-orange/60", glow: "bg-rating-orange/10", Icon: ShieldAlert, hex: "#F5A524" },
  avoid: { ring: "border-rating-red/30 hover:border-rating-red/60", glow: "bg-rating-red/10", Icon: ShieldX, hex: "#F23F52" },
};

const ringColor = (n: number) => (n >= 75 ? "#16C784" : n >= 50 ? "#F5A524" : "#F23F52");

const toExcerpt = (s = "", n = 130): string => {
  const plain = s
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > n ? plain.slice(0, n - 1).trimEnd() + "…" : plain;
};

const TrustRing = ({ score }: { score: number | null }) => {
  if (score == null) return null;
  const r = 24, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(100, score));
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 56 56" className="h-16 w-16 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={ringColor(score)} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-heading text-base font-bold text-foreground">{score}</span>
        <span className="text-[8px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
};

const LogoTile = ({ name, logoUrl, accentHex }: { name: string; logoUrl?: string | null; accentHex: string }) => {
  const [ok, setOk] = useState(true);
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background/70">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: accentHex }} />
      {logoUrl && ok ? (
        <img src={logoUrl} alt={`${name} logo`} loading="lazy" onError={() => setOk(false)} className="relative h-full w-full object-contain p-1.5" />
      ) : (
        <span className="relative font-heading text-xl font-bold" style={{ color: accentHex }}>{initial}</span>
      )}
    </div>
  );
};

const PlatformCard = ({ slug, variant }: { slug: string; variant: Variant }) => {
  const review = getReview(slug);
  if (!review) return null;
  const s = STYLE[variant];
  const aff = getAffiliateByReviewSlug(slug);
  const showAffiliate = variant !== "avoid" && isMonetisable(aff);
  const offer = showAffiliate && aff?.offerText ? aff.offerText : null;
  const kind = review.categories?.name || null;

  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card/60 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl ${s.ring}`}>
      <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl ${s.glow}`} />

      <div className="relative flex items-start gap-3">
        <LogoTile name={review.name} logoUrl={review.logo_url} accentHex={s.hex} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-lg font-semibold">{review.name}</h3>
          {kind && <span className="text-xs text-muted-foreground">{kind}</span>}
          <div className="mt-1.5">{review.rating && <RatingBadge rating={review.rating as "green" | "orange" | "red"} />}</div>
        </div>
        <TrustRing score={review.trust_score} />
      </div>

      <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">{toExcerpt(review.summary || "")}</p>

      {offer && (
        <div className="relative mt-3 flex-1 rounded-xl border border-rating-green/20 bg-rating-green/5 p-3">
          <p className="flex items-start gap-1.5 text-xs leading-snug text-foreground">
            <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rating-green" />
            <span><span className="font-semibold">Offer:</span> {offer}</span>
          </p>
        </div>
      )}

      <div className="relative mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <Link to={`/reviews/${slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Read review <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {showAffiliate && (
          <a
            href={`/go/${aff!.id}`}
            onClick={() => trackEvent("affiliate_click", { affiliate_id: aff!.id, placement: "hub_card", review_slug: slug })}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-rating-green to-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {offer ? <Gift className="h-3.5 w-3.5" /> : <ExternalLink className="h-3 w-3" />}
            {offer ? "Claim offer" : "Visit site"}
          </a>
        )}
      </div>
    </article>
  );
};

export default PlatformCard;
