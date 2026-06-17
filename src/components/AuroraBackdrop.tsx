// Cinematic animated backdrop: drifting aurora blobs + parallax grid + floating
// particles. GPU-friendly (transform/opacity only) and respects reduced-motion.
// `variant="page"` is a subtle site-wide layer; `variant="hero"` is dramatic.

interface Props {
  accent?: string;      // hex, the lead colour for the scene
  variant?: "page" | "hero";
  className?: string;
}

const PARTICLES = [
  { l: "12%", t: "22%", s: 5, d: "0s" },
  { l: "82%", t: "16%", s: 4, d: "1.2s" },
  { l: "68%", t: "60%", s: 6, d: "2.1s" },
  { l: "26%", t: "72%", s: 4, d: "0.6s" },
  { l: "47%", t: "30%", s: 3, d: "3s" },
  { l: "90%", t: "48%", s: 5, d: "1.8s" },
  { l: "6%", t: "54%", s: 4, d: "2.6s" },
  { l: "55%", t: "82%", s: 5, d: "0.9s" },
];

const AuroraBackdrop = ({ accent = "#4F8BFF", variant = "hero", className }: Props) => {
  const hero = variant === "hero";
  const o = hero ? 1 : 0.5;
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className ?? ""}`} aria-hidden>
      {/* deep base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />

      {/* aurora blobs */}
      <div
        className="cw-aurora-1 absolute -left-[12%] -top-[18%] h-[42rem] w-[42rem] rounded-full blur-[120px]"
        style={{ background: accent, opacity: 0.28 * o }}
      />
      <div
        className="cw-aurora-2 absolute right-[-10%] top-[8%] h-[34rem] w-[34rem] rounded-full blur-[120px]"
        style={{ background: "#16C784", opacity: 0.18 * o }}
      />
      <div
        className="cw-aurora-3 absolute bottom-[-20%] left-[28%] h-[40rem] w-[40rem] rounded-full blur-[140px]"
        style={{ background: "#8B5CF6", opacity: 0.16 * o }}
      />

      {/* parallax grid */}
      <div
        className="cw-gridpan absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 35%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 78%)",
        }}
      />

      {/* floating particles */}
      {hero &&
        PARTICLES.map((p, i) => (
          <span
            key={i}
            className="cw-float absolute rounded-full"
            style={{
              left: p.l,
              top: p.t,
              height: p.s,
              width: p.s,
              background: accent,
              boxShadow: `0 0 12px 2px ${accent}`,
              animationDelay: p.d,
            }}
          />
        ))}

      {/* vignette + top fade so content stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background))_92%)]" />
    </div>
  );
};

export default AuroraBackdrop;
