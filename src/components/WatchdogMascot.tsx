// CryptoWatchdog brand mascot — the real Doberman watchdog logo (transparent
// PNG, self-hosted in /public). Keeps the original props (mood/className/title)
// so every call site swaps over at once. `mood` only tints the soft glow behind
// the logo (approve=green, caution=amber, alert=red, scan=blue).

import { useState } from "react";
import { Shield } from "lucide-react";

export type MascotMood = "approve" | "caution" | "alert" | "scan";

export const BRAND_IMG = "/cryptowatchdog-logo.png";

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
      {/* soft glow behind the transparent logo */}
      <div className="pointer-events-none absolute inset-[8%] rounded-full blur-3xl" style={{ background: ring, opacity: 0.22 }} />
      {ok ? (
        <img
          src={BRAND_IMG}
          alt={title ?? "CryptoWatchdog mascot"}
          loading="lazy"
          onError={() => setOk(false)}
          className="relative h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        />
      ) : (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 text-center">
          <Shield className="h-1/3 w-1/3" style={{ color: ring }} />
          <span className="font-heading text-xs font-bold text-muted-foreground">CryptoWatchdog</span>
        </div>
      )}
    </div>
  );
};

export default WatchdogMascot;
