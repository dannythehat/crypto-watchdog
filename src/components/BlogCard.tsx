import { Link } from "react-router-dom";
import { CalendarDays, ArrowRight } from "lucide-react";

interface Props {
  title: string;
  slug: string;
  summary?: string | null;
  category?: string | null;
  publishedAt?: string | null;
}

const BlogCard = ({ title, slug, summary, category, publishedAt }: Props) => (
  <article className="flex flex-col rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md">
    {category && (
      <span className="mb-3 inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        {category}
      </span>
    )}
    <h3 className="font-heading text-lg leading-snug">{title}</h3>
    {summary && (
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{summary}</p>
    )}
    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
      {publishedAt && (
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {new Date(publishedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      )}
      <Link
        to={`/blog/${slug}`}
        className="flex items-center gap-1 text-primary hover:underline"
      >
        Read more <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  </article>
);

export default BlogCard;
