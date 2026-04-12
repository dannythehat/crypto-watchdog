import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useReviews = (categorySlug?: string) =>
  useQuery({
    queryKey: ["reviews", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select("*, categories(name, slug)")
        .order("created_at", { ascending: false });

      if (categorySlug) {
        query = query.eq("categories.slug", categorySlug);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter out rows where category didn't match the join filter
      if (categorySlug) {
        return (data ?? []).filter((r: any) => r.categories !== null);
      }
      return data ?? [];
    },
  });

export const useReview = (slug: string) =>
  useQuery({
    queryKey: ["review", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, categories(name, slug)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
