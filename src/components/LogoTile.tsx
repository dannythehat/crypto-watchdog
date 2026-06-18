import { useState } from "react";

// Brand logo tile: tries an explicit logo URL, then the company's logo via
// Clearbit (keyless, from the domain), then a premium gradient monogram — so a
// box is never broken, empty, or a bare letter when a real mark is available.

interface Props {
  name: string;
  domain?: string | null;
  logoUrl?: string | null;
  accent?: string;
  size?: number; // px
  rounded?: string;
  className?: string;
}

const LogoTile = ({ name, domain, logoUrl, accent = "#4F8BFF", size = 56, rounded = "rounded-2xl", className }: Props) => {
  const sources = [logoUrl || undefined, domain ? `https://logo.clearbit.com/${domain}?size=128` : undefined].filter(Boolean) as string[];
  const [stage, setStage] = useState(0);
  const src = sources[stage];
  const initials = name.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-white/10 ${rounded} ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: src ? "rgba(255,255,255,0.96)" : `linear-gradient(135deg, ${accent}, ${accent}99)`,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={`${name} logo`}
          loading="lazy"
          onError={() => setStage((s) => s + 1)}
          className="h-full w-full object-contain p-2"
        />
      ) : (
        <span className="font-heading font-bold text-white" style={{ fontSize: size * 0.34 }}>{initials}</span>
      )}
    </div>
  );
};

export default LogoTile;
