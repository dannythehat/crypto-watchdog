// CryptoWatchdog brand mascot — a friendly robot guardian "dog".
// Pure SVG so it stays razor-sharp at any size with zero network cost.
// Moods drive the accent colour, the eyes, and the status badge:
//   approve → green thumbs-up vibe (sites we endorse)
//   caution → amber raised brow
//   alert   → red, shaking-its-head "no" (scams)
//   scan    → blue, neutral investigator

export type MascotMood = "approve" | "caution" | "alert" | "scan";

const PALETTE: Record<MascotMood, { a: string; b: string; badge: string }> = {
  approve: { a: "#16C784", b: "#0E9F6E", badge: "check" },
  caution: { a: "#F5A524", b: "#D98A0B", badge: "bang" },
  alert: { a: "#F23F52", b: "#C8283A", badge: "cross" },
  scan: { a: "#4F8BFF", b: "#2E6BFF", badge: "scan" },
};

interface Props {
  mood?: MascotMood;
  className?: string;
  title?: string;
}

const WatchdogMascot = ({ mood = "scan", className, title }: Props) => {
  const { a, b, badge } = PALETTE[mood];
  const uid = `m-${mood}`;

  return (
    <svg
      viewBox="0 0 240 240"
      role="img"
      aria-label={title ?? `CryptoWatchdog mascot — ${mood}`}
      className={className}
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A3346" />
          <stop offset="1" stopColor="#161C28" />
        </linearGradient>
        <linearGradient id={`${uid}-accent`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={a} stopOpacity="0.55" />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ambient glow */}
      <circle cx="120" cy="120" r="110" fill={`url(#${uid}-glow)`} />

      {/* ears */}
      <g filter={`url(#${uid}-soft)`}>
        <path d="M64 70 L52 28 L96 52 Z" fill={`url(#${uid}-body)`} />
        <path d="M176 70 L188 28 L144 52 Z" fill={`url(#${uid}-body)`} />
        <path d="M70 62 L62 38 L88 52 Z" fill={`url(#${uid}-accent)`} opacity="0.85" />
        <path d="M170 62 L178 38 L152 52 Z" fill={`url(#${uid}-accent)`} opacity="0.85" />
      </g>

      {/* antenna */}
      <line x1="120" y1="44" x2="120" y2="20" stroke="#3A465C" strokeWidth="5" strokeLinecap="round" />
      <circle cx="120" cy="16" r="7" fill={`url(#${uid}-accent)`}>
        <animate attributeName="opacity" values="1;0.45;1" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* head */}
      <rect x="50" y="52" width="140" height="124" rx="40" fill={`url(#${uid}-body)`} filter={`url(#${uid}-soft)`} />
      <rect x="50" y="52" width="140" height="124" rx="40" fill="none" stroke={a} strokeOpacity="0.4" strokeWidth="2" />

      {/* visor */}
      <rect x="68" y="86" width="104" height="56" rx="26" fill="#0C111B" />
      <rect x="68" y="86" width="104" height="56" rx="26" fill="none" stroke={a} strokeOpacity="0.5" strokeWidth="2" />

      {/* eyes — expression per mood */}
      {mood === "approve" && (
        <g stroke={`url(#${uid}-accent)`} strokeWidth="7" strokeLinecap="round" fill="none">
          <path d="M88 120 q10 -16 22 0" />
          <path d="M130 120 q10 -16 22 0" />
        </g>
      )}
      {mood === "scan" && (
        <g fill={`url(#${uid}-accent)`}>
          <circle cx="99" cy="114" r="9" />
          <circle cx="141" cy="114" r="9" />
        </g>
      )}
      {mood === "caution" && (
        <g fill={`url(#${uid}-accent)`}>
          <circle cx="99" cy="116" r="9" />
          <circle cx="141" cy="116" r="9" />
          <rect x="86" y="98" width="26" height="5" rx="2.5" transform="rotate(-12 99 100)" />
          <rect x="128" y="98" width="26" height="5" rx="2.5" transform="rotate(12 141 100)" />
        </g>
      )}
      {mood === "alert" && (
        <g stroke={`url(#${uid}-accent)`} strokeWidth="7" strokeLinecap="round">
          <line x1="90" y1="108" x2="108" y2="122" />
          <line x1="108" y1="108" x2="90" y2="122" />
          <line x1="132" y1="108" x2="150" y2="122" />
          <line x1="150" y1="108" x2="132" y2="122" />
        </g>
      )}

      {/* snout */}
      <rect x="104" y="148" width="32" height="18" rx="9" fill="#0C111B" />
      <circle cx="120" cy="157" r="5" fill={`url(#${uid}-accent)`} />

      {/* shield emblem on forehead */}
      <path d="M120 60 l16 6 v10 c0 10 -7 16 -16 20 c-9 -4 -16 -10 -16 -20 v-10 z" fill={`url(#${uid}-accent)`} opacity="0.95" />
      <path d="M113 73 l5 5 l9 -10" fill="none" stroke="#0C111B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* status badge */}
      <g transform="translate(168 150)">
        <circle r="26" fill={`url(#${uid}-accent)`} filter={`url(#${uid}-soft)`} />
        <circle r="26" fill="none" stroke="#0C111B" strokeOpacity="0.2" strokeWidth="2" />
        {badge === "check" && (
          <path d="M-11 1 l7 8 l15 -17" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {badge === "cross" && (
          <g stroke="#fff" strokeWidth="5" strokeLinecap="round">
            <line x1="-9" y1="-9" x2="9" y2="9" />
            <line x1="9" y1="-9" x2="-9" y2="9" />
          </g>
        )}
        {badge === "bang" && (
          <g fill="#fff">
            <rect x="-3" y="-13" width="6" height="16" rx="3" />
            <circle cx="0" cy="10" r="3.5" />
          </g>
        )}
        {badge === "scan" && (
          <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round">
            <circle cx="-3" cy="-3" r="9" />
            <line x1="4" y1="4" x2="12" y2="12" />
          </g>
        )}
      </g>
    </svg>
  );
};

export default WatchdogMascot;
