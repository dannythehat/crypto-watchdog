import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

const config = {
  green: {
    label: "Seems Legit",
    icon: ShieldCheck,
    className: "bg-rating-green/10 text-rating-green border-rating-green/30",
  },
  orange: {
    label: "On The Fence",
    icon: ShieldAlert,
    className: "bg-rating-orange/10 text-rating-orange border-rating-orange/30",
  },
  red: {
    label: "Untrusted",
    icon: ShieldX,
    className: "bg-rating-red/10 text-rating-red border-rating-red/30",
  },
} as const;

interface Props {
  rating: "green" | "orange" | "red";
  size?: "sm" | "md";
  className?: string;
}

const RatingBadge = ({ rating, size = "sm", className }: Props) => {
  const c = config[rating];
  const Icon = c.icon;
  const isMd = size === "md";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        isMd ? "px-3 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs",
        c.className,
        className
      )}
    >
      <Icon className={isMd ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {c.label}
    </span>
  );
};

export default RatingBadge;
