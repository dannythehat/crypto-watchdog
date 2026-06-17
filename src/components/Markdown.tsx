import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * Dependency-free markdown renderer for article content.
 * Supports: ## / ### headings, paragraphs, - and 1. lists, > blockquotes,
 * --- rules, ![alt](url) images, [text](url) links (internal links use
 * react-router), **bold**, *italic*, and `inline code`.
 *
 * Intentionally small and defensive — content comes from our own CMS, but we
 * still render text safely (no dangerouslySetInnerHTML / raw HTML execution).
 */

const SITE_HOSTS = ["cryptowatchdog.net", "www.cryptowatchdog.net"];

function isInternal(href: string): boolean {
  if (href.startsWith("/")) return true;
  const m = href.match(/^https?:\/\/([^/]+)(\/[^\s]*)?/i);
  return !!m && SITE_HOSTS.some((h) => m[1] === h || m[1].endsWith("." + h));
}

function toPath(href: string): string {
  if (href.startsWith("/")) return href;
  const m = href.match(/^https?:\/\/[^/]+(\/[^\s]*)?/i);
  return m?.[1] || "/";
}

// Inline tokens, longest/most-specific first. Bold/italic/link recurse so
// nesting like **[text](/x)** renders correctly. A fresh regex is created per
// call because recursion would otherwise clobber a shared lastIndex.
const INLINE_SOURCE = "!\\[([^\\]]*)\\]\\(([^)\\s]+)\\)|\\[([^\\]]+)\\]\\(([^)\\s]+)\\)|\\*\\*([^*]+)\\*\\*|\\*([^*]+)\\*|`([^`]+)`";

function renderInline(text: string, keyBase: string): ReactNode[] {
  const re = new RegExp(INLINE_SOURCE, "g");
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(<Fragment key={`${keyBase}-t${i}`}>{text.slice(last, m.index)}</Fragment>);
    const key = `${keyBase}-i${i}`;
    if (m[2] !== undefined && m[1] !== undefined && m[0].startsWith("!")) {
      out.push(
        <img key={key} src={m[2]} alt={m[1]} loading="lazy" className="my-7 w-full rounded-2xl border border-border shadow-lg ring-1 ring-foreground/5" />,
      );
    } else if (m[3] !== undefined && m[4] !== undefined) {
      const href = m[4];
      const children = renderInline(m[3], key);
      out.push(
        isInternal(href) ? (
          <Link key={key} to={toPath(href)} className="font-medium text-primary underline underline-offset-2 hover:opacity-80">{children}</Link>
        ) : (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-primary underline underline-offset-2 hover:opacity-80">{children}</a>
        ),
      );
    } else if (m[5] !== undefined) {
      out.push(<strong key={key} className="font-semibold text-foreground">{renderInline(m[5], key)}</strong>);
    } else if (m[6] !== undefined) {
      out.push(<em key={key}>{renderInline(m[6], key)}</em>);
    } else if (m[7] !== undefined) {
      out.push(<code key={key} className="rounded bg-muted px-1.5 py-0.5 text-sm">{m[7]}</code>);
    }
    last = m.index + m[0].length;
    i += 1;
  }
  if (last < text.length) out.push(<Fragment key={`${keyBase}-t${i}`}>{text.slice(last)}</Fragment>);
  return out;
}

