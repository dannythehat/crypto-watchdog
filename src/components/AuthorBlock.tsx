import { CalendarDays } from "lucide-react";
import { DEFAULT_AUTHOR, type Author } from "@/lib/seo";

// E-E-A-T byline shown on reviews, blog posts and warnings. Names a real,
// credentialed author so readers (and Google) can see who stands behind the
// content. Falls back to the brand-config identity when a post has no author
// frontmatter (doc 09). Pure presentation — the matching JSON-LD Person is
// emitted separately via seo.ts.
interface AuthorBlockProps {
  author?: Author | null;
  date?: string | null;
  updated?: string | null;
  className?: string;
}

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;

const AuthorBlock = ({ author, date, updated, className = "" }: AuthorBlockProps) => {
  const a: Author = { ...DEFAULT_AUTHOR, ...(author || {}) };
  const initials = a.name.split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const published = fmt(date);
  const wasUpdated = fmt(updated);
  const showUpdated = wasUpdated && wasUpdated !== published;

  return (
    <div className={`flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4 ${className}`}>
      {a.image ? (
        <img src={a.image} alt={a.name} className="h-11 w-11 rounded-full object-cover ring-1 ring-border" loading="lazy" />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary ring-1 ring-primary/20">
          {initials}
        </div>
      )}
      <div className="min-w-0 text-sm">
        <p className="font-heading font-semibold text-foreground">
          By{" "}
          {a.url ? (
            <a href={a.url} className="hover:text-primary hover:underline">{a.name}</a>
          ) : (
            a.name
          )}
        </p>
        {a.credentials && <p className="text-xs leading-snug text-muted-foreground">{a.credentials}</p>}
        {(published || showUpdated) && (
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            {published && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> {published}
              </span>
            )}
            {showUpdated && <span>· Updated {wasUpdated}</span>}
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthorBlock;
