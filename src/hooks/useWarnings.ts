import { useQuery } from "@tanstack/react-query";
import { warnings, getWarning } from "@/content";

// Content is bundled from the repo (src/content) — no network call.
export const useWarnings = () =>
  useQuery({ queryKey: ["warnings"], queryFn: async () => warnings });

export const useWarning = (slug: string) =>
  useQuery({
    queryKey: ["warning", slug],
    queryFn: async () => getWarning(slug),
    enabled: !!slug,
  });