const Markdown = ({ content }: { content: string }) => {
  const lines = (content || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let quote: string[] = [];
  let k = 0;

  const flushPara = () => {
    if (para.length) {
      const key = `p${k++}`;
      blocks.push(<p key={key} className="mb-4 leading-relaxed text-muted-foreground">{renderInline(para.join(" "), key)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const key = `l${k++}`;
      const items = list.items.map((it, idx) => <li key={`${key}-${idx}`} className="leading-relaxed">{renderInline(it, `${key}-${idx}`)}</li>);
      blocks.push(
        list.ordered
          ? <ol key={key} className="mb-4 ml-6 list-decimal space-y-1.5 text-muted-foreground">{items}</ol>
          : <ul key={key} className="mb-4 ml-6 list-disc space-y-1.5 text-muted-foreground">{items}</ul>,
      );
      list = null;
    }
  };
  const flushQuote = () => {
    if (!quote.length) return;
    const key = `q${k++}`;
    const lines = [...quote];
    // GitHub-style admonitions: > [!WARNING] / [!DANGER] / [!CAUTION] => red; [!NOTE]/[!TIP]/[!INFO] => blue
    const m = lines[0].match(/^\[!(WARNING|DANGER|CAUTION|NOTE|TIP|INFO)\]\s*(.*)$/i);
    let danger = false;
    if (m) {
      const kind = m[1].toUpperCase();
      danger = kind === "WARNING" || kind === "DANGER" || kind === "CAUTION";
      lines[0] = m[2];
      if (!lines[0]) lines.shift();
    }
    const cls = danger
      ? "my-6 rounded-xl border border-rating-red/40 border-l-4 border-l-rating-red bg-rating-red/10 px-5 py-4 font-medium text-foreground backdrop-blur"
      : "my-6 rounded-xl border border-primary/20 border-l-4 border-l-primary bg-primary/[0.06] px-5 py-4 text-muted-foreground backdrop-blur";
    blocks.push(<blockquote key={key} className={cls}>{renderInline(lines.join(" "), key)}</blockquote>);
    quote = [];
  };
  const flushAll = () => { flushPara(); flushList(); flushQuote(); };

  const splitRow = (row: string) => row.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());

  for (let li = 0; li < lines.length; li++) {
    const raw = lines[li];
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed === "") { flushAll(); continue; }

    // GFM table: header row followed by a |---|---| separator
    if (trimmed.includes("|") && /^\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)+\|?$/.test((lines[li + 1] || "").trim())) {
      flushAll();
      const header = splitRow(trimmed);
      li += 1; // skip separator
      const rows: string[][] = [];
      while (li + 1 < lines.length && lines[li + 1].includes("|") && lines[li + 1].trim() !== "") {
        li += 1;
        rows.push(splitRow(lines[li].trim()));
      }
      const key = `tbl${k++}`;
      blocks.push(
        <div key={key} className="my-8 overflow-hidden rounded-2xl border border-border bg-card/60 shadow-lg backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
                  {header.map((c, i) => <th key={i} className="px-4 py-3.5 text-left font-heading text-sm font-semibold text-foreground">{renderInline(c, `${key}-h${i}`)}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, ri) => (
                  <tr key={ri} className="border-t border-border/50 transition-colors hover:bg-foreground/[0.03]">
                    {r.map((c, ci) => <td key={ci} className={`px-4 py-3 align-top ${ci === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{renderInline(c, `${key}-${ri}-${ci}`)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>,
      );
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) { flushAll(); blocks.push(<hr key={`hr${k++}`} className="my-8 border-border" />); continue; }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushAll();
      const level = Math.min(Math.max(heading[1].length, 2), 6);
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      const cls = level === 2 ? "mt-10 mb-3 font-heading text-2xl font-semibold text-foreground"
        : level === 3 ? "mt-8 mb-2 font-heading text-xl font-semibold text-foreground"
        : "mt-6 mb-2 font-heading text-lg font-semibold text-foreground";
      const key = `h${k++}`;
      blocks.push(<Tag key={key} className={cls}>{renderInline(heading[2], key)}</Tag>);
      continue;
    }

    const quoteLine = trimmed.match(/^>\s?(.*)$/);
    if (quoteLine) { flushPara(); flushList(); quote.push(quoteLine[1]); continue; }

    const ol = trimmed.match(/^\d+\.\s+(.*)$/);
    const ul = trimmed.match(/^[-*]\s+(.*)$/);
    if (ol || ul) {
      flushPara(); flushQuote();
      const ordered = !!ol;
      if (!list || list.ordered !== ordered) { flushList(); list = { ordered, items: [] }; }
      list.items.push((ol ? ol[1] : ul![1]));
      continue;
    }

    flushList(); flushQuote();
    para.push(trimmed);
  }
  flushAll();

  return <>{blocks}</>;
};

export default Markdown;
