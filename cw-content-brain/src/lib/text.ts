export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function countWords(input: string): number {
  const words = input.trim().match(/\b[\w'-]+\b/g);
  return words?.length ?? 0;
}

export function excerpt(input: string, maxLength = 180): string {
  const compact = input.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) {
    return compact;
  }
  return `${compact.slice(0, maxLength - 1).trim()}...`;
}

export function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTag(html: string, tag: string): string | undefined {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripHtml(match[1]) : undefined;
}

export function extractMetaDescription(html: string): string | undefined {
  const match = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  return match?.[1]?.trim();
}

export function extractCanonical(html: string): string | undefined {
  const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  return match?.[1]?.trim();
}

export function extractTags(html: string, tag: string): string[] {
  return Array.from(html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi")))
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);
}

export function countImages(html: string): { imageCount: number; imagesMissingAlt: number } {
  const images = Array.from(html.matchAll(/<img\b[^>]*>/gi)).map((match) => match[0]);
  const imagesMissingAlt = images.filter((image) => !/\salt=["'][^"']+["']/i.test(image)).length;
  return { imageCount: images.length, imagesMissingAlt };
}

export function hasAffiliateDisclosure(input: string): boolean {
  return /affiliate|commission|compensation|sponsored|referral/i.test(input);
}
