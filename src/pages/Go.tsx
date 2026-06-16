import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getAffiliate } from "@/content";
import { trackAffiliateClick } from "@/lib/analytics";

/**
 * Affiliate click redirector. All affiliate CTAs point at /go/:id so links are
 * centralised (swap in one place), cloaked from crawlers, and counted. Fires a
 * GA4 affiliate_click event, then redirects to the affiliate URL (or the brand
 * homepage as a fallback when no program is signed up yet).
 */
const Go = () => {
  const { id } = useParams<{ id: string }>();
  const aff = id ? getAffiliate(id) : null;
  const dest = aff ? aff.affiliateUrl || aff.homepage : null;

  useEffect(() => {
    if (!aff) return;
    trackAffiliateClick(aff.id, aff.brand, !!aff.affiliateUrl);
    if (dest) window.location.replace(dest);
  }, [aff, dest]);

  if (!aff) return <Navigate to="/reviews" replace />;
  if (!dest) return <Navigate to={`/reviews/${aff.reviewSlug}`} replace />;

  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center text-muted-foreground">
      <p>
        Redirecting to {aff.brand}…<br />
        <a href={dest} rel="sponsored nofollow noopener" className="text-primary underline">Continue</a>
      </p>
    </div>
  );
};

export default Go;
