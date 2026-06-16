import { useQuery } from "@tanstack/react-query";
import { categories } from "@/content";

// Content is bundled from the repo (src/content) — no network call.
export const useCategories = () =>
  useQuery({ queryKey: ["categories"], queryFn: async () => categories });
