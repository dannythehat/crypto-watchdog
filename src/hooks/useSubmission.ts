import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SubmissionData {
  platform_name: string;
  platform_url?: string;
  category?: string;
  user_email?: string;
  message?: string;
}

export const useSubmission = () =>
  useMutation({
    mutationFn: async (data: SubmissionData) => {
      const { error } = await supabase.from("submissions").insert(data);
      if (error) throw error;
    },
  });
