import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import RatingBadge from "./RatingBadge";

interface Props {
  name: string;
  slug: string;
  rating: "green" | "orange" | "red";
  summary: string;
  categoryName?: string;
  websiteUrl?: string | null;
  trustScore?: number | null;
}

const ReviewCard = ({ name, slug, rating, summary, categoryName, websiteUrl, trustScore }: Props) => (
  <article className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 className="font-heading text-lg font-semibold">{name}</h3>
        {categoryName && (
          <span className="text-xs text-muted-foreground">{categoryName}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {trustScore != null && (
          <span className={`font-heading text-lg font-bold ${
            trustScore >= 70 ? "text-rating-green" : trustScore >= 40 ? "text-rating-orange" : "text-rating-red"
          }`}>
            {trustScore}<span className="text-xs text-muted-foreground">/100</span>
          </span>
        )}
        <RatingBadge rating={rating} />
      </div>
    </div>
    <p className="flex-1 text-sm text-muted-foreground">{summary}</p>
    <div className="mt-4 flex items-center justify-between">
      <Link
        to={`/reviews/${slug}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Full Review <ArrowRight className="h-3.5 w-3.5" />
      </Link>
      {websiteUrl && (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  </article>
);

export default ReviewCard;
