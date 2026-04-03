import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";

interface GradientData {
  gradient_color_from: string | null;
  gradient_color_to: string | null;
  gradient_dark_from: string | null;
  gradient_dark_to: string | null;
}

export function useThemeGradient() {
  const { resolvedTheme } = useTheme();

  const { data } = useQuery({
    queryKey: ["public-profile-gradient"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("gradient_color_from, gradient_color_to, gradient_dark_from, gradient_dark_to")
        .maybeSingle();
      if (error) throw error;
      return data as GradientData | null;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!data) return;
    const root = document.documentElement;
    const isDark = resolvedTheme === "dark";

    const from = isDark
      ? (data.gradient_dark_from || data.gradient_color_from)
      : data.gradient_color_from;
    const to = isDark
      ? (data.gradient_dark_to || data.gradient_color_to)
      : data.gradient_color_to;

    if (from) {
      root.style.setProperty("--healthcare-blue", from);
      root.style.setProperty("--primary", from);
      root.style.setProperty("--ring", from);
      root.style.setProperty("--sidebar-primary", from);
      root.style.setProperty("--sidebar-ring", from);
    }
    if (to) {
      root.style.setProperty("--healthcare-teal", to);
      root.style.setProperty("--accent", to);
      root.style.setProperty("--healthcare-pulse", to);
    }
  }, [data, resolvedTheme]);
}
