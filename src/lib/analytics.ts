// Lightweight, free analytics. Wraps Google Analytics 4 (gtag) when a
// measurement id is configured; otherwise no-ops. Used for traffic + affiliate
// click tracking so we can see what converts.
//
// Measurement ID can be overridden via VITE_GA_MEASUREMENT_ID in the build env;
// otherwise it falls back to the live CryptoWatchdog GA4 property below.

export const GA_MEASUREMENT_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) || "G-E7H3P0PNK6";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialised = false;

export function initAnalytics(): void {
  if (initialised || !GA_MEASUREMENT_ID || typeof document === "undefined") return;
  initialised = true;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: true });
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window !== "undefined" && window.gtag) window.gtag("event", name, params);
}

// Fired when a reader clicks an affiliate CTA. `monetised` flags whether we
// actually had an affiliate link (vs leaking a click with no program signed up).
export function trackAffiliateClick(id: string, brand: string, monetised: boolean): void {
  trackEvent("affiliate_click", {
    affiliate_id: id,
    affiliate_brand: brand,
    monetised,
  });
}
