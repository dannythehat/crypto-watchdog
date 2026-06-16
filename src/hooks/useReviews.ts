import { useQuery } from "@tanstack/react-query";
import { getReview, getReviewsByCategory } from "@/content";

// Content is bundled from the repo (src/content) — no network call.
export const useReviews = (categorySlug?: string) =>
  useQuery({
    queryKey: ["reviews", categorySlug],
    queryFn: async () => getReviewsByCategory(categorySlug),
  });

export const useReview = (slug: string) =>
  useQuery({
    queryKey: ["review", slug],
    queryFn: async () => getReview(slug),
    enabled: !!slug,
  });
