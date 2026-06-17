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
      {ok ? (
        <img
          src={BRAND_IMG}
          alt="CryptoWatchdog"
          onError={() => setOk(false)}
          className="h-9 w-9 object-contain"
        />
      ) : (
        <Shield className="h-7 w-7 text-primary" />
      )}
      <span className="font-heading text-lg font-bold tracking-tight">
        Crypto<span className="text-primary">Watchdog</span>
      </span>
    </div>
  );
};

export default Logo;
