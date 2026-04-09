import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileBranding {
  logo_url: string | null;
  full_name: string;
  brand_name: string | null;
  brand_name_image_url: string | null;
  favicon_url: string | null;
  site_title: string | null;
  site_description: string | null;
}

/**
 * Single source of truth for profile branding data.
 * Every component that needs logo/brand info should use this hook
 * to avoid cache collisions from different column selections.
 */
export function useProfileBranding() {
  return useQuery<ProfileBranding | null>({
    queryKey: ["profile-branding"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profile")
        .select(
          "logo_url, full_name, brand_name, brand_name_image_url, favicon_url, site_title, site_description"
        )
        .maybeSingle();
      return data as ProfileBranding | null;
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
