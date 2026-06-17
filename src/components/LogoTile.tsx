import { useState } from "react";

// Brand logo tile: tries the real company logo (Clearbit, keyless) and falls
// back to a premium gradient monogram so a box is never broken or empty.

interface Props {
  name: string;
  domain: string;
  accent?: string;
  size?: number; // px
  rounded?: string;
  className?: string;
}

const LogoTile = ({ name, domain, accent = "#4F8BFF", size = 56, rounded = "rounded-2xl", className }: Props) => {
  const [ok, setOk] = useState(true);
  const initials = name.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-white/10 ${rounded} ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: ok ? "rgba(255,255,255,0.96)" : `linear-gradient(135deg, ${accent}, ${accent}99)`,
      }}
    >
      {ok ? (
        <img
          src={`https://logo.clearbit.com/${domain}?size=128`}
          alt={`${name} logo`}
          loading="lazy"
          onError={() => setOk(false)}
          className="h-full w-full object-contain p-2"
        />
      ) : (
        <span className="font-heading font-bold text-white" style={{ fontSize: size * 0.34 }}>{initials}</span>
      )}
    </div>
  );
};

export default LogoTile;
