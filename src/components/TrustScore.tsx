import { cn } from "@/lib/utils";

interface Props {
  score: number;
  size?: "sm" | "lg";
  className?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 70) return "text-rating-green";
  if (score >= 40) return "text-rating-orange";
  return "text-rating-red";
};

const getScoreBg = (score: number) => {
  if (score >= 70) return "bg-rating-green/10 border-rating-green/30";
  if (score >= 40) return "bg-rating-orange/10 border-rating-orange/30";
  return "bg-rating-red/10 border-rating-red/30";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 50) return "Mixed";
  if (score >= 40) return "Caution";
  return "Avoid";
};

const TrustScore = ({ score, size = "sm", className }: Props) => {
  const isLg = size === "lg";

  return (
    <div className={cn("flex flex-col items-center gap-1 rounded-lg border p-3", getScoreBg(score), className)}>
      <span className={cn("font-heading font-bold", getScoreColor(score), isLg ? "text-4xl" : "text-2xl")}>
        {score}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        / 100
      </span>
      <span className={cn("text-xs font-medium", getScoreColor(score))}>
        {getScoreLabel(score)}
      </span>
    </div>
  );
};

export default TrustScore;
