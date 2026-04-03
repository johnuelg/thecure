import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches gradient colors from the profile and applies them as CSS custom properties.
 * This overrides the default --healthcare-blue and --healthcare-teal variables at runtime.
 */
export function useThemeGradient() {
  const { data } = useQuery({
    queryKey: ["public-profile-gradient"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("gradient_color_from, gradient_color_to")
        .maybeSingle();
      if (error) throw error;
      return data as { gradient_color_from: string | null; gradient_color_to: string | null } | null;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!data) return;
    const root = document.documentElement;
    if (data.gradient_color_from) {
      root.style.setProperty("--healthcare-blue", data.gradient_color_from);
    }
    if (data.gradient_color_to) {
      root.style.setProperty("--healthcare-teal", data.gradient_color_to);
    }
  }, [data]);
}
