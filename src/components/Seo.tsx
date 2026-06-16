import { useEffect } from "react";
import { SITE, absoluteUrl } from "@/lib/seo";

interface SeoProps {
  title: string;
  description?: string;
  path: string;                 // canonical path, e.g. /blog/my-slug
  image?: string | null;
  type?: "article" | "website";
  jsonLd?: (Record<string, unknown> | null)[];
}

/**
 * Dependency-free <head> manager. Sets title, description, canonical, Open
 * Graph / Twitter tags and JSON-LD for the current page, then restores the
 * document title on unmount. Tags it adds are marked data-seo so they are
 * replaced (not duplicated) on navigation.
 */
const Seo = ({ title, description, path, image, type = "article", jsonLd = [] }: SeoProps) => {
  useEffect(() => {
    const fullTitle = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
    const url = absoluteUrl(path);
    const img = image || `${SITE.baseUrl}/og-default.png`;
    const prevTitle = document.title;
    document.title = fullTitle;

    const managed: HTMLElement[] = [];
    const meta = (attr: "name" | "property", key: string, content?: string) => {
      if (!content) return;
      const el = document.createElement("meta");
      el.setAttribute(attr, key);
      el.setAttribute("content", content);
      el.setAttribute("data-seo", "");
      document.head.appendChild(el);
      managed.push(el);
    };

    // canonical
    const link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", url);
    link.setAttribute("data-seo", "");
    document.head.appendChild(link);
    managed.push(link);

    meta("name", "description", description);
    meta("property", "og:title", fullTitle);
    meta("property", "og:description", description);
    meta("property", "og:type", type);
    meta("property", "og:url", url);
    meta("property", "og:image", img);
    meta("property", "og:site_name", SITE.name);
    meta("name", "twitter:card", "summary_large_image");
    meta("name", "twitter:title", fullTitle);
    meta("name", "twitter:description", description);
    meta("name", "twitter:image", img);

    for (const data of jsonLd) {
      if (!data) continue;
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute("data-seo", "");
      s.text = JSON.stringify(data);
      document.head.appendChild(s);
      managed.push(s);
    }

    return () => {
      managed.forEach((el) => el.remove());
      document.title = prevTitle;
    };
  }, [title, description, path, image, type, JSON.stringify(jsonLd)]);

  return null;
};

export default Seo;
