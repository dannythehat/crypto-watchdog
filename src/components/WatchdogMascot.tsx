// CryptoWatchdog brand mascot — the real Doberman watchdog.
// Renders the official brand image in a framed, glowing portrait. Keeps the
// original props (mood/className/title) so every existing call site swaps over
// at once. `mood` only tints the glow/ring now (approve=green, caution=amber,
// alert=red, scan=blue). If the image fails to load it falls back to a clean
// shield mark so a hero is never broken.
//
// NOTE: brand image is currently served from the legacy Supabase bucket. Once
// Danny sends a transparent PNG we self-host it — just change BRAND_IMG.

import { useState } from "react";
import { Shield } from "lucide-react";

export type MascotMood = "approve" | "caution" | "alert" | "scan";

const BRAND_IMG =
  "https://csuxjmfbwmkxiegfpljm.supabase.co/storage/v1/object/public/blog-images/organization-27129/1776712114820_cryptowatchdog.jpg";

const RING: Record<MascotMood, string> = {
  approve: "#16C784",
  caution: "#F5A524",
  alert: "#F23F52",
  scan: "#4F8BFF",
};

interface Props {
  mood?: MascotMood;
  className?: string;
  title?: string;
}

const WatchdogMascot = ({ mood = "scan", className, title }: Props) => {
  const [ok, setOk] = useState(true);
  const ring = RING[mood];

  return (
    <div className={`relative aspect-square w-full ${className ?? ""}`} title={title ?? "CryptoWatchdog"}>
      {/* glow */}
      <div className="pointer-events-none absolute inset-0 rounded-[28%] blur-2xl" style={{ background: ring, opacity: 0.28 }} />
      <div
        className="relative h-full w-full overflow-hidden rounded-[28%] border-2 bg-card/60 shadow-xl backdrop-blur"
        style={{ borderColor: `${ring}66` }}
      >
        {ok ? (
          <img
            src={BRAND_IMG}
            alt={title ?? "CryptoWatchdog mascot"}
            loading="lazy"
            onError={() => setOk(false)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
            <Shield className="h-1/3 w-1/3" style={{ color: ring }} />
            <span className="font-heading text-xs font-bold text-muted-foreground">CryptoWatchdog</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchdogMascot;
