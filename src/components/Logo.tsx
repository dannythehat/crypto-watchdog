import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

interface Props {
  className?: string;
}

const Logo = ({ className }: Props) => (
  <div className={cn("flex items-center gap-2", className)}>
    <Shield className="h-7 w-7 text-primary" />
    <span className="font-heading text-lg font-bold tracking-tight">
      Crypto<span className="text-primary">Watchdog</span>
    </span>
  </div>
);

export default Logo;
