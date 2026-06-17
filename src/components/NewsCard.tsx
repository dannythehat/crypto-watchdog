import { ExternalLink, ShieldCheck } from "lucide-react";
import { type NewsItem, TAG_TONE } from "@/content/news";
import { trackEvent } from "@/lib/analytics";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const NewsCard = ({ item }: { item: NewsItem }) => (
  <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
    <div className="relative flex items-center justify-between gap-2 text-xs">
      <span className={`font-semibold uppercase tracking-wide ${TAG_TONE[item.tag]}`}>{item.tag}</span>
      <time className="text-muted-foreground" dateTime={item.publishedAt}>{fmtDate(item.publishedAt)}</time>
    </div>
    <h3 className="relative mt-2 font-heading text-base font-semibold leading-snug">{item.title}</h3>
    <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>

    {item.watchdogTake && (
      <div className="relative mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary"><ShieldCheck className="h-3.5 w-3.5" /> Watchdog take</span>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.watchdogTake}</p>
      </div>
    )}

    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={() => trackEvent("news_click", { news_id: item.id, source: item.source })}
      className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      {item.source} <ExternalLink className="h-3.5 w-3.5" />
    </a>
  </article>
);

export default NewsCard;
