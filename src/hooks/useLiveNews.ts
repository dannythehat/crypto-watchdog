import { useEffect, useState } from "react";
import { newsByDateDesc, type NewsItem, type NewsTag } from "@/content/news";

// Pulls live headlines from the free, keyless crypto-news API at runtime, then
// falls back to the curated baked-in feed if the API is unreachable or blocks
// CORS. The baked feed is always shown first so the page is never empty.

const API = "https://cryptocurrency.cv/api/news?limit=18";

const pick = (o: any, keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = k.split(".").reduce((a: any, p) => (a == null ? a : a[p]), o);
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
};

// The free feed mixes in general UK/finance stories — keep only crypto-relevant.
const CRYPTO_RE = /\b(crypto|bitcoin|btc|ethereum|eth|blockchain|defi|stablecoin|altcoin|token|nft|web3|binance|coinbase|kraken|solana|xrp|ripple|memecoin|on-chain|wallet|exchange|airdrop|staking|halving|sec\s|etf)\b/i;
const isCrypto = (text: string) => CRYPTO_RE.test(text);

const tagFor = (text: string): NewsTag => {
  const t = text.toLowerCase();
  if (/(hack|exploit|scam|drain|breach|phish|stolen|rug)/.test(t)) return "Security";
  if (/(sec|cftc|regulat|law|bill|congress|fca|lawsuit|court)/.test(t)) return "Regulation";
  if (/(etf|blackrock|institution|fund|treasury|grayscale)/.test(t)) return "Institutional";
  if (/(token(i|ized)|rwa|real.world asset)/.test(t)) return "Tokenization";
  return "Markets";
};

const normalize = (raw: any): NewsItem | null => {
  const title = pick(raw, ["title", "headline", "name"]);
  const url = pick(raw, ["url", "link", "source_url", "article_url"]);
  if (!title || !url) return null;
  const summary = pick(raw, ["summary", "description", "excerpt", "snippet", "content"]) || "";
  const source = pick(raw, ["source.name", "source_name", "source", "publisher", "domain", "site"]) || "Source";
  const publishedAt =
    pick(raw, ["published_at", "publishedAt", "date", "pubDate", "created_at", "timestamp"]) ||
    new Date().toISOString();
  const id = pick(raw, ["id", "guid", "uuid"]) || url;
  return {
    id,
    title,
    url,
    source: typeof source === "string" ? source : "Source",
    publishedAt,
    summary: summary.length > 240 ? summary.slice(0, 239) + "…" : summary,
    tag: tagFor(`${title} ${summary}`),
  };
};

export function useLiveNews(): { items: NewsItem[]; live: boolean } {
  const [items, setItems] = useState<NewsItem[]>(newsByDateDesc);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    (async () => {
      try {
        const res = await fetch(API, { signal: ctrl.signal });
        if (!res.ok) return;
        const data = await res.json();
        const list: any[] = Array.isArray(data)
          ? data
          : data.data || data.news || data.articles || data.results || data.items || [];
        const mapped = (list.map(normalize).filter(Boolean) as NewsItem[])
          .filter((m) => isCrypto(`${m.title} ${m.summary}`));
        if (mapped.length >= 3) {
          // keep our curated items (with Watchdog takes) on top, then fresh API items
          const seen = new Set(newsByDateDesc.map((n) => n.url));
          const merged = [...newsByDateDesc, ...mapped.filter((m) => !seen.has(m.url))];
          merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
          setItems(merged);
          setLive(true);
        }
      } catch {
        /* keep baked fallback */
      } finally {
        clearTimeout(timer);
      }
    })();
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, []);

  return { items, live };
}
