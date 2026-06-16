import { useQuery } from "@tanstack/react-query";
import { blogPosts, getBlogPost } from "@/content";

// Content is bundled from the repo (src/content) — no network call.
export const useBlogPosts = () =>
  useQuery({ queryKey: ["blog-posts"], queryFn: async () => blogPosts });

export const useBlogPost = (slug: string) =>
  useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => getBlogPost(slug),
    enabled: !!slug,
  });
