import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { getAffiliate, getAffiliateByReviewSlug, isMonetisable, type Affiliate } from "@/content";
import { cn } from "@/lib/utils";

interface Props {
  id?: string;
  reviewSlug?: string;
  label?: string;
  className?: string;
  variant?: "button" | "link";
}

/**
 * Renders an affiliate call-to-action that routes through /go/:id (tracked +
 * cloaked). Shows the required disclosure. Returns null for blocked
 * (e.g. red-rated) platforms so we never monetise scams. Falls back to a plain
 * homepage link when no program is signed up yet, so the CTA still works.
 */
const AffiliateCTA = ({ id, reviewSlug, label, className, variant = "button" }: Props) => {
  const aff: Affiliate | null = id ? getAffiliate(id) : reviewSlug ? getAffiliateByReviewSlug(reviewSlug) : null;
  if (!isMonetisable(aff)) return null;

  const text = label || (aff.offerText ? aff.offerText : `Visit ${aff.brand}`);
  const buttonCls = "inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90";
  const linkCls = "inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-2 hover:opacity-80";

  return (
    <div className={cn("not-prose my-4", className)}>
      <Link to={`/go/${aff.id}`} rel="sponsored nofollow" className={variant === "button" ? buttonCls : linkCls}>
        {text} <ExternalLink className="h-4 w-4" />
      </Link>
      <p className="mt-2 text-xs text-muted-foreground">{aff.disclosure}</p>
    </div>
  );
};

export default AffiliateCTA;
