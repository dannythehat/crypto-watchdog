import { useState } from "react";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";
import { BRAND_IMG } from "./WatchdogMascot";

interface Props {
  className?: string;
}

const Logo = ({ className }: Props) => {
  const [ok, setOk] = useState(true);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg ring-1 ring-primary/30">
        {ok ? (
          <img src={BRAND_IMG} alt="CryptoWatchdog" onError={() => setOk(false)} className="h-full w-full object-cover" />
        ) : (
          <Shield className="h-6 w-6 text-primary" />
        )}
      </span>
      <span className="font-heading text-lg font-bold tracking-tight">
        Crypto<span className="text-primary">Watchdog</span>
      </span>
    </div>
  );
};

export default Logo;
