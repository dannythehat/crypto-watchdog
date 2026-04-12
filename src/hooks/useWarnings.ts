import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWarnings = () =>
  useQuery({
    queryKey: ["warnings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warnings")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useWarning = (slug: string) =>
  useQuery({
    queryKey: ["warning", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warnings")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
